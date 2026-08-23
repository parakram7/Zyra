-- RescueLink: helper functions, triggers, and transactional RPCs
-- All state-changing workflow actions go through SECURITY DEFINER RPCs so that
-- (a) concurrent claims are race-safe (row locking inside a transaction), and
-- (b) every transition is written to rescue_status_history / rescue_activity
--     and RLS does not need to grant broad UPDATE rights to every role.

-- =========================================================================
-- GENERIC HELPERS
-- =========================================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger trg_rescues_updated_at before update on rescues
  for each row execute function set_updated_at();
create trigger trg_donor_profiles_updated_at before update on donor_profiles
  for each row execute function set_updated_at();
create trigger trg_transport_requests_updated_at before update on transport_requests
  for each row execute function set_updated_at();
create trigger trg_chapters_updated_at before update on chapters
  for each row execute function set_updated_at();

create or replace function current_profile_id()
returns uuid language sql stable as $$
  select auth.uid();
$$;

create or replace function is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_verified_volunteer()
returns boolean language sql stable as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role in ('volunteer', 'admin')
      and verification_status = 'verified'
  );
$$;

create or replace function my_chapter_id()
returns uuid language sql stable as $$
  select chapter_id from profiles where id = auth.uid();
$$;

-- =========================================================================
-- RESCUE CODE GENERATION (RSC-[CHAPTER]-000123)
-- =========================================================================

create sequence if not exists rescue_code_seq;

create or replace function generate_rescue_code()
returns trigger language plpgsql as $$
declare
  chapter_code text;
  next_val bigint;
begin
  if new.code is null then
    select code into chapter_code from chapters where id = new.chapter_id;
    next_val := nextval('rescue_code_seq');
    new.code := 'RSC-' || coalesce(chapter_code, 'GEN') || '-' || lpad(next_val::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger trg_rescue_code before insert on rescues
  for each row execute function generate_rescue_code();

-- =========================================================================
-- MEALS ESTIMATE (server-side fallback so the assumption lives in one place)
-- =========================================================================

create or replace function estimate_meals_for_rescue(p_rescue_id uuid)
returns int language plpgsql as $$
declare
  total_kg numeric := 0;
  meals_per_kg numeric;
  chapter uuid;
begin
  select chapter_id into chapter from rescues where id = p_rescue_id;
  select c.meals_per_kg into meals_per_kg from chapters c where c.id = chapter;

  select coalesce(sum(
    case
      when unit = 'kg' then quantity
      when unit = 'litres' then quantity
      when unit = 'trays' then quantity * 8
      when unit = 'containers' then quantity * 3
      when unit = 'packets' then quantity * 1
      when unit = 'servings' then quantity / greatest(meals_per_kg, 0.1)
      else quantity
    end
  ), 0) into total_kg
  from rescue_food_items where rescue_id = p_rescue_id;

  return greatest(round(total_kg * coalesce(meals_per_kg, 2.2))::int, 0);
end;
$$;

-- =========================================================================
-- STATUS HISTORY + ACTIVITY LOGGING
-- =========================================================================

create or replace function log_rescue_status_change()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'UPDATE' and new.status is distinct from old.status) then
    insert into rescue_status_history (rescue_id, previous_status, new_status, changed_by, note)
    values (new.id, old.status, new.status, auth.uid(), null);

    insert into rescue_activity (rescue_id, actor_id, message)
    values (new.id, auth.uid(), 'Status changed to ' || replace(new.status::text, '_', ' '));
  elsif (tg_op = 'INSERT') then
    insert into rescue_status_history (rescue_id, previous_status, new_status, changed_by, note)
    values (new.id, null, new.status, auth.uid(), 'Rescue submitted');

    insert into rescue_activity (rescue_id, actor_id, message)
    values (new.id, auth.uid(), 'Rescue submitted');
  end if;
  return new;
end;
$$;

create trigger trg_rescue_status_log after insert or update on rescues
  for each row execute function log_rescue_status_change();

-- =========================================================================
-- AUTO-CREATE TRANSPORT REQUEST + ESTIMATE ON RESCUE INSERT
-- =========================================================================

create or replace function bootstrap_transport_request()
returns trigger language plpgsql as $$
declare
  base numeric; per_km numeric; mult jsonb; size_mult numeric;
  vehicle text;
begin
  select transport_base_charge, transport_per_km, transport_size_multiplier
    into base, per_km, mult
  from chapters where id = new.chapter_id;

  size_mult := coalesce((mult ->> new.load_size::text)::numeric, 1);

  vehicle := case new.load_size
    when 'small' then 'Two-wheeler / small car'
    when 'medium' then 'Car'
    when 'large' then 'SUV / Van'
    when 'very_large' then 'Commercial vehicle (Van / Porter-type)'
  end;

  insert into transport_requests (
    rescue_id, status, recommended_vehicle,
    estimated_charge_low, estimated_charge_high
  ) values (
    new.id,
    case
      when new.donor_transport_availability = 'yes_completely' then 'not_required'
      else 'needed'
    end,
    vehicle,
    round(base * size_mult),
    round(base * size_mult * 1.6 + per_km * 8)
  );

  return new;
end;
$$;

create trigger trg_bootstrap_transport_request after insert on rescues
  for each row execute function bootstrap_transport_request();

-- =========================================================================
-- DONOR PROFILE UPSERT + STATS
-- =========================================================================

create or replace function upsert_donor_profile(
  p_phone text, p_name text, p_org text, p_donor_type donor_type, p_auth_user uuid
) returns uuid language plpgsql security definer as $$
declare
  did uuid;
begin
  select id into did from donor_profiles where phone = p_phone;
  if did is null then
    insert into donor_profiles (phone, name, organisation_name, donor_type, auth_user_id, total_requests)
    values (p_phone, p_name, p_org, p_donor_type, p_auth_user, 1)
    returning id into did;
  else
    update donor_profiles
      set total_requests = total_requests + 1,
          name = coalesce(p_name, name),
          organisation_name = coalesce(p_org, organisation_name),
          donor_type = coalesce(p_donor_type, donor_type)
      where id = did;
  end if;
  return did;
end;
$$;

create or replace function update_donor_stats_on_status()
returns trigger language plpgsql as $$
begin
  if new.donor_profile_id is null then return new; end if;

  if new.status = 'completed' and old.status is distinct from 'completed' then
    update donor_profiles
      set successful_rescues = successful_rescues + 1, last_donation_at = now()
      where id = new.donor_profile_id;
  elsif new.status in ('cancelled', 'donor_unavailable') and old.status not in ('cancelled', 'donor_unavailable') then
    update donor_profiles
      set cancelled_requests = cancelled_requests + 1
      where id = new.donor_profile_id;
  end if;
  return new;
end;
$$;

create trigger trg_donor_stats after update on rescues
  for each row execute function update_donor_stats_on_status();

-- =========================================================================
-- VOLUNTEER PROFILE STATS ON COMPLETION
-- =========================================================================

create or replace function apply_completion_stats()
returns trigger language plpgsql as $$
declare
  meals numeric;
  kg numeric;
  a record;
  hrs numeric;
begin
  if new.status = 'completed' and old.status is distinct from 'completed' then
    select coalesce(sum(meals_distributed), new.estimated_meals, 0) into meals
      from distribution_records where rescue_id = new.id;
    kg := coalesce(new.actual_quantity_kg, 0);

    for a in select profile_id, joined_at from rescue_assignments
      where rescue_id = new.id and status <> 'cancelled'
    loop
      hrs := greatest(extract(epoch from (now() - a.joined_at)) / 3600.0, 0.25);
      update profiles set
        rescues_completed = rescues_completed + 1,
        meals_rescued = meals_rescued + coalesce(meals, 0),
        kg_rescued = kg_rescued + kg,
        hours_volunteered = hours_volunteered + hrs
      where id = a.profile_id;
    end loop;

    update profiles set transport_contributions = transport_contributions + 1
      where id in (select profile_id from transport_offers where rescue_id = new.id and status = 'assigned');
  end if;
  return new;
end;
$$;

create trigger trg_apply_completion_stats after update on rescues
  for each row execute function apply_completion_stats();

-- =========================================================================
-- NOTIFICATIONS
-- =========================================================================

create or replace function notify(p_recipient uuid, p_type notification_type, p_title text, p_message text, p_rescue uuid)
returns void language sql security definer as $$
  insert into notifications (recipient_id, type, title, message, rescue_id)
  values (p_recipient, p_type, p_title, p_message, p_rescue);
$$;

create or replace function notify_chapter_on_open()
returns trigger language plpgsql as $$
begin
  if new.status = 'open' and (old.status is distinct from 'open') then
    insert into notifications (recipient_id, type, title, message, rescue_id)
    select p.id, 'new_urgent_rescue', 'New food call: ' || new.venue_name,
           new.area || ' — pickup needed by ' || to_char(new.collection_deadline, 'HH12:MI AM'),
           new.id
    from profiles p
    where p.chapter_id = new.chapter_id
      and p.role in ('volunteer', 'admin')
      and p.verification_status = 'verified';
  end if;
  return new;
end;
$$;

create trigger trg_notify_chapter_on_open after update on rescues
  for each row execute function notify_chapter_on_open();

create or replace function notify_lead_on_join()
returns trigger language plpgsql as $$
declare
  lead_id uuid;
  joiner_name text;
  rname text;
begin
  if new.role = 'volunteer' and tg_op = 'INSERT' then
    select profile_id into lead_id from rescue_assignments
      where rescue_id = new.rescue_id and role = 'rescue_lead' and status <> 'cancelled';
    select full_name into joiner_name from profiles where id = new.profile_id;
    select venue_name into rname from rescues where id = new.rescue_id;
    if lead_id is not null and lead_id <> new.profile_id then
      perform notify(lead_id, 'volunteer_joined', 'Volunteer joined',
        coalesce(joiner_name, 'A volunteer') || ' joined ' || coalesce(rname, 'your rescue'), new.rescue_id);
    end if;
    insert into rescue_activity (rescue_id, actor_id, message)
      values (new.rescue_id, new.profile_id, coalesce(joiner_name, 'A volunteer') || ' joined the rescue');
  end if;
  return new;
end;
$$;

create trigger trg_notify_lead_on_join after insert on rescue_assignments
  for each row execute function notify_lead_on_join();

-- =========================================================================
-- WORKFLOW RPCs
-- =========================================================================

-- Claim a rescue as lead. Race-safe via row lock + partial unique index.
create or replace function claim_rescue(p_rescue_id uuid)
returns rescues language plpgsql security definer as $$
declare
  r rescues;
begin
  if not is_verified_volunteer() then
    raise exception 'Only verified volunteers can claim a rescue';
  end if;

  select * into r from rescues where id = p_rescue_id for update;
  if r.id is null then
    raise exception 'Rescue not found';
  end if;
  if r.status not in ('open', 'submitted') then
    raise exception 'Rescue is no longer open to be claimed';
  end if;

  insert into rescue_assignments (rescue_id, profile_id, role, status)
  values (p_rescue_id, auth.uid(), 'rescue_lead', 'joined');

  update rescues set status = 'volunteer_assigned', claimed_at = now()
    where id = p_rescue_id
    returning * into r;

  return r;
exception
  when unique_violation then
    raise exception 'Someone already claimed this rescue';
end;
$$;

-- Join a rescue as a supporting volunteer/driver.
create or replace function join_rescue(p_rescue_id uuid, p_role assignment_role default 'volunteer', p_transport_note text default null)
returns rescues language plpgsql security definer as $$
declare
  r rescues;
begin
  if not is_verified_volunteer() then
    raise exception 'Only verified volunteers can join a rescue';
  end if;

  select * into r from rescues where id = p_rescue_id for update;
  if r.id is null then raise exception 'Rescue not found'; end if;
  if r.status in ('completed','cancelled','rejected','food_unsuitable','donor_unavailable','duplicate_request') then
    raise exception 'This rescue is closed';
  end if;

  insert into rescue_assignments (rescue_id, profile_id, role, status, transport_contribution)
  values (p_rescue_id, auth.uid(), p_role, 'joined', p_transport_note)
  on conflict (rescue_id, profile_id) do update
    set status = 'joined', left_at = null, leave_reason = null;

  if r.status = 'volunteer_assigned' then
    update rescues set status = 'team_forming' where id = p_rescue_id;
  end if;

  select * into r from rescues where id = p_rescue_id;
  return r;
end;
$$;

create or replace function leave_rescue(p_rescue_id uuid, p_reason text)
returns void language plpgsql security definer as $$
begin
  update rescue_assignments
    set status = 'cancelled', left_at = now(), leave_reason = p_reason
    where rescue_id = p_rescue_id and profile_id = auth.uid();

  insert into rescue_activity (rescue_id, actor_id, message)
    select p_rescue_id, auth.uid(), full_name || ' left the rescue' from profiles where id = auth.uid();
end;
$$;

-- Generic assignment status update (en route / at pickup / completed) for the calling volunteer.
create or replace function update_my_assignment_status(p_rescue_id uuid, p_status assignment_status)
returns void language plpgsql security definer as $$
begin
  update rescue_assignments set status = p_status
    where rescue_id = p_rescue_id and profile_id = auth.uid();

  insert into rescue_activity (rescue_id, actor_id, message)
    select p_rescue_id, auth.uid(), full_name || ' is now ' || replace(p_status::text, '_', ' ')
    from profiles where id = auth.uid();
end;
$$;

-- Donor phone confirmation by the rescue lead.
create or replace function confirm_donor_by_phone(p_rescue_id uuid)
returns void language plpgsql security definer as $$
begin
  if not is_verified_volunteer() then raise exception 'Not permitted'; end if;
  update rescues set donor_confirmed_at = now(), donor_confirmed_by = auth.uid(), phone_verified = true
    where id = p_rescue_id;
  insert into rescue_activity (rescue_id, actor_id, message)
    select p_rescue_id, auth.uid(), full_name || ' confirmed the donor by phone' from profiles where id = auth.uid();
end;
$$;

-- Generic, permission-checked rescue status transition used for the guided workflow
-- (en_route, at_pickup, collection_in_progress, collected, en_route_to_distribution, distributed).
create or replace function advance_rescue_status(p_rescue_id uuid, p_new_status rescue_status, p_note text default null)
returns rescues language plpgsql security definer as $$
declare
  r rescues;
  is_team boolean;
begin
  select exists(
    select 1 from rescue_assignments where rescue_id = p_rescue_id and profile_id = auth.uid() and status <> 'cancelled'
  ) into is_team;

  if not (is_team or is_admin()) then
    raise exception 'Only assigned team members can update this rescue';
  end if;

  update rescues set status = p_new_status,
    en_route_at = case when p_new_status = 'en_route' then now() else en_route_at end,
    at_pickup_at = case when p_new_status = 'at_pickup' then now() else at_pickup_at end,
    collected_at = case when p_new_status = 'collected' then now() else collected_at end,
    distributed_at = case when p_new_status = 'distributed' then now() else distributed_at end
  where id = p_rescue_id
  returning * into r;

  if p_note is not null then
    insert into rescue_status_history (rescue_id, previous_status, new_status, changed_by, note)
    values (p_rescue_id, r.status, p_new_status, auth.uid(), p_note);
  end if;

  return r;
end;
$$;

-- Field food assessment
create or replace function submit_food_assessment(
  p_rescue_id uuid, p_covered_ok boolean, p_unusual_smell boolean, p_visible_contamination boolean,
  p_packaging_ok boolean, p_storage_matches boolean, p_temp temperature_condition,
  p_concerns text, p_notes text, p_photo_urls text[], p_outcome assessment_outcome, p_reason text
) returns food_assessments language plpgsql security definer as $$
declare
  fa food_assessments;
begin
  if not is_verified_volunteer() then raise exception 'Only verified volunteers can record an assessment'; end if;

  insert into food_assessments (
    rescue_id, assessed_by, covered_ok, unusual_smell, visible_contamination, packaging_ok,
    storage_matches_description, temperature_condition, concerns, notes, photo_urls, outcome, do_not_collect_reason
  ) values (
    p_rescue_id, auth.uid(), p_covered_ok, p_unusual_smell, p_visible_contamination, p_packaging_ok,
    p_storage_matches, p_temp, p_concerns, p_notes, coalesce(p_photo_urls, '{}'), p_outcome, p_reason
  ) returning * into fa;

  if p_outcome = 'do_not_collect' then
    update rescues set status = 'food_unsuitable' where id = p_rescue_id;
  else
    update rescues set status = 'food_inspected' where id = p_rescue_id;
  end if;

  return fa;
end;
$$;

-- Distribution record
create or replace function record_distribution(
  p_rescue_id uuid, p_location text, p_area text, p_people int, p_meals int,
  p_notes text, p_photo_url text
) returns distribution_records language plpgsql security definer as $$
declare
  d distribution_records;
begin
  insert into distribution_records (rescue_id, location_name, area, people_served, meals_distributed, distribution_lead, notes, photo_url)
  values (p_rescue_id, p_location, p_area, p_people, p_meals, auth.uid(), p_notes, p_photo_url)
  returning * into d;

  update rescues set status = 'distributed' where id = p_rescue_id;

  return d;
end;
$$;

-- Complete a rescue
create or replace function complete_rescue(p_rescue_id uuid)
returns rescues language plpgsql security definer as $$
declare
  r rescues;
begin
  update rescues set status = 'completed', completed_at = now() where id = p_rescue_id returning * into r;
  return r;
end;
$$;

-- Admin: verify / reject a rescue submission
create or replace function admin_set_rescue_verification(p_rescue_id uuid, p_verified boolean, p_status rescue_status)
returns void language plpgsql security definer as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  update rescues set admin_verified = p_verified, admin_verified_by = auth.uid(), admin_verified_at = now(),
    status = p_status where id = p_rescue_id;
  insert into admin_actions (admin_id, action_type, target_table, target_id, details)
  values (auth.uid(), 'verify_rescue', 'rescues', p_rescue_id, jsonb_build_object('verified', p_verified, 'status', p_status));
end;
$$;

-- Admin: set volunteer verification
create or replace function admin_set_volunteer_verification(p_profile_id uuid, p_status verification_status, p_note text default null)
returns void language plpgsql security definer as $$
begin
  if not is_admin() then raise exception 'Admin only'; end if;
  update profiles set verification_status = p_status, verification_note = p_note where id = p_profile_id;
  insert into admin_actions (admin_id, action_type, target_table, target_id, details)
  values (auth.uid(), 'set_volunteer_verification', 'profiles', p_profile_id, jsonb_build_object('status', p_status));
end;
$$;

-- Cancel a rescue (donor via tracking token, or volunteer/admin)
create or replace function cancel_rescue_by_token(p_token text, p_reason text)
returns void language plpgsql security definer as $$
begin
  update rescues set status = 'cancelled', cancelled_by = 'donor', cancellation_reason = p_reason
    where tracking_token = p_token
    and status not in ('completed','distributed','collected','collection_in_progress');
end;
$$;

create or replace function cancel_rescue(p_rescue_id uuid, p_reason text)
returns void language plpgsql security definer as $$
begin
  if not (is_admin() or is_verified_volunteer()) then raise exception 'Not permitted'; end if;
  update rescues set status = 'cancelled', cancelled_by = 'volunteer', cancellation_reason = p_reason
    where id = p_rescue_id;
end;
$$;

-- Public tracking lookup: returns only donor-safe fields, no phone numbers / internal notes.
create or replace function get_tracking_status(p_token text)
returns table (
  code text,
  venue_name text,
  area text,
  status rescue_status,
  collection_deadline timestamptz,
  submitted_at timestamptz,
  claimed_at timestamptz,
  en_route_at timestamptz,
  collected_at timestamptz,
  distributed_at timestamptz,
  completed_at timestamptz,
  lead_first_name text,
  estimated_meals int
) language sql security definer stable as $$
  select r.code, r.venue_name, r.area, r.status, r.collection_deadline, r.submitted_at,
    r.claimed_at, r.en_route_at, r.collected_at, r.distributed_at, r.completed_at,
    split_part(p.full_name, ' ', 1) as lead_first_name,
    r.estimated_meals
  from rescues r
  left join rescue_assignments ra on ra.rescue_id = r.id and ra.role = 'rescue_lead' and ra.status <> 'cancelled'
  left join profiles p on p.id = ra.profile_id
  where r.tracking_token = p_token;
$$;

grant execute on function get_tracking_status(text) to anon, authenticated;
grant execute on function cancel_rescue_by_token(text, text) to anon, authenticated;
grant execute on function upsert_donor_profile(text, text, text, donor_type, uuid) to anon, authenticated;
grant execute on function estimate_meals_for_rescue(uuid) to anon, authenticated;

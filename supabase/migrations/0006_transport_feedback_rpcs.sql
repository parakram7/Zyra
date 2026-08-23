-- Additional workflow RPCs: transport coordination + post-rescue feedback.

create or replace function offer_transport(p_rescue_id uuid, p_vehicle_type transport_type, p_notes text default null)
returns transport_offers language plpgsql security definer as $$
declare
  o transport_offers;
begin
  if not is_verified_volunteer() then raise exception 'Only verified volunteers can offer transport'; end if;

  insert into transport_offers (rescue_id, profile_id, vehicle_type, notes)
  values (p_rescue_id, auth.uid(), p_vehicle_type, p_notes)
  returning * into o;

  update transport_requests set status = 'volunteer_offered', updated_at = now()
    where rescue_id = p_rescue_id and status = 'needed';

  insert into rescue_activity (rescue_id, actor_id, message)
    select p_rescue_id, auth.uid(), full_name || ' offered transport (' || p_vehicle_type::text || ')'
    from profiles where id = auth.uid();

  return o;
end;
$$;

create or replace function assign_transport_offer(p_rescue_id uuid, p_offer_id uuid)
returns void language plpgsql security definer as $$
begin
  if not (is_admin() or is_verified_volunteer()) then raise exception 'Not permitted'; end if;

  update transport_offers set status = 'assigned' where id = p_offer_id;
  update transport_offers set status = 'declined'
    where rescue_id = p_rescue_id and id <> p_offer_id and status = 'offered';

  update transport_requests set status = 'arranged', assigned_offer_id = p_offer_id, updated_at = now()
    where rescue_id = p_rescue_id;

  insert into rescue_activity (rescue_id, actor_id, message) values (p_rescue_id, auth.uid(), 'Transport arranged');
end;
$$;

create or replace function assign_transport_contact(
  p_rescue_id uuid, p_contact_id uuid, p_estimated_charge numeric default null, p_paid_by text default null
) returns void language plpgsql security definer as $$
begin
  if not (is_admin() or is_verified_volunteer()) then raise exception 'Not permitted'; end if;

  update transport_requests set
    status = 'arranged', assigned_contact_id = p_contact_id,
    actual_charge = coalesce(p_estimated_charge, actual_charge),
    paid_by = coalesce(p_paid_by, paid_by),
    updated_at = now()
  where rescue_id = p_rescue_id;

  insert into rescue_activity (rescue_id, actor_id, message)
    select p_rescue_id, auth.uid(), 'Trusted transporter arranged: ' || name
    from transport_contacts where id = p_contact_id;
end;
$$;

create or replace function set_transport_status(p_rescue_id uuid, p_status transport_status)
returns void language plpgsql security definer as $$
begin
  if not (is_admin() or is_verified_volunteer()) then raise exception 'Not permitted'; end if;
  update transport_requests set status = p_status, updated_at = now() where rescue_id = p_rescue_id;
  insert into rescue_activity (rescue_id, actor_id, message)
    values (p_rescue_id, auth.uid(), 'Transport status: ' || replace(p_status::text, '_', ' '));
end;
$$;

create or replace function submit_rescue_feedback(
  p_rescue_id uuid, p_rating int, p_biggest_delay text, p_info_needed text, p_feature_request text,
  p_worked_well text default null, p_delays text default null, p_future_notes text default null
) returns rescue_feedback language plpgsql security definer as $$
declare
  f rescue_feedback;
begin
  if not is_verified_volunteer() then raise exception 'Only verified volunteers can submit feedback'; end if;
  insert into rescue_feedback (
    rescue_id, submitted_by, rating, biggest_delay, info_needed, feature_request,
    field_notes_worked_well, field_notes_delays, field_notes_future
  ) values (
    p_rescue_id, auth.uid(), p_rating, p_biggest_delay, p_info_needed, p_feature_request,
    p_worked_well, p_delays, p_future_notes
  ) returning * into f;
  return f;
end;
$$;

create or replace function mark_notifications_read(p_ids uuid[])
returns void language sql security definer as $$
  update notifications set read = true where recipient_id = auth.uid() and id = any(p_ids);
$$;

create or replace function mark_all_notifications_read()
returns void language sql security definer as $$
  update notifications set read = true where recipient_id = auth.uid() and read = false;
$$;

-- Row Level Security policies.
-- Principles:
--  * Public tracking data is exposed ONLY through the get_tracking_status() /
--    cancel_rescue_by_token() SECURITY DEFINER functions, never direct table access.
--  * Donors can create rescues anonymously or while authenticated, and read their own.
--  * Verified volunteers/admins can see everything in their own chapter.
--  * Admins have full read/write; ordinary volunteer writes go through RPCs above.

alter table chapters enable row level security;
alter table zones enable row level security;
alter table profiles enable row level security;
alter table donor_profiles enable row level security;
alter table transport_contacts enable row level security;
alter table saved_distribution_locations enable row level security;
alter table rescues enable row level security;
alter table rescue_food_items enable row level security;
alter table rescue_assignments enable row level security;
alter table rescue_status_history enable row level security;
alter table rescue_activity enable row level security;
alter table rescue_photos enable row level security;
alter table transport_requests enable row level security;
alter table transport_offers enable row level security;
alter table food_assessments enable row level security;
alter table distribution_records enable row level security;
alter table rescue_feedback enable row level security;
alter table notifications enable row level security;
alter table admin_actions enable row level security;

-- ---------------------------------------------------------------------
-- chapters / zones: readable by anyone (needed for public signup + donor form)
-- ---------------------------------------------------------------------
create policy chapters_select_all on chapters for select using (true);
create policy chapters_admin_write on chapters for all using (is_admin()) with check (is_admin());

create policy zones_select_all on zones for select using (true);
create policy zones_admin_write on zones for insert with check (is_admin());
create policy zones_admin_update on zones for update using (is_admin());
create policy zones_admin_delete on zones for delete using (is_admin());

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_self on profiles for select using (id = auth.uid());
create policy profiles_select_chapter on profiles for select using (
  chapter_id is not null and chapter_id = my_chapter_id() and is_verified_volunteer()
);
create policy profiles_select_admin on profiles for select using (is_admin());
create policy profiles_update_self on profiles for update using (id = auth.uid())
  with check (id = auth.uid());
create policy profiles_update_admin on profiles for update using (is_admin());
create policy profiles_insert_self on profiles for insert with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- donor_profiles: not publicly readable (contains phone + history); volunteers/admins only
-- ---------------------------------------------------------------------
create policy donor_profiles_select_volunteers on donor_profiles for select using (is_verified_volunteer());
create policy donor_profiles_admin_write on donor_profiles for update using (is_admin());
create policy donor_profiles_insert_anyone on donor_profiles for insert with check (true);

-- ---------------------------------------------------------------------
-- transport_contacts / saved_distribution_locations: chapter volunteers read, admin writes
-- ---------------------------------------------------------------------
create policy transport_contacts_select on transport_contacts for select using (
  is_verified_volunteer() and chapter_id = my_chapter_id()
);
create policy transport_contacts_admin_write on transport_contacts for all using (is_admin()) with check (is_admin());

create policy saved_locations_select on saved_distribution_locations for select using (
  is_verified_volunteer() and chapter_id = my_chapter_id()
);
create policy saved_locations_admin_write on saved_distribution_locations for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- rescues
-- ---------------------------------------------------------------------
-- Anyone (including anonymous donors) may submit a new rescue request.
create policy rescues_insert_anyone on rescues for insert with check (true);

-- Verified volunteers/admins see every rescue in their chapter.
create policy rescues_select_chapter on rescues for select using (
  is_verified_volunteer() and chapter_id = my_chapter_id()
);
-- A signed-in donor can see rescues they personally created.
create policy rescues_select_own on rescues for select using (created_by = auth.uid());

create policy rescues_update_volunteers on rescues for update using (
  is_verified_volunteer() and chapter_id = my_chapter_id()
);
create policy rescues_update_admin on rescues for update using (is_admin());

-- ---------------------------------------------------------------------
-- rescue_food_items
-- ---------------------------------------------------------------------
create policy food_items_insert_with_rescue on rescue_food_items for insert with check (
  exists (select 1 from rescues r where r.id = rescue_id)
);
create policy food_items_select_chapter on rescue_food_items for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy food_items_admin_write on rescue_food_items for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- rescue_assignments
-- ---------------------------------------------------------------------
create policy assignments_select_chapter on rescue_assignments for select using (
  exists (select 1 from rescues r where r.id = rescue_id and r.chapter_id = my_chapter_id())
  and is_verified_volunteer()
);
create policy assignments_admin_all on rescue_assignments for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------
-- rescue_status_history / rescue_activity / rescue_photos
-- ---------------------------------------------------------------------
create policy status_history_select on rescue_status_history for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy activity_select on rescue_activity for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy activity_insert on rescue_activity for insert with check (is_verified_volunteer());

create policy photos_select on rescue_photos for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy photos_insert on rescue_photos for insert with check (is_verified_volunteer());

-- ---------------------------------------------------------------------
-- transport_requests / transport_offers
-- ---------------------------------------------------------------------
create policy transport_requests_select on transport_requests for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy transport_requests_write on transport_requests for update using (is_verified_volunteer());
create policy transport_requests_admin on transport_requests for all using (is_admin()) with check (is_admin());

create policy transport_offers_select on transport_offers for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy transport_offers_insert on transport_offers for insert with check (
  is_verified_volunteer() and profile_id = auth.uid()
);
create policy transport_offers_update on transport_offers for update using (is_verified_volunteer());

-- ---------------------------------------------------------------------
-- food_assessments
-- ---------------------------------------------------------------------
create policy assessments_select on food_assessments for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy assessments_insert on food_assessments for insert with check (is_verified_volunteer());

-- ---------------------------------------------------------------------
-- distribution_records
-- ---------------------------------------------------------------------
create policy distribution_select on distribution_records for select using (
  exists (select 1 from rescues r where r.id = rescue_id and (
    (is_verified_volunteer() and r.chapter_id = my_chapter_id()) or r.created_by = auth.uid()
  ))
);
create policy distribution_insert on distribution_records for insert with check (is_verified_volunteer());

-- ---------------------------------------------------------------------
-- rescue_feedback: private to volunteers/admins of the chapter
-- ---------------------------------------------------------------------
create policy feedback_select on rescue_feedback for select using (
  exists (select 1 from rescues r where r.id = rescue_id and is_verified_volunteer() and r.chapter_id = my_chapter_id())
);
create policy feedback_insert on rescue_feedback for insert with check (is_verified_volunteer());

-- ---------------------------------------------------------------------
-- notifications: strictly private to the recipient
-- ---------------------------------------------------------------------
create policy notifications_select_own on notifications for select using (recipient_id = auth.uid());
create policy notifications_update_own on notifications for update using (recipient_id = auth.uid());

-- ---------------------------------------------------------------------
-- admin_actions: admin only
-- ---------------------------------------------------------------------
create policy admin_actions_select on admin_actions for select using (is_admin());
create policy admin_actions_insert on admin_actions for insert with check (is_admin());

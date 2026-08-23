-- Reference data seed: chapter, zones, trusted transport contacts, distribution locations.
-- Safe to re-run (idempotent via fixed UUIDs + ON CONFLICT). Demo volunteer accounts, donors
-- and sample rescues are created by `npm run seed:demo` (scripts/seed-demo.mjs) using the
-- Supabase service role, since those require real auth.users records.

insert into chapters (id, name, code, contact_phone)
values ('a0000000-0000-0000-0000-000000000001', 'Robin Hood Army — Jaipur (Pilot)', 'JAI', '+91 90000 00000')
on conflict (id) do nothing;

insert into zones (id, chapter_id, name, sort_order) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'C-Scheme', 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Malviya Nagar', 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Mansarovar', 3),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Vaishali Nagar', 4),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Raja Park', 5),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Jagatpura', 6),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'Tonk Road', 7),
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'Civil Lines', 8),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'Bani Park', 9),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'Vidhyadhar Nagar', 10),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'Ajmer Road', 11),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'MI Road', 12),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'Sodala', 13),
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'Pratap Nagar', 14),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'Other', 99)
on conflict (id) do nothing;

insert into transport_contacts (id, chapter_id, name, phone, vehicle_type, preferred_zones, pricing_notes, availability_notes, active) values
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Rakesh (Tempo service)', '+91 98290 11111', 'van', array['Vaishali Nagar','Ajmer Road','Sodala'], 'Approx. ₹300-500 depending on distance', 'Available evenings 6-11 PM', true),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Suresh Auto', '+91 98290 22222', 'commercial_vehicle', array['C-Scheme','MI Road','Civil Lines'], 'Approx. ₹200-350', 'Usually available, call ahead', true),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Iqbal (Pickup owner)', '+91 98290 33333', 'commercial_vehicle', array['Malviya Nagar','Jagatpura','Pratap Nagar'], 'Approx. ₹400-600 for large loads', 'Best for large wedding pickups', true),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Ramesh Van Service', '+91 98290 44444', 'van', array['Mansarovar','Tonk Road'], 'Approx. ₹250-450', 'Available most days after 7 PM', true),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Vikram (SUV owner-driver)', '+91 98290 55555', 'suv', array['Bani Park','Vidhyadhar Nagar','Civil Lines'], 'Approx. ₹300-400', 'Weekend availability only', true)
on conflict (id) do nothing;

insert into saved_distribution_locations (id, chapter_id, name, area, category, notes, active) values
  ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Sanjay Nagar Community Kitchen', 'Sanjay Nagar', 'community', 'Regular distribution point, contact caretaker on arrival', true),
  ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Ghat Gate Night Shelter', 'Ghat Gate', 'night_shelter', 'Best after 9 PM', true),
  ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'SMS Hospital Surroundings', 'Jawahar Lal Nehru Marg', 'hospital_surroundings', 'Coordinate with security at gate 2', true),
  ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Transport Nagar Labour Settlement', 'Transport Nagar', 'labour_settlement', '', true),
  ('d0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Kalyan Path Community', 'Kalyan Path', 'community', '', true),
  ('d0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Railway Station Platform Community', 'Jaipur Junction', 'community', 'Coordinate with RPF before distribution', true)
on conflict (id) do nothing;

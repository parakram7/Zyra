-- Auto-create a profile row whenever a new Supabase Auth user signs up.
-- Expects auth signup to pass options.data with: full_name, phone, role,
-- chapter_id, preferred_zone_ids, has_transport, transport_type.

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  meta jsonb := new.raw_user_meta_data;
begin
  insert into public.profiles (
    id, role, full_name, phone, email, chapter_id, preferred_zone_ids,
    has_transport, transport_type, verification_status
  ) values (
    new.id,
    coalesce((meta ->> 'role')::user_role, 'volunteer'),
    coalesce(meta ->> 'full_name', 'New Volunteer'),
    coalesce(meta ->> 'phone', ''),
    new.email,
    nullif(meta ->> 'chapter_id', '')::uuid,
    case when meta ? 'preferred_zone_ids'
      then (select array_agg(value::uuid) from jsonb_array_elements_text(meta -> 'preferred_zone_ids'))
      else '{}'
    end,
    coalesce((meta ->> 'has_transport')::boolean, false),
    coalesce((meta ->> 'transport_type')::transport_type, 'no_vehicle'),
    case when coalesce((meta ->> 'role')::user_role, 'volunteer') = 'donor' then 'verified' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger trg_handle_new_user after insert on auth.users
  for each row execute function handle_new_user();

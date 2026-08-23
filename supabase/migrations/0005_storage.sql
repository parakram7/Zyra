-- Storage bucket for rescue photos (food assessment photos, distribution photos).
insert into storage.buckets (id, name, public)
values ('rescue-photos', 'rescue-photos', true)
on conflict (id) do nothing;

create policy "rescue-photos read" on storage.objects for select using (bucket_id = 'rescue-photos');
create policy "rescue-photos insert" on storage.objects for insert with check (
  bucket_id = 'rescue-photos' and auth.role() = 'authenticated'
);

-- Allow anyone to read users table for public listing pages
-- (covoiturage, colis, location cards and detail pages need nom/ville/photo_url)
-- Phone numbers intentionally accessible: MVP contact flow is phone-based

drop policy if exists "users: public read" on public.users;

create policy "users: public read" on public.users
  for select using (true);

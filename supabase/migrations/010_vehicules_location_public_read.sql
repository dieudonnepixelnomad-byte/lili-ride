-- Public rental listings must be visible to everyone.
-- Owners and admins keep access to non-active listings for dashboard workflows.

drop policy if exists "vehicules: public read actif" on public.vehicules;

create policy "vehicules: public read actif" on public.vehicules
  for select using (
    statut = 'actif'
    or auth.uid() = user_id
    or public.is_admin()
  );

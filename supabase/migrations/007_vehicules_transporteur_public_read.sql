-- Allows public pages to read verified vehicles (for displaying photo/details on trajet detail)
create policy "vt: public read verified"
  on public.vehicules_transporteur
  for select
  using (statut_verification = 'vérifié');

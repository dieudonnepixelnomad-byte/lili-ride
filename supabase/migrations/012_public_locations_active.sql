-- Une annonce de location validée par un administrateur (statut = actif)
-- doit être accessible depuis les pages publiques. La vérification de la
-- carte grise reste une information de conformité suivie par l'administration,
-- mais ne masque plus une annonce déjà activée.

drop policy if exists "vehicules: public read actif" on public.vehicules;

create policy "vehicules: public read actif" on public.vehicules
  for select using (
    statut = 'actif'
    or auth.uid() = user_id
    or public.is_admin()
  );

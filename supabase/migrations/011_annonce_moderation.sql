-- Workflow de moderation des annonces (trajets et locations).

alter table public.trajets drop constraint if exists trajets_statut_check;
alter table public.trajets
  add constraint trajets_statut_check
  check (statut in ('en_attente', 'actif', 'rejeté', 'suspendu', 'complet', 'annulé'));

alter table public.trajets alter column statut set default 'en_attente';
alter table public.trajets
  add column if not exists motif_moderation text,
  add column if not exists modere_par uuid references public.users(id) on delete set null,
  add column if not exists modere_le timestamptz;

alter table public.vehicules drop constraint if exists vehicules_statut_check;
alter table public.vehicules
  add constraint vehicules_statut_check
  check (statut in ('en_attente', 'actif', 'rejeté', 'suspendu'));

alter table public.vehicules alter column statut set default 'en_attente';
alter table public.vehicules
  add column if not exists motif_moderation text,
  add column if not exists modere_par uuid references public.users(id) on delete set null,
  add column if not exists modere_le timestamptz;

create index if not exists trajets_moderation_statut_idx on public.trajets(statut, created_at desc);
create index if not exists vehicules_moderation_statut_idx on public.vehicules(statut, created_at desc);

-- Empêche le contournement des routes applicatives par un appel Supabase direct.
-- Un propriétaire peut créer/modifier son contenu, mais le résultat doit rester
-- en attente. Seul un administrateur peut rendre l'annonce publique ou la modérer.
drop policy if exists "trajets: owner write" on public.trajets;
create policy "trajets: owner write" on public.trajets
  for insert with check (auth.uid() = user_id and statut = 'en_attente');

drop policy if exists "trajets: owner update" on public.trajets;
create policy "trajets: owner update" on public.trajets
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (
    public.is_admin()
    or (auth.uid() = user_id and statut = 'en_attente')
  );

drop policy if exists "vehicules: owner write" on public.vehicules;
create policy "vehicules: owner write" on public.vehicules
  for insert with check (auth.uid() = user_id and statut = 'en_attente');

drop policy if exists "vehicules: owner update" on public.vehicules;
create policy "vehicules: owner update" on public.vehicules
  for update
  using (auth.uid() = user_id or public.is_admin())
  with check (
    public.is_admin()
    or (auth.uid() = user_id and statut = 'en_attente')
  );

-- Une location publique doit avoir validé à la fois son contenu et sa carte grise.
drop policy if exists "vehicules: public read actif" on public.vehicules;
create policy "vehicules: public read actif" on public.vehicules
  for select using (
    (statut = 'actif' and statut_carte_grise = 'vérifié')
    or auth.uid() = user_id
    or public.is_admin()
  );

-- Les annonces existantes restent actives. Seules les nouvelles publications
-- et les annonces modifiees apres cette migration passent en attente.

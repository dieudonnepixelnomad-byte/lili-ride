-- Toute annonce est reliée au véhicule déjà créé dans le profil transporteur.
-- Les données techniques du véhicule restent gérées dans vehicules_transporteur.

alter table public.vehicules
  add column if not exists vehicule_transporteur_id uuid
  references public.vehicules_transporteur(id) on delete restrict;

alter table public.vehicules_transporteur
  add column if not exists annee int,
  add column if not exists couleur text,
  add column if not exists carburant text check (carburant in ('essence', 'diesel', 'hybride')),
  add column if not exists boite text check (boite in ('manuelle', 'automatique'));

create index if not exists vehicules_vehicule_transporteur_id_idx
  on public.vehicules(vehicule_transporteur_id);

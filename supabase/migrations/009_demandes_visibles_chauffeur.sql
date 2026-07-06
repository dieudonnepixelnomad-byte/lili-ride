-- ============================================================
-- Chauffeur voit les demandes traitées sur ses annonces,
-- SANS le numéro de téléphone (ni whatsapp, ni notes_support).
-- Fonction security definer : bypass RLS, filtre elle-même
-- par propriété de l'annonce + statut, et ne renvoie pas les
-- colonnes sensibles.
-- ============================================================

create or replace function public.get_demandes_annonces_chauffeur()
returns table (
  id                 uuid,
  type               text,
  trajet_id          uuid,
  vehicule_id        uuid,
  demandeur_user_id  uuid,
  nom_client         text,
  ville              text,
  photo_url          text,
  nb_places          int,
  description_colis  text,
  poids_estime       text,
  poids_kg           numeric,
  date_debut         date,
  date_fin           date,
  message            text,
  statut             text,
  created_at         timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select d.id, d.type, d.trajet_id, d.vehicule_id, d.user_id,
         coalesce(u.nom, d.nom_client), u.ville, u.photo_url,
         d.nb_places, d.description_colis, d.poids_estime, d.poids_kg,
         d.date_debut, d.date_fin, d.message, d.statut, d.created_at
  from public.demandes d
  left join public.trajets t   on t.id = d.trajet_id
  left join public.vehicules v on v.id = d.vehicule_id
  left join public.users u     on u.id = d.user_id
  where d.statut = 'traitée'
    and (t.user_id = auth.uid() or v.user_id = auth.uid())
$$;

grant execute on function public.get_demandes_annonces_chauffeur() to authenticated;

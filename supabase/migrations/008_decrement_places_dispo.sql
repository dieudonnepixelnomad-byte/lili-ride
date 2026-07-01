-- Décrémente atomiquement places_dispo lors d'une réservation covoiturage
-- SECURITY DEFINER bypasse le RLS (le voyageur ne possède pas le trajet)
CREATE OR REPLACE FUNCTION decrement_places_dispo(trajet_id uuid, nb integer)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE trajets
  SET
    places_dispo = GREATEST(0, places_dispo - nb),
    statut = CASE WHEN GREATEST(0, places_dispo - nb) = 0 THEN 'complet' ELSE statut END
  WHERE id = trajet_id;
$$;

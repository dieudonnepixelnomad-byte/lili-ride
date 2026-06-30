-- Capacité max déclarée par le transitaire et prix par kilo pour les trajets colis
ALTER TABLE trajets
  ADD COLUMN IF NOT EXISTS poids_max_kg numeric,
  ADD COLUMN IF NOT EXISTS prix_par_kg  numeric;

-- Décrémente atomiquement poids_dispo_kg lors d'une réservation colis
CREATE OR REPLACE FUNCTION decrement_poids_dispo(trajet_id uuid, poids numeric)
RETURNS void LANGUAGE sql AS $$
  UPDATE trajets
  SET poids_dispo_kg = GREATEST(0, poids_dispo_kg - poids)
  WHERE id = trajet_id;
$$;


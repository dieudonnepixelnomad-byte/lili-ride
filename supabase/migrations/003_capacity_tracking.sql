-- Capacity tracking for covoiturage and colis
-- places_dispo already exists on trajets (covoiturage)
-- Add weight capacity for colis

ALTER TABLE trajets ADD COLUMN IF NOT EXISTS poids_dispo_kg numeric;

-- Add numeric weight to demandes for auto-decrement when admin validates
ALTER TABLE demandes ADD COLUMN IF NOT EXISTS poids_kg numeric;

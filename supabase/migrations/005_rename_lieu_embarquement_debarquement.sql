-- Renomme lieu_ramassage/lieu_depot en lieu_embarquement/lieu_debarquement sur trajets
ALTER TABLE trajets RENAME COLUMN lieu_ramassage TO lieu_embarquement;
ALTER TABLE trajets RENAME COLUMN lieu_depot TO lieu_debarquement;

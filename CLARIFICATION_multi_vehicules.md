# NOTE DE CLARIFICATION — Lili-Ride MVP
## Sujet : Gestion multi-véhicules pour le profil transporteur

---

## Problème identifié

Le CDC actuel modélise le profil transporteur avec **un seul véhicule par utilisateur** (relation 1-to-1 entre `users` et `profils_transporteur`).

Cette conception bloque les cas d'usage suivants :
- Un transporteur possédant plusieurs véhicules (berline + minibus)
- Un propriétaire de flotte souhaitant proposer plusieurs véhicules à la location
- La publication d'un trajet covoiturage avec un véhicule et d'un trajet colis avec un autre

---

## Ce que le CDC prévoit actuellement (à corriger)

```
users (1) ──── (1) profils_transporteur
                     └── type_vehicule
                     └── marque
                     └── modele
                     └── plaque
                     └── permis_url
                     └── carte_grise_url
                     └── photo_vehicule_url
                     └── statut_verification  ← un seul statut pour tout
```

**Conséquence directe :** un transporteur avec 2 véhicules ne peut pas faire vérifier son deuxième véhicule. Il est bloqué.

---

## Correction recommandée

Extraire les informations véhicule du profil transporteur et créer une table dédiée `vehicules_transporteur`.

### Nouvelle architecture

```
users (1) ──── (1) profils_transporteur
                     └── permis_url          ← reste sur le profil (propre au conducteur)
                     └── statut_conducteur   ← validation du permis uniquement

users (1) ──── (N) vehicules_transporteur
                     └── type_vehicule
                     └── marque
                     └── modele
                     └── plaque
                     └── nb_places
                     └── capacite_kg
                     └── volume_m3
                     └── types_colis_acceptes
                     └── carte_grise_url     ← propre au véhicule
                     └── photo_vehicule_url  ← propre au véhicule
                     └── statut_verification ← par véhicule, indépendant
                     └── motif_rejet
                     └── verifie_par
                     └── verifie_le
```

### Table SQL à créer

```sql
CREATE TABLE vehicules_transporteur (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type_vehicule         TEXT,               -- Berline | SUV | Minibus | Camionnette | Moto
  marque                TEXT,
  modele                TEXT,
  plaque                TEXT,
  nb_places             INT,                -- covoiturage
  capacite_kg           NUMERIC,            -- colis
  volume_m3             NUMERIC,            -- colis
  types_colis_acceptes  TEXT[],             -- documents | petit | volumineux | fragile
  carte_grise_url       TEXT,
  photo_vehicule_url    TEXT,
  statut_verification   TEXT DEFAULT 'non_soumis',  -- non_soumis | en_attente | vérifié | rejeté
  motif_rejet           TEXT,
  verifie_par           UUID REFERENCES users(id),
  verifie_le            TIMESTAMP,
  created_at            TIMESTAMP DEFAULT now()
);
```

### Ce qui change dans `profils_transporteur`

Supprimer les colonnes suivantes (déplacées vers `vehicules_transporteur`) :
- `type_vehicule`
- `marque`
- `modele`
- `plaque`
- `nb_places`
- `capacite_kg`
- `volume_m3`
- `types_colis_acceptes`
- `carte_grise_url`
- `photo_vehicule_url`
- `statut_verification`
- `motif_rejet`
- `verifie_par`
- `verifie_le`

Garder dans `profils_transporteur` :
- `user_id`
- `permis_url` (le permis appartient au conducteur, pas au véhicule)
- `statut_conducteur` (validation du permis uniquement)

---

## Impact sur les autres tables

### Table `trajets`
Ajouter une colonne `vehicule_transporteur_id` :

```sql
ALTER TABLE trajets ADD COLUMN vehicule_transporteur_id UUID REFERENCES vehicules_transporteur(id);
```

Le transporteur choisit **quel véhicule** il utilise pour ce trajet au moment de la publication.

### Règle de publication
La publication d'un trajet est autorisée si :
- Le permis du conducteur est vérifié (`profils_transporteur.statut_conducteur = 'vérifié'`)
- ET le véhicule sélectionné est vérifié (`vehicules_transporteur.statut_verification = 'vérifié'`)

---

## Impact sur le back-office admin

La page `/admin/verifications` doit afficher :
- Les permis en attente (depuis `profils_transporteur`)
- Les véhicules en attente (depuis `vehicules_transporteur`)

Ces deux listes peuvent être sur deux onglets distincts ou fusionnées avec un filtre.

---

## Impact sur le dashboard utilisateur

La page `/dashboard/profil` doit permettre :
- Uploader / modifier son permis de conduire (1 seul par compte)
- Ajouter / modifier / supprimer ses véhicules (liste)
- Voir le statut de vérification de chaque véhicule séparément

---

## Ce que cette correction ne change PAS

- Le flux de vérification reste identique (soumission → en_attente → vérifié/rejeté)
- L'admin valide toujours depuis le back-office
- La table `vehicules` (location) n'est pas touchée — elle supporte déjà le multi-véhicules
- Aucune fonctionnalité MVP n'est retirée

---

## Recommandation

Appliquer cette correction **avant de commencer le développement**.

Modifier la structure de la base de données après que les premières tables sont créées et les premières pages développées coûte significativement plus cher en temps de refactoring.

---

*Note rédigée suite à analyse du CDC Lili-Ride MVP v1.0 — Avril 2025*

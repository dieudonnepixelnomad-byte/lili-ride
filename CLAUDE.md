# CLAUDE.md — Lili-Ride

> Fichier de contexte projet. À lire en priorité avant toute intervention sur le codebase.

---

## 1. Vue d'ensemble du projet

**Lili-Ride** est une plateforme web de mobilité camerounaise regroupant trois services :
- Covoiturage entre particuliers
- Transport de colis sur trajets définis
- Location de véhicules

**Marché cible** : Cameroun francophone — villes pilotes : Douala, Yaoundé, Bafoussam  
**Langue** : Français uniquement  
**Modèle économique** : Commission manuelle perçue par une équipe support à chaque mise en relation aboutie. Pas de paiement en ligne au MVP.  
**Statut actuel** : MVP 1.0 en cours de développement

---

## 2. Stack technique

| Besoin | Outil |
|--------|-------|
| Framework full-stack | Next.js 14+ (App Router) |
| Langage | TypeScript 5+ |
| Base de données / Auth / Storage | Supabase (plan free) |
| UI | shadcn/ui + Tailwind CSS |
| Adresses / Cartes | Google Maps Places API |
| Emails | Resend (3k/mois gratuit) |
| Déploiement | Vercel |

**Coût MVP : 0 FCFA.** Le crédit mensuel Google Maps ($200) couvre largement le démarrage.

---

## 3. Structure du projet

```
app/
  (public)/         → Pages publiques sans auth
  (auth)/           → Connexion et inscription
  (dashboard)/      → Espace utilisateur connecté
  (admin)/          → Back-office administration
  api/              → API Routes Next.js

components/
  ui/               → Composants shadcn/ui
  layout/           → Header, Footer, Sidebar
  shared/           → Composants réutilisables entre les 3 pôles

lib/
  supabase/
    client.ts       → Client Supabase côté navigateur
    server.ts       → Client Supabase côté serveur
    types.ts        → Types TypeScript générés depuis Supabase
  resend.ts         → Config Resend + templates emails
  google-maps.ts    → Config Google Maps

middleware.ts       → Protection des routes (auth + rôle admin)
types/index.ts      → Types globaux du projet
```

---

## 4. Routes et accès

### Espace public (`/`)
| URL | Contenu |
|-----|---------|
| `/` | Landing page — présentation des 3 pôles |
| `/covoiturage` | Recherche et liste des trajets covoiturage |
| `/covoiturage/[id]` | Détail d'un trajet covoiturage |
| `/colis` | Recherche et liste des trajets colis |
| `/colis/[id]` | Détail d'un trajet colis |
| `/location` | Recherche et liste des véhicules |
| `/location/[id]` | Détail d'un véhicule + galerie photos |
| `/support` | Page contact |
| `/connexion` | Connexion |
| `/inscription` | Inscription |

### Espace dashboard (`/dashboard`) — utilisateur connecté requis
| URL | Contenu |
|-----|---------|
| `/dashboard` | Résumé — annonces actives, demandes récentes |
| `/dashboard/profil` | Mon profil + profil transporteur + documents |
| `/dashboard/mes-annonces` | Mes trajets et véhicules publiés |
| `/dashboard/publier` | Formulaire de publication |
| `/dashboard/mes-demandes` | Historique de mes demandes |

### Espace admin (`/admin`) — rôle `admin` requis
| URL | Contenu |
|-----|---------|
| `/admin` | Tableau de bord avec compteurs et alertes |
| `/admin/demandes` | Toutes les demandes — filtres statut/pôle |
| `/admin/demandes/[id]` | Détail d'une demande |
| `/admin/verifications` | Profils transporteur à vérifier |
| `/admin/verifications/[id]` | Documents d'un transporteur |
| `/admin/annonces` | Toutes les annonces publiées |
| `/admin/utilisateurs` | Liste des utilisateurs |

**Règles d'accès critiques :**
- Tout accès à `/dashboard` sans session → redirection `/connexion`
- Tout accès à `/admin` sans rôle `admin` → redirection `/`
- Le rôle `admin` est attribué **manuellement en base**, jamais par inscription

---

## 5. Modèle de données (PostgreSQL / Supabase)

> Toutes les tables : UUID comme PK, `created_at` en timestamp automatique.  
> RLS (Row Level Security) **activé sur toutes les tables** — ne jamais le désactiver.

### `users`
```sql
id            uuid PK
nom           text NOT NULL
telephone     text UNIQUE NOT NULL  -- identifiant de connexion
whatsapp      text
ville         text NOT NULL
photo_url     text
role          text DEFAULT 'user'   -- 'user' | 'admin'
created_at    timestamp
```

### `profils_transporteur`
> Un seul par compte (1-to-1). Contient uniquement les données conducteur (permis).
> Les données véhicule sont dans `vehicules_transporteur`.

```sql
id                uuid PK
user_id           uuid FK → users (CASCADE DELETE, UNIQUE)
permis_url        text   -- bucket privé Supabase Storage
statut_conducteur text DEFAULT 'non_soumis'
                  -- non_soumis | en_attente | vérifié | rejeté
motif_rejet       text
verifie_par       uuid FK → users
verifie_le        timestamp
created_at        timestamp
```

### `vehicules_transporteur`
> N par compte (1-to-N). Chaque véhicule vérifié indépendamment.

```sql
id                    uuid PK
user_id               uuid FK → users (CASCADE DELETE)
type_vehicule         text   -- Berline | SUV | Minibus | Camionnette | Moto
marque                text
modele                text
plaque                text
nb_places             int              -- covoiturage
capacite_kg           numeric          -- colis
volume_m3             numeric          -- colis
types_colis_acceptes  text[]           -- documents | petit | volumineux | fragile
carte_grise_url       text   -- bucket privé Supabase Storage
photo_vehicule_url    text
statut_verification   text DEFAULT 'non_soumis'
                      -- non_soumis | en_attente | vérifié | rejeté
motif_rejet           text
verifie_par           uuid FK → users
verifie_le            timestamp
created_at            timestamp
```

### `trajets`
> Une seule table pour covoiturage et colis — distingués par la colonne `type`.  
> `vehicule_transporteur_id` : le transporteur choisit quel véhicule il utilise à la publication.

```sql
id                        uuid PK
user_id                   uuid FK → users
vehicule_transporteur_id  uuid FK → vehicules_transporteur (nullable, SET NULL)
type                      text NOT NULL   -- 'covoiturage' | 'colis'
depart_label              text NOT NULL
depart_lat                float
depart_lng                float
arrivee_label             text NOT NULL
arrivee_lat               float
arrivee_lng               float
date_depart               date NOT NULL
heure_depart              time NOT NULL
prix                      numeric NOT NULL
places_dispo              int             -- covoiturage uniquement
types_colis               text[]          -- colis uniquement
description               text
statut                    text DEFAULT 'actif'  -- actif | complet | annulé
created_at                timestamp
```

### `vehicules`
> Table dédiée à la location de véhicule. Indépendante de `vehicules_transporteur`.

```sql
id           uuid PK
user_id      uuid FK → users
marque       text NOT NULL
modele       text NOT NULL
annee        int
couleur      text
nb_places    int NOT NULL
carburant    text   -- essence | diesel | hybride
boite        text   -- manuelle | automatique
lieu_label   text NOT NULL
lieu_lat     float
lieu_lng     float
prix_jour    numeric NOT NULL
photos_urls  text[] -- min 1, max 5
disponible   boolean DEFAULT true
description  text
statut       text DEFAULT 'actif'  -- actif | suspendu
created_at   timestamp
```

### `demandes`
```sql
id                  uuid PK
user_id             uuid FK → users (SET NULL si supprimé)
type                text NOT NULL   -- covoiturage | colis | location
trajet_id           uuid FK → trajets (nullable)
vehicule_id         uuid FK → vehicules (nullable)
nom_client          text NOT NULL   -- dupliqué pour traçabilité permanente
telephone           text NOT NULL   -- dupliqué pour traçabilité permanente
whatsapp            text
nb_places           int             -- covoiturage
description_colis   text            -- colis
poids_estime        text            -- colis
date_debut          date            -- location
date_fin            date            -- location
message             text
origine             text DEFAULT 'formulaire'  -- formulaire | telephone | whatsapp
statut              text DEFAULT 'en_attente'  -- en_attente | traitée | annulée
notes_support       text            -- visible admin uniquement
created_at          timestamp
```

---

## 6. Modèle utilisateur et vérification transporteur

Un seul type de compte. Le même utilisateur peut être passager, chauffeur, expéditeur ou propriétaire selon le contexte.

**Deux niveaux de vérification indépendants :**

| Entité | Champ | Statuts |
|--------|-------|---------|
| `profils_transporteur` | `statut_conducteur` | non_soumis → en_attente → vérifié / rejeté |
| `vehicules_transporteur` | `statut_verification` | non_soumis → en_attente → vérifié / rejeté |

**Statuts conducteur (`statut_conducteur`) :**

| Statut | Ce que peut faire l'utilisateur |
|--------|--------------------------------|
| `non_soumis` | Chercher uniquement |
| `en_attente` | Chercher uniquement — en attente de validation admin |
| `vérifié` | Permis validé — peut publier si véhicule aussi vérifié |
| `rejeté` | Chercher uniquement — doit corriger et resoumettre |

**Règle de publication d'un trajet :**
- `profils_transporteur.statut_conducteur = 'vérifié'`
- **ET** le véhicule sélectionné : `vehicules_transporteur.statut_verification = 'vérifié'`

Les deux conditions doivent être vraies. Un véhicule non vérifié bloque même si le permis est ok.

---

## 7. Gestion des demandes

### Cycle de vie
```
en_attente → traitée
           → annulée
```

### Canaux d'origine
- `formulaire` : soumis via formulaire web → création automatique en base + email admin
- `telephone` : saisi manuellement par l'admin dans le back-office
- `whatsapp` : saisi manuellement par l'admin dans le back-office

### Email admin (via Resend)
Déclenché à chaque nouvelle demande `formulaire`. Contient :
- Type de demande (covoiturage / colis / location)
- Nom + téléphone + WhatsApp du client
- Détail de l'annonce concernée
- Lien direct vers la fiche `/admin/demandes/[id]`

---

## 8. Sécurité — règles non négociables

- **RLS activé** sur toutes les tables Supabase — un utilisateur ne modifie que ses propres données
- **Documents uploadés** (permis, carte grise) dans un **bucket privé** Supabase Storage
- **Routes protégées** par `middleware.ts` — `/dashboard` (session) et `/admin` (rôle admin)
- **Rôle admin** : attribution manuelle en base uniquement, jamais auto-attribuable
- **Mots de passe** : gérés par Supabase Auth (bcrypt), jamais stockés en clair
- **Connexion** par numéro de téléphone (identifiant unique), pas par email

---

## 9. Périmètre MVP — ce qui est EXCLU (ne pas implémenter)

| Fonctionnalité | Version cible |
|---------------|--------------|
| Paiement en ligne / Mobile Money | V1 |
| Notifications push ou SMS automatiques | V1 |
| Vérification OTP du téléphone | V1 |
| Système d'avis et notation | V1 |
| Carte interactive (visualisation trajets) | V1 |
| Application mobile Flutter | V2 |
| Messagerie interne entre utilisateurs | V2 |
| Géolocalisation temps réel | V2 |
| Trajets récurrents automatiques | V2 |
| Assurance trajet / API partenaires | V3 |
| Multi-langue (anglais) | V3 |

**Ne pas anticiper ces fonctionnalités dans l'architecture MVP.** Toute décision d'architecture doit rester réversible pour les accueillir en V1/V2 sans refonte majeure.

---

## 10. Conventions de développement

- **TypeScript strict** — pas de `any`, pas de cast non justifié
- **Server Components par défaut** dans App Router — `"use client"` uniquement si interaction côté client nécessaire
- **API Routes** pour toutes les mutations (création de demande, publication de trajet, etc.) — ne pas muter directement depuis les Server Components
- **Nommage des fichiers** : kebab-case pour les routes, PascalCase pour les composants
- **Variables d'environnement** : toutes les clés sensibles dans `.env.local`, jamais en dur dans le code
- **Google Maps** : utiliser l'autocomplétion Places API pour tous les champs d'adresse (départ, arrivée, lieu de disponibilité)
- **Devise** : toujours afficher en **FCFA**, jamais de conversion

---

## 11. Priorités de développement

1. Auth (inscription par téléphone, connexion, middleware de protection des routes)
2. Schéma Supabase complet + RLS
3. Profil transporteur + upload documents + flux de vérification admin
4. Publication et recherche — covoiturage en premier
5. Publication et recherche — colis
6. Publication et recherche — location véhicules
7. Formulaires de demande + email Resend
8. Back-office admin (tableau de bord, demandes, vérifications, annonces, utilisateurs)
9. Saisie manuelle des demandes téléphoniques dans le back-office
10. Polish UI + tests end-to-end des flux critiques

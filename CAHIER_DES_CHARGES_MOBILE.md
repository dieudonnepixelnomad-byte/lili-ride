# Cahier des charges — Application mobile Flutter Lili-Ride

> Document de cadrage pour le développement de l'application mobile Flutter, en complément de la plateforme web existante (Next.js). Rédigé à partir d'un audit du code réel du projet web (backend Supabase partagé).

---

## 1. Contexte et objectifs

**Lili-Ride** est une plateforme de mobilité camerounaise (Douala, Yaoundé, Bafoussam) regroupant trois services : covoiturage entre particuliers, transport de colis par avion (via transitaires partenaires), et location de véhicules. Le MVP web (Next.js + Supabase) est en développement actif.

**Objectif de l'app mobile** : offrir la même expérience utilisateur que le web, sur iOS et Android, en réutilisant **le même backend Supabase** (base de données, Auth, Storage, RPC, RLS) sans dupliquer ni migrer de logique métier côté serveur. L'app mobile est un **second client** du même système, pas un projet backend séparé.

**Non-objectif** : réécrire l'API. Les routes Next.js (`app/api/...`) restent la source de vérité pour les mutations complexes (validation Zod, envoi email Resend, décrément RPC) — l'app mobile les appelle en HTTP comme le ferait le web, ou passe par le SDK Supabase directement pour les lectures simples.

**Modèle économique inchangé** : pas de paiement en ligne dans l'app. Commission perçue manuellement par l'équipe support après mise en relation.

**Langue** : français uniquement.

---

## 2. Périmètre fonctionnel

### 2.1 Fonctionnalités incluses (parité avec le web)

- Recherche et consultation des annonces des 3 pôles (covoiturage, colis, location)
- Authentification (email + OTP, Google OAuth)
- Complétion de profil (nom, téléphone, ville, photo)
- Publication d'annonces (trajet covoiturage, trajet colis, véhicule à louer)
- Upload de documents de vérification (CNI, permis, carte grise) et photos
- Soumission de demandes (covoiturage, colis, location)
- Tableau de bord utilisateur : mes annonces, mes demandes, demandeurs reçus
- Modification/suppression de ses propres annonces
- Notifications par email (déjà gérées côté serveur — l'app ne les réémet pas)

### 2.2 Hors périmètre (aligné sur les exclusions MVP du projet)

- Paiement en ligne / Mobile Money
- Notifications push (non implémentées côté web non plus à ce jour — si ajoutées, prévoir FCM/APNs en V1.1 mobile, cf. §9)
- Vérification OTP téléphone (l'OTP existant est sur l'email, pas le téléphone)
- Avis / notation
- Messagerie interne entre utilisateurs
- Interface admin (le back-office `/admin` reste web-only — pas de version mobile admin dans ce cahier des charges, sauf demande explicite ultérieure)
- Multi-langue, géolocalisation temps réel, trajets récurrents

---

## 3. Architecture technique

### 3.1 Stack proposée

| Besoin | Outil |
|---|---|
| Framework | Flutter 3.x (Dart 3) |
| Gestion d'état | Riverpod (ou Bloc si préférence équipe) |
| Backend | **Supabase** (même projet que le web) via `supabase_flutter` |
| Auth | Supabase Auth — email OTP + Google Sign-In natif |
| Appels API métier | HTTP vers les routes Next.js existantes (`/api/demandes`, `/api/trajets`, `/api/vehicules`, `/api/auth/profil`) pour toute mutation qui a une logique serveur (Zod, Resend, RPC) |
| Lectures directes | Supabase client Dart pour lecture de `trajets`, `vehicules`, `users` (respecte RLS déjà en place) |
| Cartes / géocodage | **Nominatim (OpenStreetMap)** — même service que le web, via `http` + package `flutter_map` (Leaflet-équivalent Flutter) pour cohérence avec `TrajetMap.tsx` côté web. Ne pas basculer sur Google Maps SDK sans décision produit explicite, malgré la clé Google Maps présente en env — elle n'est pas utilisée côté web actuellement. |
| Stockage fichiers | Supabase Storage — bucket privé `documents` (CNI/permis/carte grise), bucket public `photos` |
| Upload image/caméra | `image_picker` |
| Formulaires | `flutter_form_builder` ou formulaires natifs + validation manuelle (miroir des schémas Zod serveur) |
| Local storage | `flutter_secure_storage` pour session Supabase |
| Déploiement | App Store + Google Play |

### 3.2 Principe d'intégration backend

L'app mobile ne doit **jamais dupliquer** la logique métier déjà présente dans les routes API Next.js. Concrètement :

- **Création de demande** → `POST https://<domaine>/api/demandes` (même payload que le web, mêmes règles : photo de profil obligatoire, vérification disponibilité places/poids, décrément RPC, email Resend admin)
- **Publication trajet/véhicule** → `POST /api/trajets`, `POST /api/vehicules` (mêmes règles de vérification CNI/permis/véhicule selon type)
- **Complétion profil** → `POST /api/auth/profil` (contrôle unicité téléphone)
- **Lecture de listes/détails** (recherche, fiches annonces) → lecture directe Supabase (RLS publique déjà en place), pour limiter la latence et la dépendance au serveur Next.js

### 3.3 Authentification — flux réel à répliquer

Le web n'utilise **pas** l'auth par téléphone décrite historiquement dans CLAUDE.md — le flux réel implémenté est :

1. Saisie email → `supabase.auth.signInWithOtp` (`shouldCreateUser: true`)
2. Saisie code à 6 chiffres reçu par email → `supabase.auth.verifyOtp`
3. Alternative : bouton "Continuer avec Google" (OAuth)
4. Si profil incomplet (pas de `nom`/`telephone`/`ville` en base) → redirection écran **Profil complet** avant accès au reste de l'app
5. Le téléphone est saisi uniquement à cette étape, avec contrôle d'unicité côté serveur

L'app Flutter doit répliquer ce flux exactement (écran connexion unique gérant à la fois inscription et connexion, pas d'écran "inscription" séparé), avec deep-linking pour le retour OAuth Google et le lien magique email si applicable.

### 3.4 Protection de navigation (équivalent middleware)

Le web protège `/dashboard/*`, `/admin/*`, `/profil-complet` via `proxy.ts`. Côté mobile : équivalent applicatif via un routeur (go_router) avec redirection basée sur l'état de session Supabase :
- Pas de session → écran Connexion
- Session sans profil complet → écran Profil complet forcé
- Session + profil complet → accès à l'app

Pas d'équivalent `/admin` prévu dans l'app mobile (hors périmètre, §2.2).

---

## 4. Modèle de données (rappel — inchangé, backend partagé)

Tables Supabase existantes, consommées telles quelles (pas de migration nécessaire pour le mobile) :

- **`users`** — id, nom, telephone (unique), whatsapp, ville, photo_url, role, email. Lecture publique activée (RLS) pour l'affichage sur les listings.
- **`profils_transporteur`** — vérification **CNI et permis séparées** (`statut_cni`, `statut_permis`, chacun avec motif de rejet et vérificateur propres). *Note : diverge du modèle "statut_conducteur unique" documenté historiquement — l'app doit gérer les deux statuts indépendamment.*
- **`vehicules_transporteur`** — véhicules utilisés pour covoiturage/colis, vérification indépendante par véhicule (1 utilisateur → N véhicules), inclut `capacite_kg`, `volume_m3`, `types_colis_acceptes`, `equipements`.
- **`trajets`** — covoiturage et colis unifiés par `type`. Colis inclut un **tracking de capacité poids** : `poids_max_kg`, `poids_dispo_kg`, `prix_par_kg`, décrémenté automatiquement via RPC `decrement_poids_dispo` à chaque demande traitée. Covoiturage utilise `places_dispo` + RPC `decrement_places_dispo`. Champs `lieu_embarquement`/`lieu_debarquement` (aéroports).
- **`vehicules`** (location) — inclut vérification carte grise indépendante (`carte_grise_url`, `statut_carte_grise`, `motif_rejet_cg`).
- **`demandes`** — statuts `en_attente → traitée / annulée`, données client dupliquées pour traçabilité, `notes_support` visible admin uniquement (jamais exposé côté mobile).
- **RPC `get_demandes_annonces_chauffeur`** — à utiliser pour l'écran "Demandeurs" côté transporteur : expose les demandes sans exposer téléphone/whatsapp/notes_support brut du client (confidentialité déjà gérée serveur, l'app doit consommer cette fonction plutôt que la table brute).

**Règles de publication à répliquer côté UI (validation avant soumission, en plus de la validation serveur) :**
- Covoiturage : CNI vérifiée **ET** permis vérifié **ET** véhicule sélectionné vérifié
- Colis (avion) : CNI vérifiée uniquement
- Location véhicule : CNI vérifiée uniquement

---

## 5. Spécification des écrans

### 5.1 Espace public (accessible sans compte)

| Écran | Contenu |
|---|---|
| Accueil | Présentation des 3 pôles, accès recherche rapide par onglets |
| Recherche (par pôle) | Formulaire départ/arrivée (autocomplétion Nominatim) ou ville pour location, date |
| Liste résultats covoiturage | Cartes trajet : trajet, date/heure, prix, places dispo, avatar conducteur |
| Détail trajet covoiturage | Carte (flutter_map), infos conducteur + véhicule, bouton "Faire une demande" |
| Liste résultats colis | Cartes trajet avion : aéroports embarquement/débarquement, date, prix/kg, poids dispo |
| Détail trajet colis | Idem + types de colis acceptés |
| Liste résultats location | Cartes véhicule : photo, marque/modèle, prix/jour, lieu |
| Détail véhicule | Galerie photos (swipe, équivalent PhotoLightbox web), caractéristiques, plaque, bouton demande |
| Support | Formulaire de contact |

### 5.2 Authentification

| Écran | Contenu |
|---|---|
| Connexion/Inscription | Champ email → envoi OTP, champ code 6 chiffres, bouton Google |
| Profil complet | Nom, téléphone, ville, photo (forcé si profil incomplet) |

### 5.3 Espace utilisateur connecté (dashboard)

| Écran | Contenu |
|---|---|
| Tableau de bord | Résumé annonces actives, demandes récentes |
| Mon profil | Infos perso + accès sous-sections transporteur |
| Profil transporteur | Upload CNI, upload permis, statuts de vérification distincts (badges CNI/permis) |
| Mes véhicules (transporteur) | Liste véhicules ajoutés, statut vérification par véhicule, ajout/modification |
| Mes annonces | Liste trajets + véhicules publiés par l'utilisateur, actions modifier/supprimer |
| Publier — choix type | Covoiturage / Colis / Location |
| Publier — covoiturage | Départ/arrivée (autocomplétion), date/heure, prix, places, sélection véhicule vérifié (bloqué si conditions non remplies, message explicite) |
| Publier — colis | Aéroports embarquement/débarquement, date/heure, prix/kg, poids max, types colis acceptés |
| Publier — location | Marque/modèle/année/couleur, places, carburant, boîte, lieu, prix/jour, photos (1-5), upload carte grise |
| Modifier annonce | Réutilise formulaire publication pré-rempli |
| Demandeurs (par annonce) | Liste des demandes reçues sur ce trajet/véhicule (via RPC dédiée pour trajets covoiturage/colis), actions contact (appel/WhatsApp) |
| Mes demandes | Historique des demandes que j'ai soumises, avec statut |
| Formulaire de demande | Selon pôle : places (covoiturage), description+poids estimé (colis), dates début/fin (location). Bloqué si photo de profil absente (message + lien vers profil) |

---

## 6. Exigences non fonctionnelles

- **Offline partiel** : cache des listes déjà chargées (pas de mode offline complet requis au MVP mobile)
- **Performance** : listes paginées, images compressées avant upload (`image_picker` + compression côté client avant envoi vers Storage)
- **Sécurité** : jamais de stockage de mot de passe/OTP en clair localement ; session Supabase persistée via `flutter_secure_storage` ; documents sensibles jamais mis en cache disque non chiffré
- **RLS** : aucune requête directe ne doit tenter de contourner les policies Supabase existantes — toute nouvelle policy nécessaire doit être ajoutée via migration SQL commune (web + mobile), pas de duplication de règles côté client uniquement
- **Compatibilité** : Android 8+ (API 26+), iOS 13+
- **Devise** : FCFA uniquement, jamais de conversion

---

## 7. Points d'attention / écarts identifiés à trancher avant développement

Ces points divergent entre la documentation historique du projet (CLAUDE.md) et l'état réel du code web — à clarifier en équipe avant de figer la spec mobile finale :

1. **Auth** : confirmer que l'app mobile doit suivre le flux réel (email OTP + Google) et non le flux "téléphone" historiquement documenté.
2. **Cartes/géocodage** : confirmer Nominatim/OpenStreetMap comme standard mobile (cohérence avec web), plutôt que Google Maps malgré la clé API présente en environnement.
3. **Carte interactive** : le web l'a implémentée (Leaflet) alors qu'elle était listée comme exclue du MVP — à répliquer en mobile (flutter_map) pour cohérence de la parité fonctionnelle.
4. **Interface admin mobile** : à confirmer explicitement hors périmètre (recommandé de garder web-only vu la faible fréquence d'usage et la complexité du back-office).
5. **Notifications push** : non existantes côté web (seulement email Resend) — si souhaitées côté mobile (statut demande changé, nouvelle demande reçue), nécessite ajout d'un service de notification serveur (ex. Supabase Edge Function + FCM) hors périmètre du MVP mobile initial, à traiter comme lot V1.1.
6. **Fichier `CLARIFICATION_multi_vehicules.md`** présent à la racine du projet web — à consulter pour vérifier s'il documente une évolution du modèle véhicule pas encore répercutée dans ce cahier des charges.

---

## 8. Plan de développement suggéré (phases)

1. Setup projet Flutter + intégration Supabase (Auth email OTP + Google) + routing protégé
2. Espace public : recherche + listes + détails (3 pôles), lecture Supabase directe
3. Profil complet + profil transporteur (upload CNI/permis) + gestion véhicules transporteur
4. Publication et modification d'annonces (covoiturage → colis → location, dans cet ordre, miroir des priorités web)
5. Formulaire de demande + historique "mes demandes"
6. Tableau de bord + "mes annonces" + écran "demandeurs"
7. Polish UI, gestion erreurs réseau, tests end-to-end des flux critiques (inscription → publication → demande → statut)
8. Publication stores (TestFlight / Internal testing Android) puis production

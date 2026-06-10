-- ============================================================
-- Lili-Ride — Initial Schema + RLS + Storage
-- Run once in your Supabase SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- users
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  nom           text not null,
  telephone     text unique not null,
  whatsapp      text,
  ville         text not null,
  photo_url     text,
  role          text not null default 'user' check (role in ('user', 'admin')),
  created_at    timestamptz not null default now()
);

-- profils_transporteur
create table if not exists public.profils_transporteur (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references public.users(id) on delete cascade,
  type_vehicule         text check (type_vehicule in ('Berline', 'SUV', 'Minibus', 'Camionnette', 'Moto')),
  marque                text,
  modele                text,
  plaque                text,
  nb_places             int,
  capacite_kg           numeric,
  volume_m3             numeric,
  types_colis_acceptes  text[],
  permis_url            text,
  carte_grise_url       text,
  photo_vehicule_url    text,
  statut_verification   text not null default 'non_soumis'
                        check (statut_verification in ('non_soumis', 'en_attente', 'vérifié', 'rejeté')),
  motif_rejet           text,
  verifie_par           uuid references public.users(id) on delete set null,
  verifie_le            timestamptz,
  created_at            timestamptz not null default now(),
  unique (user_id)
);

-- trajets
create table if not exists public.trajets (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.users(id) on delete cascade,
  type           text not null check (type in ('covoiturage', 'colis')),
  depart_label   text not null,
  depart_lat     float,
  depart_lng     float,
  arrivee_label  text not null,
  arrivee_lat    float,
  arrivee_lng    float,
  date_depart    date not null,
  heure_depart   time not null,
  prix           numeric not null,
  places_dispo   int,
  types_colis    text[],
  description    text,
  statut         text not null default 'actif' check (statut in ('actif', 'complet', 'annulé')),
  created_at     timestamptz not null default now()
);

-- vehicules
create table if not exists public.vehicules (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.users(id) on delete cascade,
  marque       text not null,
  modele       text not null,
  annee        int,
  couleur      text,
  nb_places    int not null,
  carburant    text check (carburant in ('essence', 'diesel', 'hybride')),
  boite        text check (boite in ('manuelle', 'automatique')),
  lieu_label   text not null,
  lieu_lat     float,
  lieu_lng     float,
  prix_jour    numeric not null,
  photos_urls  text[],
  disponible   boolean not null default true,
  description  text,
  statut       text not null default 'actif' check (statut in ('actif', 'suspendu')),
  created_at   timestamptz not null default now()
);

-- demandes
create table if not exists public.demandes (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid references public.users(id) on delete set null,
  type                text not null check (type in ('covoiturage', 'colis', 'location')),
  trajet_id           uuid references public.trajets(id) on delete set null,
  vehicule_id         uuid references public.vehicules(id) on delete set null,
  nom_client          text not null,
  telephone           text not null,
  whatsapp            text,
  nb_places           int,
  description_colis   text,
  poids_estime        text,
  date_debut          date,
  date_fin            date,
  message             text,
  origine             text not null default 'formulaire' check (origine in ('formulaire', 'telephone', 'whatsapp')),
  statut              text not null default 'en_attente' check (statut in ('en_attente', 'traitée', 'annulée')),
  notes_support       text,
  created_at          timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists trajets_type_statut_idx on public.trajets(type, statut);
create index if not exists trajets_date_depart_idx on public.trajets(date_depart);
create index if not exists vehicules_statut_idx on public.vehicules(statut);
create index if not exists demandes_statut_idx on public.demandes(statut);
create index if not exists demandes_created_at_idx on public.demandes(created_at desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users enable row level security;
alter table public.profils_transporteur enable row level security;
alter table public.trajets enable row level security;
alter table public.vehicules enable row level security;
alter table public.demandes enable row level security;

-- Helper: is current user admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  )
$$;

-- ---- users policies ----
create policy "users: own row read" on public.users
  for select using (auth.uid() = id or public.is_admin());

create policy "users: own row update" on public.users
  for update using (auth.uid() = id);

create policy "users: insert own row" on public.users
  for insert with check (auth.uid() = id);

-- ---- profils_transporteur policies ----
create policy "profils: own row" on public.profils_transporteur
  for all using (auth.uid() = user_id or public.is_admin());

create policy "profils: insert own" on public.profils_transporteur
  for insert with check (auth.uid() = user_id);

-- ---- trajets policies ----
create policy "trajets: public read actif" on public.trajets
  for select using (statut = 'actif' or auth.uid() = user_id or public.is_admin());

create policy "trajets: owner write" on public.trajets
  for insert with check (auth.uid() = user_id);

create policy "trajets: owner update" on public.trajets
  for update using (auth.uid() = user_id or public.is_admin());

create policy "trajets: owner delete" on public.trajets
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---- vehicules policies ----
create policy "vehicules: public read actif" on public.vehicules
  for select using (statut = 'actif' or auth.uid() = user_id or public.is_admin());

create policy "vehicules: owner write" on public.vehicules
  for insert with check (auth.uid() = user_id);

create policy "vehicules: owner update" on public.vehicules
  for update using (auth.uid() = user_id or public.is_admin());

create policy "vehicules: owner delete" on public.vehicules
  for delete using (auth.uid() = user_id or public.is_admin());

-- ---- demandes policies ----
create policy "demandes: own read" on public.demandes
  for select using (auth.uid() = user_id or public.is_admin());

create policy "demandes: insert anon or auth" on public.demandes
  for insert with check (true);

create policy "demandes: admin update" on public.demandes
  for update using (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Documents bucket (private) — permis de conduire, carte grise
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Photos bucket (public) — vehicle photos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage RLS: documents (private — owner + admin only)
create policy "documents: owner upload" on storage.objects
  for insert with check (
    bucket_id = 'documents' and auth.uid() is not null
  );

create policy "documents: owner read" on storage.objects
  for select using (
    bucket_id = 'documents' and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

create policy "documents: owner delete" on storage.objects
  for delete using (
    bucket_id = 'documents' and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- Storage RLS: photos (public read, auth write)
create policy "photos: public read" on storage.objects
  for select using (bucket_id = 'photos');

create policy "photos: auth upload" on storage.objects
  for insert with check (
    bucket_id = 'photos' and auth.uid() is not null
  );

create policy "photos: owner delete" on storage.objects
  for delete using (
    bucket_id = 'photos' and (
      auth.uid()::text = (storage.foldername(name))[1]
      or public.is_admin()
    )
  );

-- ============================================================
-- Lili-Ride — Verification Redesign
-- Adds CNI fields to profils_transporteur
-- Renames statut_conducteur → statut_permis
-- Adds carte_grise verification to vehicules (location)
-- ============================================================

-- ── profils_transporteur: rename columns ──────────────────────────────────
ALTER TABLE public.profils_transporteur
  RENAME COLUMN statut_conducteur TO statut_permis;

ALTER TABLE public.profils_transporteur
  RENAME COLUMN motif_rejet TO motif_rejet_permis;

ALTER TABLE public.profils_transporteur
  RENAME COLUMN verifie_par TO verifie_permis_par;

ALTER TABLE public.profils_transporteur
  RENAME COLUMN verifie_le TO verifie_permis_le;

-- ── profils_transporteur: add CNI columns ─────────────────────────────────
ALTER TABLE public.profils_transporteur
  ADD COLUMN cni_recto_url     text,
  ADD COLUMN cni_verso_url     text,
  ADD COLUMN statut_cni        text NOT NULL DEFAULT 'non_soumis'
    CHECK (statut_cni IN ('non_soumis', 'en_attente', 'vérifié', 'rejeté')),
  ADD COLUMN motif_rejet_cni   text,
  ADD COLUMN verifie_cni_par   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN verifie_cni_le    timestamptz;

-- ── vehicules: add carte_grise verification columns ───────────────────────
ALTER TABLE public.vehicules
  ADD COLUMN carte_grise_url   text,
  ADD COLUMN statut_carte_grise text NOT NULL DEFAULT 'non_soumis'
    CHECK (statut_carte_grise IN ('non_soumis', 'en_attente', 'vérifié', 'rejeté')),
  ADD COLUMN motif_rejet_cg    text,
  ADD COLUMN verifie_par       uuid REFERENCES public.users(id) ON DELETE SET NULL,
  ADD COLUMN verifie_le        timestamptz;

-- ── vehicules: public read now requires carte_grise verified ──────────────
DROP POLICY IF EXISTS "vehicules: public read actif" ON public.vehicules;

CREATE POLICY "vehicules: public read actif" ON public.vehicules
  FOR SELECT USING (
    (statut = 'actif' AND statut_carte_grise = 'vérifié')
    OR auth.uid() = user_id
    OR public.is_admin()
  );

-- ── Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS profils_statut_cni_idx    ON public.profils_transporteur(statut_cni);
CREATE INDEX IF NOT EXISTS profils_statut_permis_idx ON public.profils_transporteur(statut_permis);
CREATE INDEX IF NOT EXISTS vehicules_statut_cg_idx   ON public.vehicules(statut_carte_grise);

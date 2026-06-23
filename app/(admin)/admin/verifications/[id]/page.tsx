import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'
import VerificationActions from '@/components/shared/VerificationActions'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function getSignedUrl(supabase: Awaited<ReturnType<typeof createClient>>, path: string | null) {
  if (!path) return null
  const { data, error } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
  if (error) console.error('[admin/verifications/id] createSignedUrl error:', error)
  return data?.signedUrl ?? null
}

export default async function AdminVerificationProfilPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profil } = await supabase
    .from('profils_transporteur')
    .select('*, users!profils_transporteur_user_id_fkey(nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .single()

  if (!profil) notFound()

  const u = (profil as Record<string, unknown>).users as {
    nom: string
    telephone: string
    whatsapp?: string
    ville: string
    photo_url?: string
  } | null

  const [cniRectoUrl, cniVersoUrl, permisUrl] = await Promise.all([
    getSignedUrl(supabase, profil.cni_recto_url),
    getSignedUrl(supabase, profil.cni_verso_url),
    getSignedUrl(supabase, profil.permis_url),
  ])

  const permisIsPdf = profil.permis_url?.toLowerCase().endsWith('.pdf') ?? false

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/verifications" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Dossier — {u?.nom ?? '—'}</h1>
            <p className="page-sub">Soumis le {formatDate(profil.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Conducteur */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Conducteur</div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {u && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Avatar nom={u.nom} size="md" />
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{u.nom}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{u.ville}</div>
              </div>
            </div>
          )}
          <Row label="Téléphone" value={<a href={`tel:${u?.telephone}`} style={{ color: 'var(--primary)' }}>{u?.telephone}</a>} />
          {u?.whatsapp && (
            <Row label="WhatsApp" value={
              <a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                {u.whatsapp}
              </a>
            } />
          )}
        </div>
      </div>

      {/* CNI */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Carte Nationale d&rsquo;Identité</span>
          <StatusBadge statut={profil.statut_cni} />
        </div>
        <div style={{ padding: '16px 20px' }}>
          {profil.motif_rejet_cni && (
            <div className="notice warn" style={{ marginBottom: 16 }}>
              <strong>Motif de rejet :</strong> {profil.motif_rejet_cni}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <DocPreview label="Recto" url={cniRectoUrl} />
            <DocPreview label="Verso" url={cniVersoUrl} />
          </div>
        </div>
        {profil.statut_cni === 'en_attente' && (
          <div style={{ padding: '0 20px 20px' }}>
            <VerificationActions id={id} type="cni" />
          </div>
        )}
      </div>

      {/* Permis de conduire */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Permis de conduire</span>
          <StatusBadge statut={profil.statut_permis} />
        </div>
        <div style={{ padding: '16px 20px' }}>
          {profil.motif_rejet_permis && (
            <div className="notice warn" style={{ marginBottom: 16 }}>
              <strong>Motif de rejet :</strong> {profil.motif_rejet_permis}
            </div>
          )}
          {permisUrl ? (
            <>
              {permisIsPdf ? (
                <iframe
                  src={permisUrl}
                  style={{ width: '100%', height: 480, border: '1px solid var(--line)', borderRadius: 6 }}
                  title="Permis de conduire"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={permisUrl}
                  alt="Permis de conduire"
                  style={{ width: '100%', maxHeight: 480, objectFit: 'contain', border: '1px solid var(--line)', borderRadius: 6, background: '#f5f5f5' }}
                />
              )}
              <a href={permisUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 10, display: 'inline-block' }}>
                Ouvrir en plein écran →
              </a>
            </>
          ) : (
            <span style={{ fontSize: 13, color: profil.permis_url ? 'var(--danger)' : 'var(--ink-3)' }}>
              {profil.permis_url ? 'Erreur de chargement' : 'Non fourni — non requis pour la location'}
            </span>
          )}
        </div>
        {profil.statut_permis === 'en_attente' && (
          <div style={{ padding: '0 20px 20px' }}>
            <VerificationActions id={id} type="permis" />
          </div>
        )}
      </div>
    </>
  )
}

function DocPreview({ label, url }: { label: string; url: string | null }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 500 }}>{label}</div>
      <div style={{ padding: 12 }}>
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} style={{ width: '100%', maxHeight: 320, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4 }} />
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: 'inline-block' }}>
              Agrandir →
            </a>
          </>
        ) : (
          <span style={{ fontSize: 13, color: 'var(--danger)' }}>Non fourni</span>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)', width: 120, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', flex: 1 }}>{value}</span>
    </div>
  )
}

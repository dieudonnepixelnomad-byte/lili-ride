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

export default async function AdminVerificationPermisPage({ params }: Props) {
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

  let permisUrl: string | null = null
  if (profil.permis_url) {
    const { data, error } = await supabase.storage.from('documents').createSignedUrl(profil.permis_url, 3600)
    if (error) console.error('[admin/verifications/id] createSignedUrl error:', error)
    else permisUrl = data.signedUrl
  }
  const permisIsPdf = profil.permis_url?.toLowerCase().endsWith('.pdf') ?? false

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/verifications" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Permis — {u?.nom ?? '—'}</h1>
            <p className="page-sub">Soumis le {formatDate(profil.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={profil.statut_conducteur} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
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

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Permis de conduire</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Statut" value={<StatusBadge statut={profil.statut_conducteur} />} />
            {profil.motif_rejet && <Row label="Motif rejet" value={profil.motif_rejet} />}
            <div style={{ marginTop: 8 }}>
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
                <span style={{ fontSize: 13, color: 'var(--danger)' }}>
                  {profil.permis_url ? 'Erreur de chargement du document' : 'Permis non fourni'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {profil.statut_conducteur === 'rejeté' && profil.motif_rejet && (
        <div className="notice warn" style={{ marginTop: 24 }}>
          <div><strong>Motif de rejet :</strong> {profil.motif_rejet}</div>
        </div>
      )}

      {profil.statut_conducteur === 'en_attente' && (
        <VerificationActions id={id} type="conducteur" />
      )}
    </>
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

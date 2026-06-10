import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'
import Avatar from '@/components/shared/Avatar'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function AdminVerificationDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profil } = await supabase
    .from('profils_transporteur')
    .select('*, users(nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .single()

  if (!profil) notFound()

  const u = (profil as Record<string, unknown>).users as { nom: string; telephone: string; whatsapp?: string; ville: string; photo_url?: string } | null

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/verifications" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Vérification — {u?.nom ?? '—'}</h1>
            <p className="page-sub">Soumis le {formatDate(profil.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={profil.statut_verification} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Transporteur info */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Transporteur</div>
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
            {u?.whatsapp && <Row label="WhatsApp" value={<a href={`https://wa.me/${u.whatsapp.replace(/\D/g, '')}`} style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">{u.whatsapp}</a>} />}
          </div>
        </div>

        {/* Véhicule info */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Véhicule</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Type" value={profil.type_vehicule ?? '—'} />
            <Row label="Marque/Modèle" value={profil.marque && profil.modele ? `${profil.marque} ${profil.modele}` : '—'} />
            <Row label="Plaque" value={profil.plaque ?? '—'} />
            {profil.nb_places && <Row label="Nb places" value={String(profil.nb_places)} />}
            {profil.capacite_kg && <Row label="Capacité" value={`${profil.capacite_kg} kg`} />}
            {profil.types_colis_acceptes?.length > 0 && (
              <Row label="Colis acceptés" value={(profil.types_colis_acceptes as string[]).join(', ')} />
            )}
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Documents</div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Permis de conduire', url: profil.permis_url },
            { label: 'Carte grise', url: profil.carte_grise_url },
            { label: 'Photo du véhicule', url: profil.photo_vehicule_url },
          ].map(({ label, url }) => (
            <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 500 }}>{label}</div>
              <div style={{ padding: 14 }}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Voir le document →
                  </a>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Non fourni</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Motif rejet */}
      {profil.statut_verification === 'rejeté' && profil.motif_rejet && (
        <div className="notice warn" style={{ marginTop: 24 }}>
          <div>
            <strong>Motif de rejet :</strong> {profil.motif_rejet}
          </div>
        </div>
      )}

      {/* Actions */}
      {profil.statut_verification === 'en_attente' && (
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <form action={`/api/admin/verifications/${id}/approuver`} method="POST" style={{ display: 'contents' }}>
            <button type="submit" className="btn btn-primary">Approuver le profil</button>
          </form>
          <form action={`/api/admin/verifications/${id}/rejeter`} method="POST" style={{ display: 'contents' }}>
            <input type="text" name="motif" placeholder="Motif du rejet (obligatoire)" className="input" style={{ width: 280 }} required />
            <button type="submit" className="btn btn-outline" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>Rejeter</button>
          </form>
        </div>
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

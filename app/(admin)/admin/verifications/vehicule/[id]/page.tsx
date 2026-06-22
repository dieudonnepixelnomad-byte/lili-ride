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

export default async function AdminVerificationVehiculePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicule } = await supabase
    .from('vehicules_transporteur')
    .select('*, users!vehicules_transporteur_user_id_fkey(nom, telephone, whatsapp, ville, photo_url)')
    .eq('id', id)
    .single()

  if (!vehicule) notFound()

  const u = (vehicule as Record<string, unknown>).users as {
    nom: string
    telephone: string
    whatsapp?: string
    ville: string
    photo_url?: string
  } | null

  const carteGriseUrl = vehicule.carte_grise_url
    ? (await supabase.storage.from('documents').createSignedUrl(vehicule.carte_grise_url, 3600)).data?.signedUrl ?? null
    : null

  const photoVehiculeUrl = vehicule.photo_vehicule_url
    ? (await supabase.storage.from('photos').getPublicUrl(vehicule.photo_vehicule_url)).data.publicUrl
    : null

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/verifications" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Véhicule — {u?.nom ?? '—'}</h1>
            <p className="page-sub">Soumis le {formatDate(vehicule.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={vehicule.statut_verification} />
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
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Informations du véhicule</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Type" value={vehicule.type_vehicule ?? '—'} />
            <Row label="Marque / Modèle" value={vehicule.marque && vehicule.modele ? `${vehicule.marque} ${vehicule.modele}` : '—'} />
            <Row label="Plaque" value={vehicule.plaque ?? '—'} />
            {vehicule.nb_places && <Row label="Nb places" value={String(vehicule.nb_places)} />}
            {vehicule.capacite_kg && <Row label="Capacité colis" value={`${vehicule.capacite_kg} kg`} />}
            {vehicule.volume_m3 && <Row label="Volume" value={`${vehicule.volume_m3} m³`} />}
            {(vehicule.types_colis_acceptes as string[] | null)?.length ? (
              <Row label="Colis acceptés" value={(vehicule.types_colis_acceptes as string[]).join(', ')} />
            ) : null}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Documents</div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Carte grise', url: carteGriseUrl, required: true },
            { label: 'Photo du véhicule', url: photoVehiculeUrl, required: false },
          ].map(({ label, url, required }) => (
            <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 500 }}>
                {label}
                {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
              </div>
              <div style={{ padding: 14 }}>
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    Voir le document →
                  </a>
                ) : (
                  <span style={{ fontSize: 13, color: required ? 'var(--danger)' : 'var(--ink-3)' }}>
                    {required ? 'Manquant' : 'Non fourni'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {vehicule.statut_verification === 'rejeté' && vehicule.motif_rejet && (
        <div className="notice warn" style={{ marginTop: 24 }}>
          <div><strong>Motif de rejet :</strong> {vehicule.motif_rejet}</div>
        </div>
      )}

      {vehicule.statut_verification === 'en_attente' && (
        <VerificationActions id={id} type="vehicule" />
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

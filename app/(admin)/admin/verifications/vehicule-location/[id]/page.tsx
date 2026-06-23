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

export default async function AdminVerificationVehiculeLocationPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: vehicule } = await supabase
    .from('vehicules')
    .select('*, users!vehicules_user_id_fkey(nom, telephone, whatsapp, ville, photo_url)')
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

  const photoUrl = (vehicule.photos_urls as string[] | null)?.[0]
    ? supabase.storage.from('photos').getPublicUrl((vehicule.photos_urls as string[])[0]).data.publicUrl
    : null

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/verifications" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Véhicule location — {u?.nom ?? '—'}</h1>
            <p className="page-sub">Soumis le {formatDate(vehicule.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={vehicule.statut_carte_grise} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Propriétaire</div>
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
            <Row label="Marque / Modèle" value={`${vehicule.marque} ${vehicule.modele}`} />
            {vehicule.annee && <Row label="Année" value={String(vehicule.annee)} />}
            {vehicule.couleur && <Row label="Couleur" value={vehicule.couleur} />}
            <Row label="Nb places" value={String(vehicule.nb_places)} />
            {vehicule.carburant && <Row label="Carburant" value={vehicule.carburant} />}
            {vehicule.boite && <Row label="Boîte" value={vehicule.boite} />}
            <Row label="Lieu" value={vehicule.lieu_label} />
            <Row label="Prix/jour" value={`${vehicule.prix_jour.toLocaleString('fr-FR')} FCFA`} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Documents</div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { label: 'Carte grise', url: carteGriseUrl, required: true },
            { label: 'Photo du véhicule', url: photoUrl, required: false },
          ].map(({ label, url, required }) => (
            <div key={label} style={{ border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--line)', fontSize: 13, fontWeight: 500 }}>
                {label}
                {required && <span style={{ color: 'var(--danger)', marginLeft: 4 }}>*</span>}
              </div>
              <div style={{ padding: 14 }}>
                {url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={label} style={{ width: '100%', maxHeight: 280, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4 }} />
                    <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ marginTop: 8, display: 'inline-block' }}>
                      Voir en plein écran →
                    </a>
                  </>
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

      {vehicule.statut_carte_grise === 'rejeté' && vehicule.motif_rejet_cg && (
        <div className="notice warn" style={{ marginTop: 24 }}>
          <div><strong>Motif de rejet :</strong> {vehicule.motif_rejet_cg}</div>
        </div>
      )}

      {vehicule.statut_carte_grise === 'en_attente' && (
        <VerificationActions id={id} type="vehicule-location" />
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

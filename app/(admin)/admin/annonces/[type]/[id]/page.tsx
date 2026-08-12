import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnnonceModerationActions from '@/components/admin/AnnonceModerationActions'
import Avatar from '@/components/shared/Avatar'
import StatusBadge from '@/components/shared/StatusBadge'

interface Props {
  params: Promise<{ type: string; id: string }>
}

type Owner = {
  nom: string
  telephone?: string
  whatsapp?: string
  email?: string
  ville?: string
  photo_url?: string
}

function formatDate(date: string) {
  return new Date(date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: 14, alignItems: 'start' }}>
      <span style={{ color: 'var(--ink-3)', fontSize: 13 }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontSize: 14, overflowWrap: 'anywhere' }}>{value || '—'}</span>
    </div>
  )
}

function OwnerCard({ owner }: { owner: Owner | null }) {
  return (
    <div className="card card-pad">
      <h2 style={{ fontSize: 16, marginBottom: 18 }}>Propriétaire de l’annonce</h2>
      {owner ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 5 }}>
            <Avatar nom={owner.nom} size="md" />
            <div><div style={{ fontWeight: 600 }}>{owner.nom}</div><div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{owner.ville}</div></div>
          </div>
          <Row label="Téléphone" value={owner.telephone ? <a href={`tel:${owner.telephone}`} style={{ color: 'var(--primary)' }}>{owner.telephone}</a> : '—'} />
          <Row label="WhatsApp" value={owner.whatsapp ?? '—'} />
          <Row label="E-mail" value={owner.email ?? '—'} />
        </div>
      ) : <p style={{ color: 'var(--ink-3)' }}>Profil indisponible.</p>}
    </div>
  )
}

function ModerationHistory({ annonce }: { annonce: Record<string, unknown> }) {
  if (!annonce.modere_le && !annonce.motif_moderation) return null
  return (
    <div className={`notice ${annonce.statut === 'actif' ? 'success' : 'warn'}`} style={{ marginTop: 24 }}>
      <div>
        <strong>Dernière décision :</strong> {annonce.modere_le ? formatDate(String(annonce.modere_le)) : 'date inconnue'}
        {annonce.motif_moderation ? <div style={{ marginTop: 5 }}><strong>Motif :</strong> {String(annonce.motif_moderation)}</div> : null}
      </div>
    </div>
  )
}

export default async function AdminAnnonceDetailPage({ params }: Props) {
  const { type, id } = await params
  if (type !== 'trajet' && type !== 'vehicule') notFound()

  const supabase = await createClient()

  if (type === 'trajet') {
    const { data: trajet } = await supabase
      .from('trajets')
      .select('*, users(nom, telephone, whatsapp, email, ville, photo_url), vehicules_transporteur(marque, modele, plaque, type_vehicule)')
      .eq('id', id)
      .single()
    if (!trajet) notFound()

    const raw = trajet as unknown as Record<string, unknown>
    const owner = raw.users as Owner | null
    const transportVehicle = raw.vehicules_transporteur as { marque?: string; modele?: string; plaque?: string; type_vehicule?: string } | null

    return (
      <>
        <div className="page-head">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <Link href="/admin/annonces" className="btn btn-ghost btn-sm">← Retour</Link>
            <div>
              <span className="kicker">{trajet.type === 'colis' ? 'Transport de colis' : 'Covoiturage'}</span>
              <h1 className="page-title">{trajet.depart_label} → {trajet.arrivee_label}</h1>
              <p className="page-sub">Publié le {formatDate(trajet.created_at)}</p>
            </div>
          </div>
          <StatusBadge statut={trajet.statut} />
        </div>

        <div className="admin-detail-grid">
          <div className="card card-pad">
            <h2 style={{ fontSize: 16, marginBottom: 18 }}>Contenu de l’annonce</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <Row label="Départ" value={trajet.depart_label} />
              <Row label="Arrivée" value={trajet.arrivee_label} />
              <Row label="Date et heure" value={`${trajet.date_depart} à ${String(trajet.heure_depart).slice(0, 5)}`} />
              <Row label="Tarif" value={`${trajet.prix.toLocaleString('fr-FR')} FCFA${trajet.type === 'colis' ? ' / kg' : ''}`} />
              {trajet.type === 'covoiturage' ? <Row label="Places disponibles" value={String(trajet.places_dispo ?? '—')} /> : null}
              {trajet.type === 'colis' ? <Row label="Poids maximum" value={trajet.poids_max_kg ? `${trajet.poids_max_kg} kg` : '—'} /> : null}
              {trajet.type === 'colis' ? <Row label="Types de colis" value={(trajet.types_colis as string[] | null)?.join(', ') ?? '—'} /> : null}
              <Row label="Embarquement" value={trajet.lieu_embarquement ?? '—'} />
              <Row label="Débarquement" value={trajet.lieu_debarquement ?? '—'} />
              <Row label="Description" value={trajet.description ?? '—'} />
              {transportVehicle ? <Row label="Véhicule" value={`${transportVehicle.marque ?? ''} ${transportVehicle.modele ?? ''} · ${transportVehicle.type_vehicule ?? '—'} · ${transportVehicle.plaque ?? '—'}`} /> : null}
            </div>
          </div>
          <OwnerCard owner={owner} />
        </div>

        <ModerationHistory annonce={raw} />
        <AnnonceModerationActions id={id} type="trajet" statut={trajet.statut} />
      </>
    )
  }

  const { data: vehicule } = await supabase
    .from('vehicules')
    .select('*, users!vehicules_user_id_fkey(nom, telephone, whatsapp, email, ville, photo_url)')
    .eq('id', id)
    .single()
  if (!vehicule) notFound()

  const raw = vehicule as unknown as Record<string, unknown>
  const owner = raw.users as Owner | null
  const photos = (vehicule.photos_urls as string[] | null) ?? []

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <Link href="/admin/annonces" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <span className="kicker">Location de véhicule</span>
            <h1 className="page-title">{vehicule.marque} {vehicule.modele}</h1>
            <p className="page-sub">Publié le {formatDate(vehicule.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={vehicule.statut} />
      </div>

      {photos.length > 0 ? (
        <div className="card card-pad" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, marginBottom: 16 }}>Photos publiées</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
            {photos.map((photo, index) => (
              <a href={photo} target="_blank" rel="noreferrer" key={photo} style={{ display: 'block', aspectRatio: '4 / 3', borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Photo ${index + 1} du véhicule`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="admin-detail-grid">
        <div className="card card-pad">
          <h2 style={{ fontSize: 16, marginBottom: 18 }}>Contenu de l’annonce</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Row label="Marque / modèle" value={`${vehicule.marque} ${vehicule.modele}`} />
            <Row label="Année" value={vehicule.annee ? String(vehicule.annee) : '—'} />
            <Row label="Couleur" value={vehicule.couleur ?? '—'} />
            <Row label="Nombre de places" value={String(vehicule.nb_places)} />
            <Row label="Carburant" value={vehicule.carburant ?? '—'} />
            <Row label="Boîte" value={vehicule.boite ?? '—'} />
            <Row label="Lieu" value={vehicule.lieu_label} />
            <Row label="Tarif" value={`${vehicule.prix_jour.toLocaleString('fr-FR')} FCFA / jour`} />
            <Row label="Disponibilité" value={vehicule.disponible ? 'Disponible' : 'Indisponible'} />
            <Row label="Carte grise" value={<StatusBadge statut={vehicule.statut_carte_grise} />} />
            <Row label="Équipements" value={(vehicule.equipements as string[] | null)?.join(', ') ?? '—'} />
            <Row label="Description" value={vehicule.description ?? '—'} />
          </div>
        </div>
        <OwnerCard owner={owner} />
      </div>

      <ModerationHistory annonce={raw} />
      {vehicule.statut_carte_grise !== 'vérifié' ? (
        <div className="notice warn" style={{ marginTop: 24 }}>
          <div>La carte grise doit être vérifiée avant l’activation publique. <Link href={`/admin/verifications/vehicule-location/${id}`} style={{ color: 'inherit', textDecoration: 'underline' }}>Examiner la carte grise →</Link></div>
        </div>
      ) : null}
      <AnnonceModerationActions id={id} type="vehicule" statut={vehicule.statut} />
    </>
  )
}

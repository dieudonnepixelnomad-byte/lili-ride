import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StatusBadge from '@/components/shared/StatusBadge'

interface Props {
  params: Promise<{ id: string }>
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default async function AdminDemandeDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: demande } = await supabase
    .from('demandes')
    .select('*, trajets(depart_label, arrivee_label, date_depart, heure_depart, prix, type), vehicules(marque, modele, annee, prix_jour, lieu_label), users(nom, telephone, ville)')
    .eq('id', id)
    .single()

  if (!demande) notFound()

  const raw = demande as Record<string, unknown>
  const trajet = raw.trajets as { depart_label: string; arrivee_label: string; date_depart: string; heure_depart: string; prix: number; type: string } | null
  const vehicule = raw.vehicules as { marque: string; modele: string; annee?: number; prix_jour: number; lieu_label: string } | null
  const user = raw.users as { nom: string; telephone: string; ville: string } | null

  return (
    <>
      <div className="page-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/demandes" className="btn btn-ghost btn-sm">← Retour</Link>
          <div>
            <h1 className="page-title">Demande #{id.slice(0, 8)}</h1>
            <p className="page-sub">Reçue le {formatDate(demande.created_at)}</p>
          </div>
        </div>
        <StatusBadge statut={demande.statut} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Client info */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Informations client</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Nom" value={demande.nom_client} />
            <Row label="Téléphone" value={<a href={`tel:${demande.telephone}`} style={{ color: 'var(--primary)' }}>{demande.telephone}</a>} />
            {demande.whatsapp && <Row label="WhatsApp" value={<a href={`https://wa.me/${demande.whatsapp.replace(/\D/g, '')}`} style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">{demande.whatsapp}</a>} />}
            {user && <Row label="Ville" value={user.ville} />}
            <Row label="Canal" value={<span className="badge" style={{ textTransform: 'capitalize' }}>{demande.origine}</span>} />
          </div>
        </div>

        {/* Demande details */}
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Détails de la demande</div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Row label="Service" value={<span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{demande.type}</span>} />
            {trajet && (
              <>
                <Row label="Trajet" value={`${trajet.depart_label} → ${trajet.arrivee_label}`} />
                <Row label="Date" value={`${trajet.date_depart} à ${trajet.heure_depart}`} />
                <Row label="Prix" value={`${trajet.prix.toLocaleString('fr-FR')} FCFA`} />
              </>
            )}
            {vehicule && (
              <>
                <Row label="Véhicule" value={`${vehicule.marque} ${vehicule.modele}${vehicule.annee ? ` (${vehicule.annee})` : ''}`} />
                <Row label="Lieu" value={vehicule.lieu_label} />
                <Row label="Prix/jour" value={`${vehicule.prix_jour.toLocaleString('fr-FR')} FCFA`} />
                {demande.date_debut && <Row label="Du" value={demande.date_debut} />}
                {demande.date_fin && <Row label="Au" value={demande.date_fin} />}
              </>
            )}
            {demande.nb_places && <Row label="Nb places" value={String(demande.nb_places)} />}
            {demande.description_colis && <Row label="Colis" value={demande.description_colis} />}
            {demande.poids_estime && <Row label="Poids estimé" value={demande.poids_estime} />}
            {demande.message && <Row label="Message" value={demande.message} />}
          </div>
        </div>
      </div>

      {/* Notes support */}
      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', fontWeight: 600, fontSize: 14 }}>Notes support (internes)</div>
        <div style={{ padding: '16px 20px' }}>
          {demande.notes_support ? (
            <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)' }}>{demande.notes_support}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>Aucune note.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
        <form action={`/api/admin/demandes/${id}/statut`} method="POST" style={{ display: 'contents' }}>
          <input type="hidden" name="statut" value="traitée" />
          <button type="submit" className="btn btn-primary" disabled={demande.statut === 'traitée'}>
            Marquer comme traitée
          </button>
        </form>
        <form action={`/api/admin/demandes/${id}/statut`} method="POST" style={{ display: 'contents' }}>
          <input type="hidden" name="statut" value="annulée" />
          <button type="submit" className="btn btn-outline" disabled={demande.statut === 'annulée'}>
            Annuler
          </button>
        </form>
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)', width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 14, color: 'var(--ink)', flex: 1 }}>{value}</span>
    </div>
  )
}

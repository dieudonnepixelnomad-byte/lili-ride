type Statut = string

const labels: Record<string, string> = {
  actif: 'Actif',
  complet: 'Complet',
  annulé: 'Annulé',
  en_attente: 'En attente',
  traitée: 'Traitée',
  annulée: 'Annulée',
  non_soumis: 'Non soumis',
  'vérifié': 'Vérifié',
  rejeté: 'Rejeté',
  'en_attente_verif': 'En attente',
}

const statusClass: Record<string, string> = {
  actif: 'status-actif',
  complet: 'status-attente',
  annulé: 'status-annulee',
  en_attente: 'status-en_attente',
  traitée: 'status-traitee',
  annulée: 'status-annulee',
  non_soumis: 'status-non',
  'vérifié': 'status-verifie',
  rejeté: 'status-rejete',
}

export default function StatusBadge({ statut }: { statut: Statut }) {
  return (
    <span className={`status ${statusClass[statut] ?? 'status-non'}`}>
      {labels[statut] ?? statut}
    </span>
  )
}

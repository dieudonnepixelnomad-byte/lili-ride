export type UserRole = 'user' | 'admin'

export type StatutCni = 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'

export type StatutPermis = 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'

export type StatutVerification = 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'

export type StatutCarteGrise = 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'

export type StatutTrajet = 'actif' | 'complet' | 'annulé'

export type StatutVehicule = 'actif' | 'suspendu'

export type StatutDemande = 'en_attente' | 'traitée' | 'annulée'

export type TypeTrajet = 'covoiturage' | 'colis'

export type TypeDemande = 'covoiturage' | 'colis' | 'location'

export type OrigineContact = 'formulaire' | 'telephone' | 'whatsapp'

export type TypeVehicule = 'Berline' | 'SUV' | 'Minibus' | 'Camionnette' | 'Moto'

export type TypeColis = 'documents' | 'petit' | 'volumineux' | 'fragile'

export type Carburant = 'essence' | 'diesel' | 'hybride'

export type Boite = 'manuelle' | 'automatique'

export interface User {
  id: string
  nom: string
  email?: string
  telephone?: string
  whatsapp?: string
  ville: string
  photo_url?: string
  role: UserRole
  created_at: string
}

// Conductor-level profile (1-to-1 with user) — CNI + permis
export interface ProfilTransporteur {
  id: string
  user_id: string
  // CNI
  cni_recto_url?: string
  cni_verso_url?: string
  statut_cni: StatutCni
  motif_rejet_cni?: string
  verifie_cni_par?: string
  verifie_cni_le?: string
  // Permis de conduire (covoiturage + colis only)
  permis_url?: string
  statut_permis: StatutPermis
  motif_rejet_permis?: string
  verifie_permis_par?: string
  verifie_permis_le?: string
  created_at: string
}

// Vehicle-level profile (1-to-N with user) — each verified independently
export interface VehiculeTransporteur {
  id: string
  user_id: string
  type_vehicule?: TypeVehicule
  marque?: string
  modele?: string
  plaque?: string
  nb_places?: number
  capacite_kg?: number
  volume_m3?: number
  types_colis_acceptes?: TypeColis[]
  equipements?: string[]
  carte_grise_url?: string
  photo_vehicule_url?: string
  statut_verification: StatutVerification
  motif_rejet?: string
  verifie_par?: string
  verifie_le?: string
  created_at: string
  users?: Pick<User, 'id' | 'nom' | 'telephone' | 'ville' | 'photo_url'>
}

export interface Trajet {
  id: string
  user_id: string
  vehicule_transporteur_id?: string
  type: TypeTrajet
  depart_label: string
  depart_lat?: number
  depart_lng?: number
  arrivee_label: string
  arrivee_lat?: number
  arrivee_lng?: number
  date_depart: string
  heure_depart: string
  prix: number
  places_dispo?: number
  types_colis?: TypeColis[]
  description?: string
  statut: StatutTrajet
  created_at: string
  users?: Pick<User, 'id' | 'nom' | 'telephone' | 'ville' | 'photo_url' | 'email'>
}

export interface Vehicule {
  id: string
  user_id: string
  marque: string
  modele: string
  annee?: number
  couleur?: string
  nb_places: number
  carburant?: Carburant
  boite?: Boite
  lieu_label: string
  lieu_lat?: number
  lieu_lng?: number
  prix_jour: number
  photos_urls: string[]
  disponible: boolean
  description?: string
  statut: StatutVehicule
  // Carte grise verification
  carte_grise_url?: string
  statut_carte_grise: StatutCarteGrise
  motif_rejet_cg?: string
  verifie_par?: string
  verifie_le?: string
  created_at: string
  users?: Pick<User, 'id' | 'nom' | 'telephone' | 'ville' | 'photo_url' | 'email'>
}

export interface Demande {
  id: string
  user_id?: string
  type: TypeDemande
  trajet_id?: string
  vehicule_id?: string
  nom_client: string
  telephone: string
  whatsapp?: string
  nb_places?: number
  description_colis?: string
  poids_estime?: string
  date_debut?: string
  date_fin?: string
  message?: string
  origine: OrigineContact
  statut: StatutDemande
  notes_support?: string
  created_at: string
  trajets?: Pick<Trajet, 'id' | 'type' | 'depart_label' | 'arrivee_label' | 'date_depart' | 'prix'>
  vehicules?: Pick<Vehicule, 'id' | 'marque' | 'modele' | 'prix_jour'>
  users?: Pick<User, 'id' | 'nom' | 'telephone' | 'email'>
}

export interface SearchParams {
  depart?: string
  arrivee?: string
  date?: string
  type?: TypeTrajet | 'location'
}

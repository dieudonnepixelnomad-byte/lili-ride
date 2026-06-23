export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          nom: string
          telephone: string
          email: string | null
          whatsapp: string | null
          ville: string
          photo_url: string | null
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          telephone: string
          email?: string | null
          whatsapp?: string | null
          ville: string
          photo_url?: string | null
          role?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      profils_transporteur: {
        Row: {
          id: string
          user_id: string
          // CNI
          cni_recto_url: string | null
          cni_verso_url: string | null
          statut_cni: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_cni: string | null
          verifie_cni_par: string | null
          verifie_cni_le: string | null
          // Permis de conduire
          permis_url: string | null
          statut_permis: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_permis: string | null
          verifie_permis_par: string | null
          verifie_permis_le: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cni_recto_url?: string | null
          cni_verso_url?: string | null
          statut_cni?: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_cni?: string | null
          verifie_cni_par?: string | null
          verifie_cni_le?: string | null
          permis_url?: string | null
          statut_permis?: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_permis?: string | null
          verifie_permis_par?: string | null
          verifie_permis_le?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profils_transporteur']['Insert']>
      }
      vehicules_transporteur: {
        Row: {
          id: string
          user_id: string
          type_vehicule: 'Berline' | 'SUV' | 'Minibus' | 'Camionnette' | 'Moto' | null
          marque: string | null
          modele: string | null
          plaque: string | null
          nb_places: number | null
          capacite_kg: number | null
          volume_m3: number | null
          types_colis_acceptes: string[] | null
          equipements: string[] | null
          carte_grise_url: string | null
          photo_vehicule_url: string | null
          statut_verification: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet: string | null
          verifie_par: string | null
          verifie_le: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type_vehicule?: 'Berline' | 'SUV' | 'Minibus' | 'Camionnette' | 'Moto' | null
          marque?: string | null
          modele?: string | null
          plaque?: string | null
          nb_places?: number | null
          capacite_kg?: number | null
          volume_m3?: number | null
          types_colis_acceptes?: string[] | null
          equipements?: string[] | null
          carte_grise_url?: string | null
          photo_vehicule_url?: string | null
          statut_verification?: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet?: string | null
          verifie_par?: string | null
          verifie_le?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicules_transporteur']['Insert']>
      }
      trajets: {
        Row: {
          id: string
          user_id: string
          vehicule_transporteur_id: string | null
          type: 'covoiturage' | 'colis'
          depart_label: string
          depart_lat: number | null
          depart_lng: number | null
          arrivee_label: string
          arrivee_lat: number | null
          arrivee_lng: number | null
          date_depart: string
          heure_depart: string
          prix: number
          places_dispo: number | null
          types_colis: string[] | null
          description: string | null
          statut: 'actif' | 'complet' | 'annulé'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vehicule_transporteur_id?: string | null
          type: 'covoiturage' | 'colis'
          depart_label: string
          depart_lat?: number | null
          depart_lng?: number | null
          arrivee_label: string
          arrivee_lat?: number | null
          arrivee_lng?: number | null
          date_depart: string
          heure_depart: string
          prix: number
          places_dispo?: number | null
          types_colis?: string[] | null
          description?: string | null
          statut?: 'actif' | 'complet' | 'annulé'
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['trajets']['Insert']>
      }
      vehicules: {
        Row: {
          id: string
          user_id: string
          marque: string
          modele: string
          annee: number | null
          couleur: string | null
          nb_places: number
          carburant: 'essence' | 'diesel' | 'hybride' | null
          boite: 'manuelle' | 'automatique' | null
          lieu_label: string
          lieu_lat: number | null
          lieu_lng: number | null
          prix_jour: number
          photos_urls: string[]
          equipements: string[] | null
          disponible: boolean
          description: string | null
          statut: 'actif' | 'suspendu'
          carte_grise_url: string | null
          statut_carte_grise: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_cg: string | null
          verifie_par: string | null
          verifie_le: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          marque: string
          modele: string
          annee?: number | null
          couleur?: string | null
          nb_places: number
          carburant?: 'essence' | 'diesel' | 'hybride' | null
          boite?: 'manuelle' | 'automatique' | null
          lieu_label: string
          lieu_lat?: number | null
          lieu_lng?: number | null
          prix_jour: number
          photos_urls?: string[]
          equipements?: string[] | null
          disponible?: boolean
          description?: string | null
          statut?: 'actif' | 'suspendu'
          carte_grise_url?: string | null
          statut_carte_grise?: 'non_soumis' | 'en_attente' | 'vérifié' | 'rejeté'
          motif_rejet_cg?: string | null
          verifie_par?: string | null
          verifie_le?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicules']['Insert']>
      }
      demandes: {
        Row: {
          id: string
          user_id: string | null
          type: 'covoiturage' | 'colis' | 'location'
          trajet_id: string | null
          vehicule_id: string | null
          nom_client: string
          telephone: string
          whatsapp: string | null
          nb_places: number | null
          description_colis: string | null
          poids_estime: string | null
          date_debut: string | null
          date_fin: string | null
          message: string | null
          origine: 'formulaire' | 'telephone' | 'whatsapp'
          statut: 'en_attente' | 'traitée' | 'annulée'
          notes_support: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: 'covoiturage' | 'colis' | 'location'
          trajet_id?: string | null
          vehicule_id?: string | null
          nom_client: string
          telephone: string
          whatsapp?: string | null
          nb_places?: number | null
          description_colis?: string | null
          poids_estime?: string | null
          date_debut?: string | null
          date_fin?: string | null
          message?: string | null
          origine?: 'formulaire' | 'telephone' | 'whatsapp'
          statut?: 'en_attente' | 'traitée' | 'annulée'
          notes_support?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['demandes']['Insert']>
      }
    }
  }
}

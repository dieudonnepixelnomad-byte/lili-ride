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
          whatsapp?: string | null
          ville: string
          photo_url?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          telephone?: string
          whatsapp?: string | null
          ville?: string
          photo_url?: string | null
          role?: string
          created_at?: string
        }
      }
      profils_transporteur: {
        Row: {
          id: string
          user_id: string
          type_vehicule: string | null
          marque: string | null
          modele: string | null
          plaque: string | null
          nb_places: number | null
          capacite_kg: number | null
          volume_m3: number | null
          types_colis_acceptes: string[] | null
          permis_url: string | null
          carte_grise_url: string | null
          photo_vehicule_url: string | null
          statut_verification: string
          motif_rejet: string | null
          verifie_par: string | null
          verifie_le: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type_vehicule?: string | null
          marque?: string | null
          modele?: string | null
          plaque?: string | null
          nb_places?: number | null
          capacite_kg?: number | null
          volume_m3?: number | null
          types_colis_acceptes?: string[] | null
          permis_url?: string | null
          carte_grise_url?: string | null
          photo_vehicule_url?: string | null
          statut_verification?: string
          motif_rejet?: string | null
          verifie_par?: string | null
          verifie_le?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['profils_transporteur']['Insert']>
      }
      trajets: {
        Row: {
          id: string
          user_id: string
          type: string
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
          statut: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
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
          statut?: string
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
          carburant: string | null
          boite: string | null
          lieu_label: string
          lieu_lat: number | null
          lieu_lng: number | null
          prix_jour: number
          photos_urls: string[]
          disponible: boolean
          description: string | null
          statut: string
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
          carburant?: string | null
          boite?: string | null
          lieu_label: string
          lieu_lat?: number | null
          lieu_lng?: number | null
          prix_jour: number
          photos_urls?: string[]
          disponible?: boolean
          description?: string | null
          statut?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['vehicules']['Insert']>
      }
      demandes: {
        Row: {
          id: string
          user_id: string | null
          type: string
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
          origine: string
          statut: string
          notes_support: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
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
          origine?: string
          statut?: string
          notes_support?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['demandes']['Insert']>
      }
    }
  }
}

import { Resend } from 'resend'
import type { Demande, Trajet, Vehicule } from '@/types'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@liliride.cm'
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'Lili-Ride <onboarding@resend.dev>'

interface NotifPayload {
  demandeId: string
  type: string
  nomClient: string
  telephone: string
  whatsapp?: string
  annonceLabel: string
}

export async function sendAdminNotification(payload: NotifPayload) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const typeLabel = { covoiturage: 'Covoiturage', colis: 'Transport de colis', location: 'Location de véhicule' }[payload.type] ?? payload.type
  const adminUrl = `${appUrl}/admin/demandes/${payload.demandeId}`

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `[Lili-Ride] Nouvelle demande ${typeLabel} — ${payload.nomClient}`,
    html: buildSimpleAdminEmailHtml({ ...payload, typeLabel, adminUrl }),
  })
}

function buildSimpleAdminEmailHtml(p: NotifPayload & { typeLabel: string; adminUrl: string }): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Nouvelle demande Lili-Ride</title></head>
<body style="font-family: system-ui, sans-serif; background: #FAFBFC; padding: 32px; color: #0E1B2C;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #E6EAF0; border-radius: 14px; overflow: hidden;">
    <div style="background: #1A4E8A; padding: 24px 32px;">
      <div style="color: #fff; font-size: 22px; font-weight: 600;">Lili-Ride</div>
      <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px;">Nouvelle demande — ${p.typeLabel}</div>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #5A6A7E; width: 140px;">Nom client</td><td style="padding: 8px 0; font-weight: 500;">${p.nomClient}</td></tr>
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Téléphone</td><td style="padding: 8px 0;"><a href="tel:${p.telephone}" style="color: #1A4E8A;">${p.telephone}</a></td></tr>
        ${p.whatsapp ? `<tr><td style="padding: 8px 0; color: #5A6A7E;">WhatsApp</td><td style="padding: 8px 0;"><a href="https://wa.me/${p.whatsapp.replace(/\D/g, '')}" style="color: #0F8A6B;">${p.whatsapp}</a></td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Service</td><td style="padding: 8px 0;">${p.typeLabel}</td></tr>
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Annonce</td><td style="padding: 8px 0;">${p.annonceLabel || '—'}</td></tr>
      </table>
      <div style="margin-top: 28px;">
        <a href="${p.adminUrl}" style="display: inline-flex; align-items: center; height: 44px; padding: 0 20px; background: #1A4E8A; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 500;">Voir la demande →</a>
      </div>
    </div>
    <div style="padding: 16px 32px; background: #F6F8FA; border-top: 1px solid #E6EAF0; font-size: 12px; color: #8A98A8;">
      Lili-Ride · Douala · Yaoundé · Bafoussam
    </div>
  </div>
</body>
</html>`
}

interface EmailDemandePayload {
  demande: Demande
  trajet?: Trajet | null
  vehicule?: Vehicule | null
  adminUrl: string
}

export function buildAdminEmailHtml({ demande, trajet, vehicule, adminUrl }: EmailDemandePayload): string {
  const typeLabel = { covoiturage: 'Covoiturage', colis: 'Transport de colis', location: 'Location de véhicule' }[demande.type]
  const annonce = trajet
    ? `${trajet.depart_label} → ${trajet.arrivee_label} le ${trajet.date_depart} — ${trajet.prix.toLocaleString('fr-FR')} FCFA`
    : vehicule
    ? `${vehicule.marque} ${vehicule.modele} — ${vehicule.prix_jour.toLocaleString('fr-FR')} FCFA/jour`
    : '—'

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Nouvelle demande Lili-Ride</title></head>
<body style="font-family: system-ui, sans-serif; background: #FAFBFC; padding: 32px; color: #0E1B2C;">
  <div style="max-width: 560px; margin: 0 auto; background: #fff; border: 1px solid #E6EAF0; border-radius: 14px; overflow: hidden;">
    <div style="background: #1A4E8A; padding: 24px 32px;">
      <div style="color: #fff; font-size: 22px; font-weight: 600;">Lili-Ride</div>
      <div style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 4px;">Nouvelle demande — ${typeLabel}</div>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #5A6A7E; width: 140px;">Nom client</td><td style="padding: 8px 0; font-weight: 500;">${demande.nom_client}</td></tr>
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Téléphone</td><td style="padding: 8px 0;"><a href="tel:${demande.telephone}" style="color: #1A4E8A;">${demande.telephone}</a></td></tr>
        ${demande.whatsapp ? `<tr><td style="padding: 8px 0; color: #5A6A7E;">WhatsApp</td><td style="padding: 8px 0;"><a href="https://wa.me/${demande.whatsapp.replace(/\D/g, '')}" style="color: #0F8A6B;">${demande.whatsapp}</a></td></tr>` : ''}
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Service</td><td style="padding: 8px 0;">${typeLabel}</td></tr>
        <tr><td style="padding: 8px 0; color: #5A6A7E;">Annonce</td><td style="padding: 8px 0;">${annonce}</td></tr>
        ${demande.nb_places ? `<tr><td style="padding: 8px 0; color: #5A6A7E;">Places</td><td style="padding: 8px 0;">${demande.nb_places}</td></tr>` : ''}
        ${demande.description_colis ? `<tr><td style="padding: 8px 0; color: #5A6A7E;">Colis</td><td style="padding: 8px 0;">${demande.description_colis}</td></tr>` : ''}
        ${demande.date_debut ? `<tr><td style="padding: 8px 0; color: #5A6A7E;">Période</td><td style="padding: 8px 0;">${demande.date_debut} → ${demande.date_fin}</td></tr>` : ''}
        ${demande.message ? `<tr><td style="padding: 8px 0; color: #5A6A7E; vertical-align: top;">Message</td><td style="padding: 8px 0;">${demande.message}</td></tr>` : ''}
      </table>
      <div style="margin-top: 28px;">
        <a href="${adminUrl}" style="display: inline-flex; align-items: center; height: 44px; padding: 0 20px; background: #1A4E8A; color: #fff; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 500;">Voir la demande →</a>
      </div>
    </div>
    <div style="padding: 16px 32px; background: #F6F8FA; border-top: 1px solid #E6EAF0; font-size: 12px; color: #8A98A8;">
      Lili-Ride · Douala · Yaoundé · Bafoussam
    </div>
  </div>
</body>
</html>`
}

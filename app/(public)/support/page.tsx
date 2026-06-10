'use client'

import { useState } from 'react'

export default function SupportPage() {
  const [form, setForm] = useState({ nom: '', telephone: '', message: '' })
  const [sent, setSent] = useState(false)

  function update(k: string, v: string) { setForm(p => ({ ...p, [k]: v })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="section">
      <div className="container-narrow">
        <span className="kicker">Support</span>
        <h1 style={{ fontSize: 'clamp(28px, 3vw, 44px)', marginTop: 8 }}>Contact & aide</h1>
        <p style={{ marginTop: 16, fontSize: 16, maxWidth: 560 }}>
          Notre équipe est disponible par téléphone et WhatsApp pour vous aider à trouver le service adapté à votre besoin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 48 }}>
          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card card-pad">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--ink)' }}>Nous joindre directement</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <a href="tel:+237600000000" className="contact-pill tel">
                  <svg className="icon" viewBox="0 0 20 20" fill="none">
                    <path d="M16 12.5v2a2 2 0 01-2.2 2 14 14 0 01-12-12A2 2 0 014 2.5h2.5l1 4-2 1a10 10 0 005 5l1-2 4 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                  +237 6 00 00 00 00
                </a>
                <a href="https://wa.me/237600000000" target="_blank" rel="noopener noreferrer" className="contact-pill wa">
                  <svg className="icon" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M7 8.5c.5-1 2-1.5 3-1 1 .5 2 2 1.5 3.5-.3.8-1 1.5-2 2-.8.3-2 0-3-1s-1.2-2.5-1-3.5h1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Horaires de disponibilité</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 4 }}>Lun – Sam · 7h – 21h (heure de Douala)</div>
              </div>
            </div>

            <div className="card card-pad">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: 'var(--ink)' }}>Villes couvertes</div>
              {['Douala', 'Yaoundé', 'Bafoussam'].map(v => (
                <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 14, color: 'var(--ink-2)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                  {v}
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="card card-pad">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20, color: 'var(--ink)' }}>Envoyer un message</div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ fontSize: 32 }}>✅</div>
                <h3 style={{ marginTop: 12, fontSize: 20 }}>Message envoyé !</h3>
                <p style={{ marginTop: 8, color: 'var(--ink-3)' }}>Nous vous répondrons rapidement.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="field">
                  <label className="field-label">Nom</label>
                  <input className="input" type="text" value={form.nom} onChange={e => update('nom', e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field-label">Téléphone</label>
                  <input className="input" type="tel" placeholder="+237 6 XX XX XX XX" value={form.telephone} onChange={e => update('telephone', e.target.value)} required />
                </div>
                <div className="field">
                  <label className="field-label">Message</label>
                  <textarea className="textarea" value={form.message} onChange={e => update('message', e.target.value)} required placeholder="Comment pouvons-nous vous aider ?" style={{ minHeight: 120 }} />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Envoyer</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

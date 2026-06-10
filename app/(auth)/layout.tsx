import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-split">
      <div className="auth-form-side">
        {children}
      </div>
      <div className="auth-art-side">
        <Link href="/" className="brand" style={{ color: '#fff', position: 'relative', zIndex: 1 }}>
          <span className="brand-mark" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>L</span>
          <span><b>Lili</b><em style={{ color: 'rgba(255,255,255,0.75)' }}>-Ride</em></span>
        </Link>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <blockquote style={{ fontFamily: 'var(--font-serif)', fontSize: 26, lineHeight: 1.3, color: '#fff', margin: 0, fontWeight: 400 }}>
            &ldquo;Bouger au Cameroun, tout simplement.&rdquo;
          </blockquote>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 48 }}>
            {[
              { label: 'Transporteurs vérifiés', desc: 'Permis, carte grise et photo du véhicule contrôlés avant publication.' },
              { label: 'Prix en FCFA, sans surprise', desc: 'Le tarif s\'affiche clairement sur chaque annonce.' },
              { label: 'Un humain au bout du fil', desc: 'Équipe support joignable par téléphone et WhatsApp.' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>{item.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

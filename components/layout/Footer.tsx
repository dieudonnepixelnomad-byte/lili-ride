import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link href="/" className="brand">
              <span className="brand-mark">L</span>
              <span><b>Lili</b><em>-Ride</em></span>
            </Link>
            <p style={{ marginTop: 16, maxWidth: 320, fontSize: '13.5px', color: 'var(--ink-3)' }}>
              La plateforme de mobilité camerounaise. Covoiturage, transport de colis par avion et location de véhicules, en français, pour le Cameroun.
            </p>
          </div>

          <div className="footer-col">
            <h5>Services</h5>
            <Link href="/covoiturage">Covoiturage</Link>
            <Link href="/colis">Transport de colis (avion)</Link>
            <Link href="/location">Location de véhicules</Link>
            <Link href="/connexion">Devenir transporteur</Link>
          </div>

          <div className="footer-col">
            <h5>Compte</h5>
            <Link href="/connexion">Connexion</Link>
            <Link href="/connexion">Connexion / Inscription</Link>
            <Link href="/dashboard">Tableau de bord</Link>
            <Link href="/dashboard/publier">Publier une annonce</Link>
          </div>

          <div className="footer-col">
            <h5>Support</h5>
            <Link href="/support">Contact & aide</Link>
            <p style={{ margin: '10px 0 4px', fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
              Appelez-nous ou écrivez-nous sur WhatsApp.
            </p>
            {['+237697208124', '+237671567115'].map(numero => (
              <div key={numero} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <a href={`tel:${numero}`} style={{ padding: '6px 0' }}>{numero}</a>
                <a
                  href={`https://wa.me/${numero.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '6px 0', color: 'var(--accent-deep)', fontSize: 13 }}
                >
                  WhatsApp
                </a>
              </div>
            ))}
            <a href="#">Mentions légales</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Lili-Ride · Plateforme camerounaise de mobilité</span>
          <span>Douala · Yaoundé · Bafoussam</span>
        </div>
      </div>
    </footer>
  )
}

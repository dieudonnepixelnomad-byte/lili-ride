'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/covoiturage', label: 'Covoiturage' },
  { href: '/colis', label: 'Transport de colis' },
  { href: '/location', label: 'Location' },
  { href: '/support', label: 'Support' },
]

export default function Header({ session }: { session?: boolean }) {
  const pathname = usePathname()

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">L</span>
          <span><b>Lili</b><em>-Ride</em></span>
        </Link>

        <nav className="site-nav">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'active' : ''}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {session ? (
            <Link href="/dashboard" className="btn btn-outline">Mon espace</Link>
          ) : (
            <>
              <Link href="/connexion" className="btn btn-ghost">Connexion</Link>
              <Link href="/inscription" className="btn btn-primary">Créer un compte</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

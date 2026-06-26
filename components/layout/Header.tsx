'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/covoiturage', label: 'Covoiturage' },
  { href: '/colis', label: 'Transport de colis' },
  { href: '/location', label: 'Location' },
  { href: '/support', label: 'Support' },
]

export default function Header({ session }: { session?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    href === '/' ? pathname === href : pathname.startsWith(href)

  return (
    <>
      <header className="site-header">
        <div className="container site-header-inner">
          <Link href="/" className="brand">
            <span className="brand-mark">L</span>
            <span><b>Lili</b><em>-Ride</em></span>
          </Link>

          {/* Desktop nav — hidden below 960px */}
          <nav className="site-nav max-[960px]:!hidden">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} className={isActive(href) ? 'active' : ''}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions — hidden below 960px */}
          <div className="header-actions max-[960px]:!hidden">
            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-outline">Mon espace</Link>
                <form method="POST" action="/api/auth/deconnexion" style={{ display: 'inline' }}>
                  <button type="submit" className="btn btn-ghost">Déconnexion</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/connexion" className="btn btn-ghost">Connexion</Link>
                <Link href="/connexion" className="btn btn-primary">Créer un compte</Link>
              </>
            )}
          </div>

          {/* Hamburger — hidden above 960px */}
          <button
            className="nav-toggle hidden max-[960px]:!inline-flex"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            {open ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="17" y2="6" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="14" x2="17" y2="14" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      <div
        className={`mobile-nav ${open ? '' : '!hidden'}`}
        onClick={() => setOpen(false)}
      >
        <div className="mobile-nav-panel" onClick={e => e.stopPropagation()}>
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={isActive(href) ? 'active' : ''}>
              {label}
            </Link>
          ))}

          <div className="mobile-nav-divider" />

          <div className="mobile-nav-actions">
            {session ? (
              <>
                <Link href="/dashboard" className="btn btn-outline btn-block">Mon espace</Link>
                <form method="POST" action="/api/auth/deconnexion">
                  <button type="submit" className="btn btn-ghost btn-block">Déconnexion</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/connexion" className="btn btn-primary btn-block">Créer un compte</Link>
                <Link href="/connexion" className="btn btn-outline btn-block">Connexion</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

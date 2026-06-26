'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { User } from '@/types'

interface Props {
  user: User
}

const navItems = [
  {
    href: '/dashboard',
    label: 'Tableau de bord',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
    exact: true,
  },
  {
    href: '/dashboard/mes-annonces',
    label: 'Mes annonces',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/publier',
    label: 'Publier une annonce',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/mes-demandes',
    label: 'Mes demandes',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M4 4h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/dashboard/profil',
    label: 'Mon profil',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function getInitials(nom: string) {
  return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardSidebar({ user }: Props) {
  const pathname = usePathname()
  const [profilTooltip, setProfilTooltip] = useState(false)

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark">L</span>
        <span><b>Lili</b><em>-Ride</em></span>
      </Link>

      <nav className="sidenav">
        <span className="group-label">Navigation</span>
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          const isProfilLink = href === '/dashboard/profil'
          const missingPhoto = isProfilLink && !user.photo_url
          return (
            <div key={href} style={{ position: 'relative' }}
              onMouseEnter={() => missingPhoto && setProfilTooltip(true)}
              onMouseLeave={() => setProfilTooltip(false)}
            >
              <Link href={href} className={isActive ? 'active' : ''}>
                {icon}
                {label}
                {missingPhoto && (
                  <span style={{
                    marginLeft: 'auto',
                    width: 8, height: 8,
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    flexShrink: 0,
                    display: 'inline-block',
                  }} />
                )}
              </Link>
              {missingPhoto && profilTooltip && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: 6,
                  background: 'var(--ink)',
                  color: '#fff',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  padding: '8px 12px',
                  borderRadius: 8,
                  whiteSpace: 'normal',
                  zIndex: 100,
                  pointerEvents: 'none',
                  boxShadow: 'var(--shadow-md)',
                }}>
                  Photo de profil manquante<br />
                  <span style={{ opacity: 0.7, fontSize: 11.5 }}>Requise pour réserver ou publier</span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar avatar-sm" style={{ background: 'var(--primary)' }}>
          {getInitials(user.nom)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="name">{user.nom}</div>
          <div className="sub">{user.ville}</div>
        </div>
        <form method="POST" action="/api/auth/deconnexion">
          <button type="submit" title="Déconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 4, display: 'flex', alignItems: 'center' }}>
            <svg viewBox="0 0 20 20" fill="none" width={18} height={18}>
              <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M13 14l3-4-3-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </aside>
  )
}

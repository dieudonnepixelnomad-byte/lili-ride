'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@/types'

interface Props {
  user: User
}

const navItems = [
  {
    href: '/admin',
    label: 'Tableau de bord',
    exact: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/demandes',
    label: 'Demandes',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M4 4h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 8h6M7 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/verifications',
    label: 'Vérifications',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M10 2L3 5v5c0 4 3 7 7 8 4-1 7-4 7-8V5l-7-3z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/annonces',
    label: 'Annonces',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <path d="M3 5h14M3 10h10M3 15h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/utilisateurs',
    label: 'Utilisateurs',
    icon: (
      <svg viewBox="0 0 20 20" fill="none">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M15 8v6M12 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function getInitials(nom: string) {
  return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function AdminSidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark">L</span>
        <span><b>Lili</b><em>-Ride</em></span>
      </Link>

      <nav className="sidenav">
        <span className="group-label">Administration</span>
        {navItems.map(({ href, label, icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href} className={isActive ? 'active' : ''}>
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="avatar avatar-sm">
          {getInitials(user.nom)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="name">{user.nom}</div>
          <div className="sub">Administrateur</div>
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

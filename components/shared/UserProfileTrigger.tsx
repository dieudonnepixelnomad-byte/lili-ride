'use client'

import { useState } from 'react'
import Avatar from './Avatar'

interface ProfileUser {
  nom: string
  ville: string
  telephone?: string | null
  whatsapp?: string | null
  photo_url?: string | null
}

interface Props {
  user: ProfileUser
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
}

export default function UserProfileTrigger({ user, size = 'md', showName = false }: Props) {
  const [open, setOpen] = useState(false)

  const nameSize = size === 'sm' ? 13.5 : 16
  const nameWeight = size === 'sm' ? 500 : 600
  const villeSize = size === 'sm' ? 12 : 13.5

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
        aria-label={`Voir le profil de ${user.nom}`}
      >
        <Avatar nom={user.nom} photo_url={user.photo_url} size={size} />
        {showName && (
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: nameSize, fontWeight: nameWeight, color: 'var(--ink)' }}>{user.nom}</div>
            <div style={{ fontSize: villeSize, color: 'var(--ink-3)', marginTop: 2 }}>{user.ville}</div>
          </div>
        )}
      </button>

      {open && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false) }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '0 16px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--r-lg)',
              padding: '32px 28px', maxWidth: 340, width: '100%',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            }}
          >
            <Avatar nom={user.nom} photo_url={user.photo_url} size="xl" />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--ink)' }}>{user.nom}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 4 }}>{user.ville}</div>
            </div>

            {/* {(user.telephone || user.whatsapp) && (
              <div style={{ width: '100%', borderTop: '1px solid var(--line)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {user.telephone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    <span style={{ color: 'var(--ink-3)' }}>Téléphone</span>
                    <a
                      href={`tel:${user.telephone}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--primary-deep)', fontWeight: 500, textDecoration: 'none' }}
                    >
                      {user.telephone}
                    </a>
                  </div>
                )}
                {user.whatsapp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                    <span style={{ color: 'var(--ink-3)' }}>WhatsApp</span>
                    <a
                      href={`https://wa.me/${user.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#25D366', fontWeight: 500, textDecoration: 'none' }}
                    >
                      {user.whatsapp}
                    </a>
                  </div>
                )}
              </div>
            )} */}

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                marginTop: 4, padding: '9px 28px', background: 'var(--surface-2)',
                border: '1px solid var(--line)', borderRadius: 'var(--r-pill)',
                cursor: 'pointer', fontSize: 14, color: 'var(--ink-2)',
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  )
}

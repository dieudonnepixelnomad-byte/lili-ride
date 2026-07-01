'use client'

import { useState, useEffect, useCallback } from 'react'

interface Props {
  photos: string[]
  alt: string
}

export default function PhotoLightbox({ photos, alt }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const close = () => setLightboxIndex(null)
  const prev = useCallback(() => setLightboxIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : 0), [photos.length])
  const next = useCallback(() => setLightboxIndex(i => i !== null ? (i + 1) % photos.length : 0), [photos.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, prev, next])

  if (photos.length === 0) return null

  const [main, ...thumbs] = photos

  return (
    <>
      {/* Gallery grid */}
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: thumbs.length > 0 ? '1fr 1fr' : '1fr', gridTemplateRows: thumbs.length > 0 ? '260px 120px' : '360px', borderRadius: 12, overflow: 'hidden' }}>
        {/* Main photo */}
        <div
          style={{ gridRow: thumbs.length > 0 ? '1 / 3' : '1', gridColumn: '1', overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}
          onClick={() => setLightboxIndex(0)}
        >
          <img src={main} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* Thumbnails */}
        {thumbs.slice(0, 4).map((url, i) => {
          const isLast = i === 3 && photos.length > 5
          return (
            <div
              key={i}
              style={{ overflow: 'hidden', cursor: 'zoom-in', position: 'relative' }}
              onClick={() => setLightboxIndex(i + 1)}
            >
              <img src={url} alt={`${alt} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.2s', ...(isLast ? { filter: 'brightness(0.5)' } : {}) }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              />
              {isLast && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 15 }}>
                  +{photos.length - 4} photos
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          onClick={close}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {/* Close */}
          <button onClick={close} style={{ position: 'absolute', top: 20, right: 24, background: 'none', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer', lineHeight: 1 }}>×</button>

          {/* Counter */}
          <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {lightboxIndex + 1} / {photos.length}
          </div>

          {/* Prev */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', borderRadius: 8, padding: '12px 18px', lineHeight: 1 }}>‹</button>
          )}

          {/* Image */}
          <img
            src={photos[lightboxIndex]}
            alt={`${alt} ${lightboxIndex + 1}`}
            style={{ maxWidth: '88vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8, userSelect: 'none' }}
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer', borderRadius: 8, padding: '12px 18px', lineHeight: 1 }}>›</button>
          )}

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
              {photos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  onClick={e => { e.stopPropagation(); setLightboxIndex(i) }}
                  style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'pointer', border: i === lightboxIndex ? '2px solid #fff' : '2px solid transparent', opacity: i === lightboxIndex ? 1 : 0.55, transition: 'opacity 0.15s' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

import Link from 'next/link'

interface Props {
  currentPage: number
  totalCount: number
  pageSize: number
  buildHref: (page: number) => string
  label?: string
  totalPages?: number
  hideRange?: boolean
}

export function getPage(value: string | undefined) {
  const page = Number(value)
  return Number.isSafeInteger(page) && page > 0 ? page : 1
}

export default function Pagination({ currentPage, totalCount, pageSize, buildHref, label = 'résultats', totalPages: totalPagesOverride, hideRange = false }: Props) {
  const totalPages = totalPagesOverride ?? Math.ceil(totalCount / pageSize)
  if (totalPages <= 1) return null

  const first = (currentPage - 1) * pageSize + 1
  const last = Math.min(currentPage * pageSize, totalCount)
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)

  return (
    <nav aria-label={`Pagination des ${label}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{hideRange ? `${totalCount} ${label}` : `${first}–${last} sur ${totalCount}`}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {currentPage > 1 ? <Link href={buildHref(currentPage - 1)} className="btn btn-ghost btn-sm">← Précédent</Link> : <span className="btn btn-ghost btn-sm" aria-disabled="true" style={{ opacity: .45, pointerEvents: 'none' }}>← Précédent</span>}
        {pages.map((page, index) => (
          <span key={page} style={{ display: 'contents' }}>
            {index > 0 && pages[index - 1] !== page - 1 ? <span style={{ color: 'var(--ink-3)', padding: '0 2px' }}>…</span> : null}
            <Link href={buildHref(page)} aria-current={page === currentPage ? 'page' : undefined} className={`btn btn-sm ${page === currentPage ? 'btn-primary' : 'btn-ghost'}`}>{page}</Link>
          </span>
        ))}
        {currentPage < totalPages ? <Link href={buildHref(currentPage + 1)} className="btn btn-ghost btn-sm">Suivant →</Link> : <span className="btn btn-ghost btn-sm" aria-disabled="true" style={{ opacity: .45, pointerEvents: 'none' }}>Suivant →</span>}
      </div>
    </nav>
  )
}

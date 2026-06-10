const COLORS = ['', 'avatar-amber', 'avatar-green', 'avatar-plum', 'avatar-clay', 'avatar-sea']

function colorClass(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

function initials(nom: string) {
  return nom.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

interface Props {
  nom: string
  photo_url?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Avatar({ nom, photo_url, size }: Props) {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : ''
  if (photo_url) {
    return (
      <img
        src={photo_url}
        alt={nom}
        className={`avatar ${sizeClass}`}
        style={{ objectFit: 'cover' }}
      />
    )
  }
  return (
    <div className={`avatar ${colorClass(nom)} ${sizeClass}`}>
      {initials(nom)}
    </div>
  )
}

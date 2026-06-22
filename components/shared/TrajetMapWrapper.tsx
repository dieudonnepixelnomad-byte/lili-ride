'use client'

import dynamic from 'next/dynamic'

const TrajetMap = dynamic(() => import('@/components/shared/TrajetMap'), { ssr: false })

interface Props {
  departLabel: string
  departLat: number | null
  departLng: number | null
  arriveeLabel: string
  arriveeLat: number | null
  arriveeLng: number | null
  height?: number
}

export default function TrajetMapWrapper(props: Props) {
  return <TrajetMap {...props} />
}

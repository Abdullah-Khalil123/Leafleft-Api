'use client' // Ensure it's a Client Component

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const DynamicMap = dynamic(() => import('@/components/FloorPlanMap'), {
  ssr: false,
})

export default function FloorPlanMap() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true) // Only runs in the browser
  }, [])

  return isClient ? <DynamicMap /> : <p>Loading map...</p>
}

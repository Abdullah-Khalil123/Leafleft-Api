'use client' // Ensure this runs only on the client-side

import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'

const FloorPlanMap = dynamic(() => import('./Floor/page'), {
  ssr: false, // Prevent Next.js from trying to render this on the server
})

export default function Page() {
  return (
    <div>
      <FloorPlanMap />
    </div>
  )
}

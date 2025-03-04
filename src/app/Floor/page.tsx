import dynamic from 'next/dynamic'

const FloorPlanMap = dynamic(() => import('@/components/FloorPlanMap'), {
  ssr: false, // Prevents server-side rendering issues
})

export default function FloorPage() {
  return <FloorPlanMap />
}

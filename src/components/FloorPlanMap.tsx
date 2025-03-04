'use client'

import {
  MapContainer,
  ImageOverlay,
  //   Marker,
  //   Popup,
  Polyline,
} from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import floorplan from './floorplan.jpg' // Make sure the image is in the correct path
import { useEffect, useState } from 'react'

const imageWidth = 10
const imageHeight = imageWidth * (floorplan.height / floorplan.width)

const bounds: [[number, number], [number, number]] = [
  [0, 0],
  [imageWidth, -imageHeight],
]

// const beaconIcon = new L.Icon({
//   iconUrl: '/beacon.svg',
//   iconSize: [24, 24],
//   iconAnchor: [12, 12],
//   popupAnchor: [0, -12],
// })

const data = {
  nodes: [
    { name: 'B', coordinates: [3.203125, -11.34375] },
    { name: 'C', coordinates: [3.078125, -10.9375] },
    { name: 'D', coordinates: [3.8203125, -10.6796875] },
    { name: 'E', coordinates: [4.0078125, -10.53515625] },
    { name: 'F', coordinates: [4.36328125, -10.2578125] },
    { name: 'G', coordinates: [4.7265625, -9.90625] },
    { name: 'H', coordinates: [4.9375, -9.70703125] },
    { name: 'I', coordinates: [5.55859375, -8.9453125] },
    { name: 'J', coordinates: [5.33203125, -9.33203125] },
    { name: 'K', coordinates: [4.51953125, -9.32421875] },
    { name: 'L', coordinates: [5.19140625, -8.58203125] },
    { name: 'M', coordinates: [4.34765625, -9.515625] },
    { name: 'N', coordinates: [3.62109375, -10.2109375] },
    { name: 'O', coordinates: [4.61328125, -10.6953125] },
    { name: 'P', coordinates: [4.25390625, -10.8828125] },
    { name: 'Q', coordinates: [4.94140625, -10.49609375] },
  ],
  paths: [
    ['B', 'C'],
    ['C', 'D'],
    ['D', 'E'],
    ['E', 'N'],
    ['E', 'F'],
    ['F', 'G'],
    ['G', 'M'],
    ['H', 'G'],
    ['H', 'K'],
    ['H', 'J'],
    ['J', 'I'],
    ['I', 'L'],
    ['S', 'J'],
    ['S', 'R'],
    ['S', 'T'],
    ['I', 'X'],
    ['X', 'W'],
    ['V', 'W'],
    ['U', 'V'],
    ['O', 'F'],
    ['O', 'P'],
    ['Q', 'O'],
  ],
  beacons: [
    { name: 'B1', coordinates: [3.84765625, -10.890625] },
    { name: 'B2', coordinates: [4.15625, -10.07421875] },
    { name: 'B3', coordinates: [5.0859375, -10.046875] },
  ],
}

function findShortestPath(start: string, end: string) {
  const distances: Record<string, number> = {}
  const previous: Record<string, string | null> = {}
  const queue: string[] = []

  data.nodes.forEach((node) => {
    distances[node.name] = Infinity
    previous[node.name] = null
    queue.push(node.name)
  })

  distances[start] = 0

  while (queue.length) {
    queue.sort((a, b) => distances[a] - distances[b])
    const current = queue.shift()!

    if (current === end) break

    data.paths.forEach(([nodeA, nodeB]) => {
      if (current === nodeA || current === nodeB) {
        const neighbor = current === nodeA ? nodeB : nodeA
        if (!queue.includes(neighbor)) return

        const alt = distances[current] + 1
        if (alt < distances[neighbor]) {
          distances[neighbor] = alt
          previous[neighbor] = current
        }
      }
    })
  }

  const path: string[] = []
  let step: string | null = end
  while (step) {
    path.unshift(step)
    step = previous[step]
  }

  return path
}

export default function FloorPlanMap() {
  const [shortestPath, setShortestPath] = useState<string[]>([])

  useEffect(() => {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.start && event.data.end) {
        setShortestPath(findShortestPath(event.data.start, event.data.end))
      }
    })
  }, [])

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[imageWidth / 2, -imageHeight / 2]}
        zoom={6.5}
        style={{ height: '100%', width: '100%' }}
        crs={L.CRS.Simple}
      >
        <ImageOverlay url={floorplan.src} bounds={bounds} />

        {shortestPath.length > 1 && (
          <Polyline
            positions={shortestPath
              .map(
                (name) =>
                  data.nodes.find((node) => node.name === name)
                    ?.coordinates as LatLngTuple
              )
              .filter(
                (coord): coord is LatLngTuple =>
                  Array.isArray(coord) && coord.length === 2
              )}
            color="red"
          />
        )}
      </MapContainer>
    </div>
  )
}

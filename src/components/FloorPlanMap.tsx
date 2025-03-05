'use client'

import {
  MapContainer,
  ImageOverlay,
  Marker,
  Polyline,
  Popup,
} from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import floorplan from './floorplan.jpg'
import { useEffect, useState } from 'react'
import data from './data'

const imageWidth = 10
const imageHeight = imageWidth * (floorplan.height / floorplan.width)

const bounds: [[number, number], [number, number]] = [
  [0, 0],
  [imageWidth, -imageHeight],
]

// ✅ Define a custom beacon icon
const beaconIcon = new L.Icon({
  iconUrl: '/beacon.svg', // Ensure the image is in the public folder
  iconSize: [24, 24], // Adjust size as needed
  iconAnchor: [12, 12], // Center the icon correctly
  popupAnchor: [0, -12],
})

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

        {/* ✅ Display Beacon Icons with Information */}
        {data.beacons.map((beacon) => (
          <Marker
            key={beacon.name}
            position={beacon.coordinates as LatLngTuple}
            icon={beaconIcon}
          >
            <Popup>
              <strong>{beacon.name}</strong>
              <br />
              MAC: {beacon.Mac}
              <br />
              coord: {'['}
              {beacon.coordinates[0].toFixed(2)} ,
              {beacon.coordinates[1].toFixed(2)}
              {']'}
            </Popup>
          </Marker>
        ))}

        {/* ✅ Draw Shortest Path */}
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

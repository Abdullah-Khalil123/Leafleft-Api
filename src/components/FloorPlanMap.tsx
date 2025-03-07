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

const beaconIcon = new L.Icon({
  iconUrl: '/beacon.svg',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const endIcon = new L.DivIcon({
  className: 'custom-end-marker',
  html: '<div style="background: blue; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
  iconSize: [20, 20],
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
  const [userPosition, setUserPosition] = useState<LatLngTuple | null>(null)

  useEffect(() => {
    let lastEnd: string | null = null

    window.addEventListener('message', (event) => {
      if (event.data) {
        const { start, end, userCoords } = event.data

        if (start && end) {
          lastEnd = end
          setShortestPath(findShortestPath(start, end))

          const startNode = data.nodes.find((node) => node.name === start)
          if (startNode) {
            setUserPosition(startNode.coordinates as LatLngTuple)
          }
        } else if (userCoords) {
          const userNode = data.nodes.find((node) => node.name === userCoords)
          if (userNode) {
            setUserPosition(userNode.coordinates as LatLngTuple)

            if (lastEnd) {
              setShortestPath(findShortestPath(userCoords, lastEnd))
            }
          }
        }
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
              coord: [{beacon.coordinates[0].toFixed(2)},{' '}
              {beacon.coordinates[1].toFixed(2)}]
            </Popup>
          </Marker>
        ))}

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
            color="#317dc6"
            weight={5} // Line thickness
            lineCap="round" // Rounded edges
            lineJoin="round" // Smooth joins
            dashArray="10, 10" // Dashed pattern: 10px dash, 10px gap
          />
        )}

        {userPosition && (
          <Marker position={userPosition}>
            <Popup>Your Location</Popup>
          </Marker>
        )}

        {shortestPath[1] && (
          <Marker
            position={
              data.nodes.find(
                (node) => node.name === shortestPath[shortestPath.length - 1]
              )?.coordinates as LatLngTuple
            }
            icon={endIcon}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

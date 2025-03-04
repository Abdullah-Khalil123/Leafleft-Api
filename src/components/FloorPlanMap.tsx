'use client'

import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
} from 'react-leaflet'
import L, { LatLngTuple } from 'leaflet'
import floorplan from './floorplan.jpg' // Make sure the image is in the correct path

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
    { name: 'R', coordinates: [5.484375, -9.921875] },
    { name: 'S', coordinates: [5.7265625, -9.5546875] },
    { name: 'T', coordinates: [5.93359375, -9.25390625] },
    { name: 'U', coordinates: [6.2421875, -8.5625] },
    { name: 'V', coordinates: [6.3515625, -8.1875] },
    { name: 'W', coordinates: [5.984375, -8.08203125] },
    { name: 'X', coordinates: [5.84375, -8.4375] },
    { name: 'Y', coordinates: [3.56640625, -11.24609375] },
  ] as { name: string; coordinates: LatLngTuple }[],
  paths: [
    ['Y', 'B'],
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
    { name: 'B4', coordinates: [5.09375, -9.12109375] },
    { name: 'B5', coordinates: [5.921875, -8.82421875] },
  ] as { name: string; coordinates: LatLngTuple }[],
}

export default function FloorPlanMap() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer
        center={[imageWidth / 2, -imageHeight / 2]}
        zoom={1}
        style={{ height: '100%', width: '100%' }}
        crs={L.CRS.Simple}
      >
        <ImageOverlay url={floorplan.src} bounds={bounds} />

        {data.nodes.map((node) => (
          <Marker key={node.name} position={node.coordinates}>
            <Popup>{`${node.name}: [${node.coordinates[0].toFixed(
              2
            )}, ${node.coordinates[1].toFixed(2)}]`}</Popup>
          </Marker>
        ))}

        {data.paths.map((path, index) => {
          const startNode = data.nodes.find((node) => node.name === path[0])
          const endNode = data.nodes.find((node) => node.name === path[1])
          if (!startNode || !endNode) return null
          return (
            <Polyline
              key={index}
              positions={[startNode.coordinates, endNode.coordinates]}
              color="blue"
            />
          )
        })}

        {data.beacons.map((beacon) => (
          <Marker
            key={beacon.name}
            position={beacon.coordinates}
            icon={beaconIcon}
          >
            <Popup>{`Beacon ${beacon.name}: [${beacon.coordinates[0].toFixed(
              2
            )}, ${beacon.coordinates[1].toFixed(2)}]`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

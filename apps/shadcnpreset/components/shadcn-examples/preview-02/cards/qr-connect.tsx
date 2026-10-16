import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"

// A QR-shaped pattern rather than an encoded code: the preview only needs the
// look, and nothing should ever scan it.
const QR_SIZE = 25
const FINDERS = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
] as const

function isInFinderZone(x: number, y: number) {
  return FINDERS.some(
    ([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7
  )
}

const QR_MODULES = Array.from({ length: QR_SIZE * QR_SIZE }, (_, i) => {
  const x = i % QR_SIZE
  const y = Math.floor(i / QR_SIZE)
  if (isInFinderZone(x, y)) return null
  // Integer hash of the cell, so the pattern is noisy but identical every render.
  let hash = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) >>> 0
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 0
  const filled = ((hash ^ (hash >>> 16)) >>> 3) & 1
  return filled ? { x, y } : null
}).filter((module) => module !== null)

function QrPattern() {
  return (
    <svg
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      className="size-40 text-black"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {FINDERS.map(([x, y]) => (
        <g key={`${x}-${y}`} fill="currentColor">
          <path
            d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`}
            fillRule="evenodd"
          />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
      {QR_MODULES.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

export function QrConnect() {
  return (
    <Card>
      <CardContent className="flex justify-center pt-6">
        <div className="rounded-xl border bg-white p-4">
          <QrPattern />
        </div>
      </CardContent>
      <CardHeader className="text-center">
        <CardTitle>Scan to connect your mobile device</CardTitle>
        <CardDescription>
          Open the Ledger mobile app and scan this code to link your device.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <Button variant="secondary" className="w-full">
          Got it
        </Button>
      </CardFooter>
    </Card>
  )
}

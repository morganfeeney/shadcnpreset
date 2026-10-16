import { Button } from "@/components/cn-ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"

// One frame of upstream's "processing" animation, which draws on a canvas
// from the microphone. The preview only needs the look, so the bars are fixed.
const BAR_COUNT = 72
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const half = BAR_COUNT / 2
  const position = (i - half) / half
  const centerWeight = 1 - Math.abs(position) * 0.4
  const wave =
    Math.sin(1.8 + position * 3) * 0.25 +
    Math.sin(0.96 - position * 2) * 0.2 +
    Math.cos(2.4 + position) * 0.15
  return Math.max(0.05, Math.min(1, (0.2 + wave) * centerWeight))
})

export function LiveWaveformCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Audio Waveform</CardTitle>
        <CardDescription>
          Real-time microphone input visualization with audio reactivity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="Processing audio"
          className="flex h-20 items-center gap-0.5 overflow-hidden mask-x-from-90%"
        >
          {BARS.map((value, index) => (
            <div
              key={index}
              className="w-[3px] shrink-0 rounded-[1.5px] bg-muted-foreground"
              style={{
                height: `${Math.max(4, value * 64)}px`,
                opacity: 0.4 + value * 0.6,
              }}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm" variant="outline">
          Start Listening
        </Button>
        <Button size="sm">Stop Processing</Button>
        <Button size="sm" variant="outline">
          Static
        </Button>
      </CardFooter>
    </Card>
  )
}

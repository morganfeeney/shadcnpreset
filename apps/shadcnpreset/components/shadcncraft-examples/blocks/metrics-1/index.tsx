import {
  Metric,
  MetricLabel,
  MetricSubLabel,
} from "@/components/shadcncraft-examples/ui/metric"

export function Metrics1() {
  return (
    <section className="py-5 lg:py-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 lg:gap-7 lg:px-6">
        {/* Map Image */}
        <div className="pointer-events-auto relative aspect-21/9 h-auto w-full overflow-hidden mask-y-from-60%">
          <img
            src="https://assets.shadcncraft.com/registry/map.svg"
            className="size-full object-cover"
            alt="Map"
          />
        </div>

        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          <Metric>
            <MetricLabel>12,500+</MetricLabel>
            <MetricSubLabel>Projects completed</MetricSubLabel>
          </Metric>

          <Metric>
            <MetricLabel>38% faster</MetricLabel>
            <MetricSubLabel>Delivery across teams</MetricSubLabel>
          </Metric>

          <Metric>
            <MetricLabel>94%</MetricLabel>
            <MetricSubLabel>User satisfaction</MetricSubLabel>
          </Metric>

          <Metric>
            <MetricLabel>8 zones</MetricLabel>
            <MetricSubLabel>With active customers</MetricSubLabel>
          </Metric>
        </div>
      </div>
    </section>
  )
}

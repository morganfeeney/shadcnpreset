import type { PresetConfig } from "shadcn/preset"
import type { ResolvedPreset } from "@/lib/preset"

const FIELD_ORDER: Array<keyof PresetConfig> = [
  "style",
  "baseColor",
  "theme",
  "chartColor",
  "iconLibrary",
  "font",
  "fontHeading",
  "radius",
  "menuAccent",
  "menuColor",
]

function labelForField(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
}

type PresetViewerProps = {
  preset: ResolvedPreset
  canonicalCode: string
}

export function PresetViewer({ preset, canonicalCode }: PresetViewerProps) {
  return (
    <div className="create-shell">
      <aside className="panel">
        <h2 className="panel-title">Decoded preset</h2>
        <p className="panel-subtitle">
          Route code: <code>{preset.code}</code>
        </p>
        <p className="panel-subtitle">
          Canonical code: <code>{canonicalCode}</code>
        </p>
        {preset.isLegacyCode ? (
          <p className="chip">Legacy v1 preset detected (a*)</p>
        ) : null}
        <div className="values">
          {FIELD_ORDER.map((field) => (
            <div className="value-row" key={field}>
              <span>{labelForField(String(field))}</span>
              <code>{String(preset[field] ?? "n/a")}</code>
            </div>
          ))}
          <div className="value-row">
            <span>Effective chartColor</span>
            <code>{preset.effectiveChartColor}</code>
          </div>
          <div className="value-row">
            <span>Effective radius</span>
            <code>{preset.effectiveRadius}</code>
          </div>
        </div>
      </aside>

      <section className="preview">
        <div className="preview-header">
          <p className="eyebrow">shadcnpreset</p>
          <h1>Preset Viewer</h1>
          <p>
            Create-style preview with your decoded visual tokens applied to a
            stable UI sample.
          </p>
        </div>
        <div className="preview-grid">
          <div className="sample-card">
            <h3>Primary Card</h3>
            <p>Typography and colors are derived from this preset code.</p>
            <div className="button-row">
              <button className="btn btn-primary" type="button">
                Primary action
              </button>
              <button className="btn btn-secondary" type="button">
                Secondary
              </button>
            </div>
          </div>
          <div className="sample-card cn-menu-target" data-menu-translucent="">
            <h3>Menu Surface</h3>
            <p>
              Menu accent and inversion options are visible in this section.
            </p>
            <ul className="menu-list">
              <li>Dashboard</li>
              <li>Analytics</li>
              <li>Components</li>
              <li>Settings</li>
            </ul>
          </div>
          <div className="sample-card">
            <h3>Chart Colors</h3>
            <div className="chart-bars" aria-label="Color bars">
              <span style={{ background: "var(--chart-1)" }} />
              <span style={{ background: "var(--chart-2)" }} />
              <span style={{ background: "var(--chart-3)" }} />
              <span style={{ background: "var(--chart-4)" }} />
              <span style={{ background: "var(--chart-5)" }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

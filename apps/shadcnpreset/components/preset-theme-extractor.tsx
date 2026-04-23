"use client"

import * as React from "react"
import Link from "next/link"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import { PresetIframeCard } from "@/components/preset-iframe-card"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"

type PresetThemeExtractorProps = {
  defaultCode: string
}

const DETAIL_FIELDS: ReadonlyArray<{
  key: string
  label: string
  getValue: (
    bundle: NonNullable<ReturnType<typeof getPresetThemeCssBundle>>
  ) => string
}> = [
  { key: "code", label: "Code", getValue: (bundle) => bundle.resolved.code },
  { key: "style", label: "Style", getValue: (bundle) => bundle.resolved.style },
  {
    key: "baseColor",
    label: "Base color",
    getValue: (bundle) => bundle.resolved.baseColor,
  },
  { key: "theme", label: "Theme", getValue: (bundle) => bundle.resolved.theme },
  {
    key: "chartColor",
    label: "Chart color",
    getValue: (bundle) => bundle.resolved.effectiveChartColor,
  },
  {
    key: "font",
    label: "Body font",
    getValue: (bundle) => bundle.resolved.font,
  },
  {
    key: "fontHeading",
    label: "Heading font",
    getValue: (bundle) =>
      bundle.resolved.fontHeading === "inherit"
        ? `${bundle.resolved.font} (inherits body font)`
        : bundle.resolved.fontHeading,
  },
  {
    key: "icons",
    label: "Icons",
    getValue: (bundle) => bundle.resolved.iconLibrary,
  },
  {
    key: "radius",
    label: "Radius",
    getValue: (bundle) => bundle.resolved.effectiveRadius,
  },
  {
    key: "menuColor",
    label: "Menu color",
    getValue: (bundle) => bundle.resolved.menuColor,
  },
  {
    key: "menuAccent",
    label: "Menu accent",
    getValue: (bundle) => bundle.resolved.menuAccent,
  },
]

export function PresetThemeExtractor({
  defaultCode,
}: PresetThemeExtractorProps) {
  const [codeInput, setCodeInput] = React.useState(defaultCode)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const code = codeInput.trim()

  const bundle = React.useMemo(() => getPresetThemeCssBundle(code), [code])

  React.useEffect(() => {
    if (!copiedKey) return
    const timeout = window.setTimeout(() => setCopiedKey(null), 1500)
    return () => window.clearTimeout(timeout)
  }, [copiedKey])

  async function handleCopy(value: string, key: string) {
    const hasCopied = await copyToClipboardWithMeta(value, {
      name: "preset_theme_copy",
      properties: { key, code },
    })

    if (hasCopied) {
      setCopiedKey(key)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Decode a preset</CardTitle>
            <CardDescription>
              Paste any preset code and get ready-to-copy CSS custom properties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={codeInput}
              onChange={(event) => setCodeInput(event.target.value)}
              placeholder="Enter preset code"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground">
              Works with the carousel codes you pasted, plus any other canonical
              preset code.
            </p>
            {bundle ? (
              <Link
                href={`/preset/${bundle.resolved.code}`}
                className="inline-block text-xs text-primary underline-offset-4 hover:underline"
              >
                Open preset page
              </Link>
            ) : null}
          </CardContent>
        </Card>

        {bundle ? (
          <PresetIframeCard
            code={bundle.resolved.code}
            title={bundle.resolved.code}
            description={`${bundle.resolved.baseColor} base, ${bundle.resolved.theme} theme, ${bundle.resolved.effectiveChartColor} charts, ${bundle.resolved.iconLibrary}`}
          />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Decoded preset</CardTitle>
            <CardDescription>
              Parsed config for the current preset code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!bundle ? (
              <p className="text-sm text-destructive">
                Enter a valid preset code to decode it.
              </p>
            ) : (
              <dl className="grid gap-3">
                {DETAIL_FIELDS.map((field) => (
                  <div
                    key={field.key}
                    className="grid gap-1 border-b border-border/60 pb-3 last:border-b-0 last:pb-0"
                  >
                    <dt className="text-xs tracking-wide text-muted-foreground uppercase">
                      {field.label}
                    </dt>
                    <dd className="text-sm break-all">
                      {field.getValue(bundle)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme custom properties</CardTitle>
          <CardDescription>
            Copy the combined CSS block, or just the light or dark variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!bundle ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              This preset code could not be decoded.
            </div>
          ) : (
            <Tabs defaultValue="combined" className="gap-4">
              <TabsList>
                <TabsTrigger value="combined">Combined</TabsTrigger>
                <TabsTrigger value="light">Light</TabsTrigger>
                <TabsTrigger value="dark">Dark</TabsTrigger>
              </TabsList>

              <TabsContent value="combined" className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(bundle.combinedCss, "combined")}
                  >
                    {copiedKey === "combined" ? "Copied" : "Copy combined CSS"}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={bundle.combinedCss}
                  className="min-h-[560px] font-mono text-xs"
                />
              </TabsContent>

              <TabsContent value="light" className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(bundle.lightCss, "light")}
                  >
                    {copiedKey === "light" ? "Copied" : "Copy light CSS"}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={bundle.lightCss}
                  className="min-h-[560px] font-mono text-xs"
                />
              </TabsContent>

              <TabsContent value="dark" className="space-y-3">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(bundle.darkCss, "dark")}
                  >
                    {copiedKey === "dark" ? "Copied" : "Copy dark CSS"}
                  </Button>
                </div>
                <Textarea
                  readOnly
                  value={bundle.darkCss}
                  className="min-h-[560px] font-mono text-xs"
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

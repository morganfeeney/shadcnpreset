"use client"

import { useThemeInstall } from "@/components/themes/theme-fonts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getFontDefinition } from "@/lib/font-definitions"

/** "Use this theme": its CSS and CLI command, with the picked fonts when there are any. */
export function ThemeInstall({ code, css }: { code: string; css: string }) {
  const install = useThemeInstall({ code, css })
  const fontNames = install.fonts
    ? [...new Set([install.fonts.heading, install.fonts.body])]
        .map((name) => getFontDefinition(name)?.title ?? name)
        .join(" and ")
    : null

  return (
    <section className="grid gap-4">
      <div className="grid gap-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Use this theme
        </h2>
        <p className="text-sm text-muted-foreground">
          {fontNames
            ? `Changes colors, radius and fonts (${fontNames}). Your components and icons stay as they are.`
            : "Changes colors and radius only. Your components, fonts and icons stay as they are."}
        </p>
      </div>
      <Tabs defaultValue="css">
        <TabsList>
          <TabsTrigger value="css">CSS</TabsTrigger>
          <TabsTrigger value="cli">shadcn CLI</TabsTrigger>
        </TabsList>
        <TabsContent value="css" className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Replace the <code>:root</code> and <code>.dark</code> blocks in your{" "}
            <code>globals.css</code>.
            {fontNames
              ? ` Load ${fontNames} in your app yourself, or use the CLI, which sets them up.`
              : null}
          </p>
          <pre className="max-h-96 overflow-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
            {install.css}
          </pre>
        </TabsContent>
        <TabsContent value="cli" className="grid gap-2">
          <p className="text-sm text-muted-foreground">
            Run this in your project.{" "}
            {fontNames ? (
              <>
                <code>--only theme,font</code> applies the colors, installs{" "}
                {fontNames} and sets them as your fonts. Nothing else from the
                preset changes.
              </>
            ) : (
              <>
                <code>--only theme</code> applies the colors and nothing else
                from the preset.
              </>
            )}
          </p>
          <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 font-mono text-sm">
            {install.command}
          </pre>
        </TabsContent>
      </Tabs>
    </section>
  )
}

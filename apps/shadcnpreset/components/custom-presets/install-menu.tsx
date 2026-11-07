"use client"

import { CheckIcon, CopyIcon } from "@phosphor-icons/react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import type { CustomColours } from "@/lib/custom-colours"
import { installablePresetCode } from "@/lib/custom-preset"
import { hasColours } from "@/lib/preset-draft"
import { cn } from "@/lib/utils"

const SHADCN = process.env.NEXT_PUBLIC_RC ? "shadcn@rc" : "shadcn@latest"

/**
 * Installing a customized preset, free and without an account. Its preset
 * code holds everything but exact colours; those come from its registry link
 * once saved, or as CSS to paste before then.
 */
export function CustomPresetInstallMenu({
  code,
  colours,
  css,
  registryUrl,
  variant = "default",
}: {
  code: string
  colours: CustomColours
  css: string
  /** A saved preset's colours, for `shadcn add`. */
  registryUrl?: string
  variant?: "default" | "outline"
}) {
  const installable = installablePresetCode(code)
  const withColours = hasColours(colours)

  return (
    <Popover>
      <PopoverTrigger render={<Button type="button" size="sm" variant={variant} />}>
        Install
        <ChevronDownIcon data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        aria-label="Install this preset"
        className="grid w-[min(28rem,calc(100vw-2rem))] grid-cols-1 gap-4 p-4"
      >
        <div className="grid grid-cols-1 gap-2">
          <h3 className="text-sm font-medium">
            {withColours ? "1. Set up the preset" : "Set up the preset"}
          </h3>
          <Tabs defaultValue="new">
            <TabsList>
              <TabsTrigger value="new">New project</TabsTrigger>
              <TabsTrigger value="existing">Existing project</TabsTrigger>
            </TabsList>
            <TabsContent value="new">
              <CopyableCode label="Copy the new project command">
                {`npx ${SHADCN} init --preset ${installable}`}
              </CopyableCode>
            </TabsContent>
            <TabsContent value="existing">
              <CopyableCode label="Copy the existing project command">
                {`npx ${SHADCN} apply --preset ${installable}`}
              </CopyableCode>
            </TabsContent>
          </Tabs>
        </div>

        {withColours && registryUrl ? (
          <>
            <div className="grid grid-cols-1 gap-2">
              <h3 className="text-sm font-medium">2. Add your colours</h3>
              <p className="text-xs text-muted-foreground">
                A preset code can’t hold exact colours, so they install from
                this link. Anyone with it can use them.
              </p>
              <CopyableCode label="Copy the colours command">
                {`npx ${SHADCN} add ${registryUrl}`}
              </CopyableCode>
            </div>
            <details className="grid grid-cols-1 gap-2">
              <summary className="cursor-pointer text-sm font-medium">
                Colours only, as CSS
              </summary>
              <p className="pt-2 text-xs text-muted-foreground">
                Already on this preset? Replace the <code>:root</code> and{" "}
                <code>.dark</code> blocks in your <code>globals.css</code>.
              </p>
              <CopyableCode label="Copy the CSS" block className="mt-2">
                {css}
              </CopyableCode>
            </details>
          </>
        ) : withColours ? (
          <div className="grid grid-cols-1 gap-2">
            <h3 className="text-sm font-medium">2. Add your colours</h3>
            <p className="text-xs text-muted-foreground">
              A preset code can’t hold exact colours. Replace the{" "}
              <code>:root</code> and <code>.dark</code> blocks in your{" "}
              <code>globals.css</code> with these, or save the preset for a
              link to install them from.
            </p>
            <CopyableCode label="Copy the CSS" block>
              {css}
            </CopyableCode>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

/**
 * Code to copy, with its copy button in the corner: a one-line command, or
 * (`block`) a stylesheet that scrolls. A command longer than its box fades
 * out before the button, and its end clears the fade once scrolled to.
 */
function CopyableCode({
  children,
  label,
  block = false,
  className,
}: {
  children: string
  label: string
  block?: boolean
  className?: string
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard()
  return (
    <div className={cn("relative rounded-lg border bg-muted/40", className)}>
      <pre
        className={cn(
          "overflow-x-auto p-3 font-mono text-xs",
          block
            ? "max-h-72 overflow-y-auto pr-12 leading-relaxed"
            : "mask-[linear-gradient(to_right,black_calc(100%-4.5rem),transparent_calc(100%-2.75rem))] pr-20"
        )}
      >
        {children}
      </pre>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1.5 right-1.5 text-muted-foreground hover:text-foreground"
        aria-label={isCopied ? "Copied" : label}
        onClick={() => void copyToClipboard(children)}
      >
        {isCopied ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <CopyIcon aria-hidden className="size-4" />
        )}
      </Button>
    </div>
  )
}

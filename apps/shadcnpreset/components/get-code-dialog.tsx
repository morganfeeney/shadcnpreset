"use client"

import * as React from "react"
import {
  Copy01Icon,
  Globe02Icon,
  HandPointingRight04Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { copyToClipboardWithMeta } from "@/components/copy-button"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useConfig } from "@/hooks/use-config"
import { getPresetThemeCssBundle } from "@/lib/preset-theme-css"
import { BASES, type BaseName } from "@/registry/config"
import {
  getFramework,
  getTemplateValue,
  NO_MONOREPO_FRAMEWORKS,
  TEMPLATES,
} from "@/app/(create)/lib/templates"

const TURBOREPO_LOGO =
  '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Turborepo</title><path d="M11.9906 4.1957c-4.2998 0-7.7981 3.501-7.7981 7.8043s3.4983 7.8043 7.7981 7.8043c4.2999 0 7.7982-3.501 7.7982-7.8043s-3.4983-7.8043-7.7982-7.8043m0 11.843c-2.229 0-4.0356-1.8079-4.0356-4.0387s1.8065-4.0387 4.0356-4.0387S16.0262 9.7692 16.0262 12s-1.8065 4.0388-4.0356 4.0388m.6534-13.1249V0C18.9726.3386 24 5.5822 24 12s-5.0274 11.66-11.356 12v-2.9139c4.7167-.3372 8.4516-4.2814 8.4516-9.0861s-3.735-8.749-8.4516-9.0861M5.113 17.9586c-1.2502-1.4446-2.0562-3.2845-2.2-5.3046H0c.151 2.8266 1.2808 5.3917 3.051 7.3668l2.0606-2.0622zM11.3372 24v-2.9139c-2.02-.1439-3.8584-.949-5.3019-2.2018l-2.0606 2.0623c1.975 1.773 4.538 2.9022 7.361 3.0534z"/></svg>'
const ORIGIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:4000"
const IS_LOCAL_DEV = ORIGIN.includes("localhost")
const SHADCN_VERSION = process.env.NEXT_PUBLIC_RC ? "@rc" : "@latest"
const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const
type PackageManager = (typeof PACKAGE_MANAGERS)[number]
const DEFAULT_BASE: BaseName = "base"

const APPLY_MODES = [
  {
    value: "full",
    title: "Full preset",
    description:
      "Everything from the preset, including components, theme, and fonts.",
  },
  {
    value: "theme",
    title: "Theme only",
    description:
      "Theme tokens only, like colors, radii, and shadows. Components stay as they are.",
  },
  {
    value: "font",
    title: "Fonts only",
    description:
      "Only preset fonts for body and headings. Components stay as they are.",
  },
] as const
type ApplyMode = (typeof APPLY_MODES)[number]["value"]
type GetCodeTab = "new-project" | "existing-project" | "theme"
type CopyTarget = "command" | "apply" | "theme"

type GetCodeOptions = {
  template: string
  base: BaseName
  rtl: boolean
  pointer: boolean
}

export function GetCodeDialog({
  open,
  onOpenChange,
  presetCode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  presetCode: string
}) {
  const id = React.useId()
  const [config, setConfig] = useConfig()
  const [copiedTarget, setCopiedTarget] = React.useState<CopyTarget | null>(
    null
  )
  const [applyMode, setApplyMode] = React.useState<ApplyMode>("full")
  const [activeTab, setActiveTab] = React.useState<GetCodeTab>("new-project")
  const [options, setOptions] = React.useState<GetCodeOptions>({
    template: "next",
    base: DEFAULT_BASE,
    rtl: false,
    pointer: false,
  })

  const packageManager = (config.packageManager || "pnpm") as PackageManager
  const framework = getFramework(options.template)
  const isMonorepo = options.template.endsWith("-monorepo")
  const hasMonorepo = !NO_MONOREPO_FRAMEWORKS.includes(
    framework as (typeof NO_MONOREPO_FRAMEWORKS)[number]
  )

  const commands = React.useMemo(() => {
    const presetFlag = ` --preset ${presetCode}`
    const baseFlag = options.base !== DEFAULT_BASE ? ` --base ${options.base}` : ""
    const templateFlag = ` --template ${framework}`
    const monorepoFlag = isMonorepo ? " --monorepo" : ""
    const rtlFlag = options.rtl ? " --rtl" : ""
    const pointerFlag = options.pointer ? " --pointer" : ""
    const flags = `${presetFlag}${baseFlag}${templateFlag}${monorepoFlag}${rtlFlag}${pointerFlag}`

    return IS_LOCAL_DEV
      ? {
          pnpm: `shadcn init${flags}`,
          npm: `shadcn init${flags}`,
          yarn: `shadcn init${flags}`,
          bun: `shadcn init${flags}`,
        }
      : {
          pnpm: `pnpm dlx shadcn${SHADCN_VERSION} init${flags}`,
          npm: `npx shadcn${SHADCN_VERSION} init${flags}`,
          yarn: `yarn dlx shadcn${SHADCN_VERSION} init${flags}`,
          bun: `bunx --bun shadcn${SHADCN_VERSION} init${flags}`,
        }
  }, [
    framework,
    isMonorepo,
    options.base,
    options.pointer,
    options.rtl,
    presetCode,
  ])

  const command = commands[packageManager]

  const applyCommands = React.useMemo(() => {
    const onlyFlag =
      applyMode === "theme"
        ? " --only theme"
        : applyMode === "font"
          ? " --only font"
          : ""
    const flags = ` --preset ${presetCode}${onlyFlag}`

    return IS_LOCAL_DEV
      ? {
          pnpm: `shadcn apply${flags}`,
          npm: `shadcn apply${flags}`,
          yarn: `shadcn apply${flags}`,
          bun: `shadcn apply${flags}`,
        }
      : {
          pnpm: `pnpm dlx shadcn${SHADCN_VERSION} apply${flags}`,
          npm: `npx shadcn${SHADCN_VERSION} apply${flags}`,
          yarn: `yarn dlx shadcn${SHADCN_VERSION} apply${flags}`,
          bun: `bunx --bun shadcn${SHADCN_VERSION} apply${flags}`,
        }
  }, [applyMode, presetCode])

  const applyCommand = applyCommands[packageManager]
  const themeCss = React.useMemo(
    () => getPresetThemeCssBundle(presetCode)?.combinedCss ?? "",
    [presetCode]
  )

  React.useEffect(() => {
    if (copiedTarget) {
      const timer = setTimeout(() => setCopiedTarget(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedTarget])

  const handleCopy = React.useCallback(() => {
    copyToClipboardWithMeta(command, {
      name: "copy_npm_command",
      properties: {
        command,
        template: options.template,
        preset: presetCode,
      },
    })
    setCopiedTarget("command")
  }, [command, options.template, presetCode])

  const handleCopyApply = React.useCallback(() => {
    copyToClipboardWithMeta(applyCommand, {
      name: "copy_apply_command",
      properties: {
        command: applyCommand,
        applyMode,
        preset: presetCode,
      },
    })
    setCopiedTarget("apply")
  }, [applyCommand, applyMode, presetCode])

  const handleCopyTheme = React.useCallback(() => {
    copyToClipboardWithMeta(themeCss, {
      name: "copy_theme_code",
      properties: {
        preset: presetCode,
        format: "css",
      },
    })
    setCopiedTarget("theme")
  }, [presetCode, themeCss])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark z-60 no-scrollbar flex max-h-[calc(100svh-2rem)] flex-col rounded-2xl p-0 shadow-xl **:data-[slot=dialog-close]:top-4.5 **:data-[slot=dialog-close]:right-4 **:data-[slot=field-separator]:h-2 sm:max-w-md">
        <div className="flex min-w-0 flex-1 flex-col gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="border-b px-6 py-5">
            <ToggleGroup
              value={[activeTab]}
              onValueChange={(values) =>
                setActiveTab((values[0] as typeof activeTab) ?? "new-project")
              }
              aria-label="Project type"
              spacing={2}
              className="**:data-[slot=toggle-group-item]:data-pressed:bg-neutral-700/70"
            >
              <ToggleGroupItem value="new-project">New Project</ToggleGroupItem>
              <ToggleGroupItem value="existing-project">
                Existing Project
              </ToggleGroupItem>
              <ToggleGroupItem value="theme">Theme</ToggleGroupItem>
            </ToggleGroup>
          </DialogHeader>
          {activeTab === "new-project" && (
            <div className="no-scrollbar overflow-y-auto">
              <FieldGroup className="px-6 py-4">
                <Field className="gap-3">
                  <FieldLabel>Template</FieldLabel>
                  <TemplateGrid
                    idPrefix={id}
                    template={options.template}
                    onTemplateChange={(template) =>
                      setOptions((current) => ({ ...current, template }))
                    }
                  />
                </Field>
                <FieldSeparator className="-mx-6" />
                <Field>
                  <FieldLabel>Base</FieldLabel>
                  <BaseGrid
                    idPrefix={id}
                    base={options.base}
                    onBaseChange={(base) =>
                      setOptions((current) => ({ ...current, base }))
                    }
                  />
                </Field>
                <FieldSeparator className="-mx-6" />
                <FieldSet>
                  <FieldLegend variant="label" className="sr-only">
                    Options
                  </FieldLegend>
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor={`${id}-pointer`}>
                      <HugeiconsIcon
                        icon={HandPointingRight04Icon}
                        className="size-4 -rotate-90"
                      />
                      Use pointer on buttons
                    </FieldLabel>
                    <Switch
                      id={`${id}-pointer`}
                      checked={options.pointer}
                      onCheckedChange={(checked) =>
                        setOptions((current) => ({
                          ...current,
                          pointer: checked === true,
                        }))
                      }
                    />
                  </Field>
                  <FieldSeparator className="-mx-6" />
                  <Field
                    orientation="horizontal"
                    data-disabled={hasMonorepo ? undefined : "true"}
                  >
                    <FieldLabel htmlFor={`${id}-monorepo`}>
                      <span
                        className="size-4 text-neutral-100 [&_svg]:size-4 [&_svg]:fill-current"
                        dangerouslySetInnerHTML={{
                          __html: TURBOREPO_LOGO,
                        }}
                      />
                      Create a monorepo
                    </FieldLabel>
                    <Switch
                      id={`${id}-monorepo`}
                      checked={isMonorepo}
                      disabled={!hasMonorepo}
                      onCheckedChange={(checked) =>
                        setOptions((current) => ({
                          ...current,
                          template: getTemplateValue(
                            getFramework(current.template),
                            checked === true
                          ),
                        }))
                      }
                    />
                  </Field>
                  <FieldSeparator className="-mx-6" />
                  <Field orientation="horizontal">
                    <FieldLabel htmlFor={`${id}-rtl`}>
                      <HugeiconsIcon icon={Globe02Icon} className="size-4" />
                      Enable RTL support
                    </FieldLabel>
                    <Switch
                      id={`${id}-rtl`}
                      checked={options.rtl}
                      onCheckedChange={(checked) =>
                        setOptions((current) => ({
                          ...current,
                          rtl: checked === true,
                        }))
                      }
                    />
                  </Field>
                </FieldSet>
              </FieldGroup>
              <DialogFooter className="m-0 min-w-0 p-6">
                <CommandCopy
                  packageManager={packageManager}
                  setPackageManager={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      packageManager: value,
                    }))
                  }}
                  commands={commands}
                  copied={copiedTarget === "command"}
                  onCopy={handleCopy}
                />
              </DialogFooter>
            </div>
          )}
          {activeTab === "existing-project" && (
            <div className="no-scrollbar overflow-y-auto">
              <FieldGroup className="px-6 py-4">
                <FieldSet className="gap-3">
                  <FieldLegend variant="label">Apply Preset</FieldLegend>
                  <FieldDescription>
                    Pick which parts of the preset to apply.
                  </FieldDescription>
                  <ApplyModeGrid
                    idPrefix={id}
                    mode={applyMode}
                    setMode={setApplyMode}
                  />
                </FieldSet>
              </FieldGroup>
              <DialogFooter className="m-0 min-w-0 p-6">
                <CommandCopy
                  packageManager={packageManager}
                  setPackageManager={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      packageManager: value,
                    }))
                  }}
                  commands={applyCommands}
                  copied={copiedTarget === "apply"}
                  onCopy={handleCopyApply}
                />
              </DialogFooter>
            </div>
          )}
          {activeTab === "theme" && (
            <div className="no-scrollbar overflow-y-auto">
              <FieldGroup className="min-w-0 px-6 py-4">
                <FieldSet className="min-w-0 gap-3">
                  <FieldLegend variant="label">Theme Tokens</FieldLegend>
                  <FieldDescription>
                    Copy the CSS variables for this preset.
                  </FieldDescription>
                  <div className="w-full min-w-0 overflow-hidden rounded-xl border-0 ring-1 ring-border">
                    <div className="flex items-center gap-2 py-1 pr-1.5 pl-3">
                      <div className="min-w-0 truncate font-mono text-sm text-muted-foreground">
                        globals.css
                      </div>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="ml-auto"
                        onClick={handleCopyTheme}
                      >
                        {copiedTarget === "theme" ? (
                          <HugeiconsIcon icon={Tick02Icon} />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} />
                        )}
                        <span className="sr-only">Copy theme</span>
                      </Button>
                    </div>
                    <div className="relative no-scrollbar max-h-[45svh] overflow-auto border-t bg-popover p-3">
                      <pre className="min-w-max font-mono leading-normal whitespace-pre">
                        <code>{themeCss}</code>
                      </pre>
                    </div>
                  </div>
                </FieldSet>
              </FieldGroup>
              <DialogFooter className="m-0 min-w-0 p-6">
                <Button onClick={handleCopyTheme} className="h-9 w-full">
                  {copiedTarget === "theme" ? "Copied" : "Copy Theme"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommandCopy({
  packageManager,
  setPackageManager,
  commands,
  copied,
  onCopy,
}: {
  packageManager: PackageManager
  setPackageManager: (value: PackageManager) => void
  commands: Record<string, string>
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <Tabs
        value={packageManager}
        onValueChange={(value) => {
          setPackageManager(value as PackageManager)
        }}
        className="min-w-0 gap-0 overflow-hidden rounded-xl border-0 ring-1 ring-border"
      >
        <div className="flex items-center gap-2 py-1 pr-1.5 pl-1">
          <TabsList className="bg-transparent font-mono">
            {PACKAGE_MANAGERS.map((manager) => (
              <TabsTrigger
                key={manager}
                value={manager}
                className="py-0 leading-none data-[state=active]:shadow-none"
              >
                {manager}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            size="icon-sm"
            variant="ghost"
            className="ml-auto"
            onClick={onCopy}
          >
            {copied ? (
              <HugeiconsIcon icon={Tick02Icon} />
            ) : (
              <HugeiconsIcon icon={Copy01Icon} />
            )}
            <span className="sr-only">Copy command</span>
          </Button>
        </div>
        {Object.entries(commands).map(([key, cmd]) => (
          <TabsContent key={key} value={key}>
            <div className="relative overflow-hidden border-t bg-popover p-3">
              <div className="no-scrollbar overflow-x-auto">
                <code className="font-mono text-sm whitespace-nowrap">
                  {cmd}
                </code>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Button onClick={onCopy} className="h-9 w-full">
        {copied ? "Copied" : "Copy Command"}
      </Button>
    </div>
  )
}

function TemplateGrid({
  idPrefix,
  template,
  onTemplateChange,
}: {
  idPrefix: string
  template: string
  onTemplateChange: (template: string) => void
}) {
  const isMonorepo = template.endsWith("-monorepo")
  const framework = getFramework(template)

  return (
    <RadioGroup
      value={framework}
      onValueChange={(value) =>
        onTemplateChange(getTemplateValue(value, isMonorepo))
      }
      className="grid grid-cols-2 gap-2"
    >
      {TEMPLATES.map((item) => (
        <FieldLabel
          key={item.value}
          htmlFor={`${idPrefix}-template-${item.value}`}
          className="block w-full"
        >
          <Field
            orientation="horizontal"
            className="w-full rounded-md transition-colors duration-150 hover:bg-neutral-700/45"
          >
            <FieldContent className="flex flex-row items-center gap-2 px-2.5 py-1.5">
              <div
                className="size-4 text-neutral-100 [&_svg]:size-4 *:[svg]:text-neutral-100!"
                dangerouslySetInnerHTML={{
                  __html: item.logo,
                }}
              />
              <FieldTitle>{item.title}</FieldTitle>
            </FieldContent>
            <RadioGroupItem
              value={item.value}
              id={`${idPrefix}-template-${item.value}`}
              className="sr-only absolute"
            />
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  )
}

function ApplyModeGrid({
  idPrefix,
  mode,
  setMode,
}: {
  idPrefix: string
  mode: ApplyMode
  setMode: (mode: ApplyMode) => void
}) {
  return (
    <RadioGroup
      value={mode}
      onValueChange={(value) => setMode(value as ApplyMode)}
      aria-label="Apply"
    >
      {APPLY_MODES.map((option) => (
        <FieldLabel
          key={option.value}
          htmlFor={`${idPrefix}-apply-${option.value}`}
        >
          <Field orientation="horizontal">
            <RadioGroupItem
              value={option.value}
              id={`${idPrefix}-apply-${option.value}`}
            />
            <FieldContent>
              <FieldTitle>{option.title}</FieldTitle>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  )
}

function BaseGrid({
  idPrefix,
  base,
  onBaseChange,
}: {
  idPrefix: string
  base: BaseName
  onBaseChange: (base: BaseName) => void
}) {
  return (
    <RadioGroup
      value={base}
      onValueChange={(value) => onBaseChange(value as BaseName)}
      aria-label="Base"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2"
    >
      {BASES.map((item) => (
        <FieldLabel
          key={item.name}
          htmlFor={`${idPrefix}-base-${item.name}`}
          className="block w-full"
        >
          <Field
            orientation="horizontal"
            className="w-full rounded-md transition-colors duration-150 hover:bg-neutral-700/45"
          >
            <FieldContent className="flex flex-row items-center gap-2 py-1">
              <div
                className="size-4 shrink-0 text-neutral-100 [&_svg]:size-4 *:[svg]:text-neutral-100!"
                dangerouslySetInnerHTML={{
                  __html: item.meta?.logo ?? "",
                }}
              />
              <FieldTitle className="whitespace-nowrap">{item.title}</FieldTitle>
            </FieldContent>
            <RadioGroupItem
              value={item.name}
              id={`${idPrefix}-base-${item.name}`}
              className="sr-only absolute"
            />
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  )
}

"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { generateRandomPreset } from "shadcn/preset"

import {
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { PRESET_THEME_GENERATOR_TOOL } from "@/app/tools/tools"
import { trackPresetThemeDecodeSubmit } from "@/lib/analytics-events"

type PresetThemeGeneratorHeaderProps = {
  defaultCode: string
}

export function PresetThemeGeneratorHeader({
  defaultCode,
}: PresetThemeGeneratorHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = React.useState(defaultCode)

  React.useEffect(() => {
    setValue(defaultCode)
  }, [defaultCode])

  function updateCode(nextCode: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (nextCode) {
      params.set("code", nextCode)
    } else {
      params.delete("code")
    }

    const nextSearch = params.toString()
    router.push(nextSearch ? `${pathname}?${nextSearch}` : pathname)
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextCode = value.trim()

    if (nextCode) {
      trackPresetThemeDecodeSubmit({
        pagePath: pathname,
        presetCode: nextCode,
      })
    }

    updateCode(nextCode)
  }

  function onRandomize() {
    const nextCode = generateRandomPreset()
    setValue(nextCode)
    updateCode(nextCode)
  }

  return (
    <>
      <PageHeaderHeading className="max-w-4xl">
        {PRESET_THEME_GENERATOR_TOOL.title}
      </PageHeaderHeading>
      <PageHeaderDescription className="text-muted-foreground">
        {PRESET_THEME_GENERATOR_TOOL.description}
      </PageHeaderDescription>
      <form className="w-full max-w-2xl" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="preset-theme-code">
          Preset code
        </label>
        <InputGroup className="h-9">
          <InputGroupInput
            id="preset-theme-code"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Enter preset code"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton onClick={onRandomize}>Random</InputGroupButton>
            <InputGroupButton type="submit" variant="secondary">
              Decode
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </>
  )
}

"use client"

import * as React from "react"

import { compileGeneratedPreview } from "@/lib/generated-preview/compile"
import { inferPreviewLayout } from "@/lib/generated-preview/infer-layout"
import {
  GENERATED_PREVIEW_READY_MESSAGE_TYPE,
  isGeneratedPreviewMessage,
  type GeneratedPreviewPayload,
} from "@/lib/generated-preview/messages"
import {
  GENERATED_PREVIEW_SCOPE,
  PreviewLayoutProvider,
} from "@/lib/generated-preview/scope"
import { Spinner } from "@/components/ui/spinner"

class PreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; resetKey: string },
  { error: string | null }
> {
  state = { error: null as string | null }

  static getDerivedStateFromError(error: unknown) {
    return {
      error: error instanceof Error ? error.message : "Preview failed to render.",
    }
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return <GeneratedPreviewError message={this.state.error} />
    }
    return this.props.children
  }
}

function GeneratedPreviewError({ message }: { message: string }) {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md rounded-xl border bg-card p-4 text-sm text-card-foreground">
        <p className="font-medium">Could not render this preview.</p>
        <p className="mt-1 text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

function CompiledPreview({ code }: { code: string }) {
  const compiled = React.useMemo(
    () => compileGeneratedPreview(code, GENERATED_PREVIEW_SCOPE),
    [code]
  )
  // Read off the returned code, not chosen by the model, so the same output
  // always renders in the same layout.
  const layout = React.useMemo(() => inferPreviewLayout(code), [code])

  if (!compiled.ok) {
    return <GeneratedPreviewError message={compiled.error} />
  }

  const Preview = compiled.component
  return (
    <PreviewLayoutProvider layout={layout}>
      <Preview />
    </PreviewLayoutProvider>
  )
}

/** How long to wait for the host before assuming no preview is coming. */
const PAYLOAD_WAIT_MS = 4000

export function GeneratedPreviewExample() {
  const [payload, setPayload] = React.useState<GeneratedPreviewPayload | null>(
    null
  )
  const [waitedForPayload, setWaitedForPayload] = React.useState(false)

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      if (!isGeneratedPreviewMessage(event.data)) return
      setPayload({
        title: event.data.title,
        code: event.data.code,
      })
    }

    window.addEventListener("message", handleMessage)
    window.parent.postMessage(
      { type: GENERATED_PREVIEW_READY_MESSAGE_TYPE },
      window.location.origin
    )

    // A `?view=generated` URL can outlive the preview it was created for — the
    // code lives in the host's session storage, not in the URL.
    const timeoutId = window.setTimeout(
      () => setWaitedForPayload(true),
      PAYLOAD_WAIT_MS
    )

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  if (!payload) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6 text-center">
        {waitedForPayload ? (
          <div className="max-w-md text-sm text-muted-foreground">
            <p className="font-medium text-foreground">
              No generated preview to show.
            </p>
            <p className="mt-1">
              Ask the assistant to show a component with this preset applied.
            </p>
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    )
  }

  return (
    <PreviewErrorBoundary resetKey={payload.code}>
      <CompiledPreview code={payload.code} />
    </PreviewErrorBoundary>
  )
}

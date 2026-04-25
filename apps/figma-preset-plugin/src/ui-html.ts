export const uiHtml = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shadcn Preset Variables</title>
    <style>
      :root {
        color-scheme: light dark;
        --background: oklch(1 0 0);
        --foreground: oklch(0.145 0 0);
        --card: oklch(1 0 0);
        --card-foreground: oklch(0.145 0 0);
        --popover: oklch(1 0 0);
        --popover-foreground: oklch(0.145 0 0);
        --primary: oklch(0.205 0 0);
        --primary-foreground: oklch(0.985 0 0);
        --secondary: oklch(0.97 0 0);
        --secondary-foreground: oklch(0.205 0 0);
        --muted: oklch(0.97 0 0);
        --muted-foreground: oklch(0.556 0 0);
        --accent: oklch(0.97 0 0);
        --accent-foreground: oklch(0.205 0 0);
        --destructive: oklch(0.577 0.245 27.325);
        --border: oklch(0.922 0 0);
        --input: oklch(0.922 0 0);
        --ring: oklch(0.708 0 0);
        --radius: 0.625rem;
        --font-sans: "Inter", system-ui, sans-serif;
        font-family: var(--font-sans);
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --background: oklch(0 0 0);
          --foreground: oklch(0.985 0 0);
          --card: oklch(0.205 0 0);
          --card-foreground: oklch(0.985 0 0);
          --popover: oklch(0.205 0 0);
          --popover-foreground: oklch(0.985 0 0);
          --primary: oklch(0.922 0 0);
          --primary-foreground: oklch(0.205 0 0);
          --secondary: oklch(0.269 0 0);
          --secondary-foreground: oklch(0.985 0 0);
          --muted: oklch(0.269 0 0);
          --muted-foreground: oklch(0.708 0 0);
          --accent: oklch(0.269 0 0);
          --accent-foreground: oklch(0.985 0 0);
          --destructive: oklch(0.704 0.191 22.216);
          --border: oklch(1 0 0 / 10%);
          --input: oklch(1 0 0 / 15%);
          --ring: oklch(0.556 0 0);
        }
      }

      body {
        margin: 0;
        padding: 16px;
        background: var(--background);
        color: var(--foreground);
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      .copy {
        margin: 0;
        color: var(--muted-foreground);
        font-size: 12px;
        line-height: 1.5;
      }

      label {
        display: grid;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--foreground);
      }

      input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--input);
        border-radius: var(--radius);
        padding: 10px 12px;
        font: inherit;
        font-size: 12px;
        background: var(--background);
        color: var(--foreground);
        outline: none;
        transition:
          border-color 120ms ease,
          box-shadow 120ms ease;
      }

      input::placeholder {
        color: var(--muted-foreground);
      }

      input:focus {
        border-color: var(--ring);
        box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 30%, transparent);
      }

      button {
        border: 0;
        border-radius: var(--radius);
        padding: 10px 12px;
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        font-size: 12px;
        background: var(--primary);
        color: var(--primary-foreground);
      }

      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .status {
        min-height: 40px;
        border-radius: calc(var(--radius) + 2px);
        padding: 10px 12px;
        background: var(--muted);
        color: var(--card-foreground);
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
        border: 1px solid var(--border);
      }

      .status.error {
        background: color-mix(in oklch, var(--destructive) 12%, var(--background));
        color: var(--destructive);
        border-color: color-mix(in oklch, var(--destructive) 24%, var(--border));
      }

      .status.success {
        background: color-mix(in oklch, var(--primary) 12%, var(--background));
        color: var(--foreground);
        border-color: color-mix(in oklch, var(--primary) 24%, var(--border));
      }
    </style>
  </head>
  <body>
    <form id="form" class="stack">
      <div class="stack" style="gap: 4px">
        <h1 style="margin: 0; font-size: 16px">Preset -> Figma Variables</h1>
        <p class="copy">
          Paste a canonical shadcn preset code. The plugin will generate or
          update one local Figma variable collection with Light and Dark modes.
        </p>
      </div>

      <label>
        Preset code
        <input id="preset-code" name="presetCode" value="b0" spellcheck="false" />
      </label>

      <label>
        Collection name
        <input
          id="collection-name"
          name="collectionName"
          value="Shadcn Preset/b0"
          spellcheck="false"
        />
      </label>

      <button id="submit" type="submit">Generate variables</button>

      <div id="status" class="status">
Creates color variables for semantic theme tokens plus string variables for
preset metadata, fonts, and radius.
      </div>
    </form>

    <script>
      const form = document.getElementById("form")
      const submit = document.getElementById("submit")
      const presetCode = document.getElementById("preset-code")
      const collectionName = document.getElementById("collection-name")
      const status = document.getElementById("status")

      function setStatus(kind, message) {
        status.className = "status" + (kind ? " " + kind : "")
        status.textContent = message
      }

      presetCode.addEventListener("input", () => {
        const value = presetCode.value.trim()
        if (!collectionName.dataset.touched) {
          collectionName.value = value
            ? "Shadcn Preset/" + value
            : "Shadcn Preset"
        }
      })

      collectionName.addEventListener("input", () => {
        collectionName.dataset.touched = "true"
      })

      form.addEventListener("submit", (event) => {
        event.preventDefault()
        submit.disabled = true
        setStatus("", "Generating Figma variables...")

        parent.postMessage(
          {
            pluginMessage: {
              type: "generate-variables",
              presetCode: presetCode.value,
              collectionName: collectionName.value,
            },
          },
          "*"
        )
      })

      window.addEventListener("message", (event) => {
        const message = event.data.pluginMessage
        if (!message) return

        if (message.type === "generate-success") {
          submit.disabled = false
          setStatus(
            "success",
            [
              "Collection: " + message.collectionName,
              "Preset: " + message.presetCode,
              "Created/updated: " + message.variableCount + " variables",
              message.summary,
            ].join("\n")
          )
        }

        if (message.type === "generate-error") {
          submit.disabled = false
          setStatus("error", message.error)
        }
      })
    </script>
  </body>
</html>
`

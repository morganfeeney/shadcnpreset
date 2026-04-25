export const uiHtml = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shadcn Preset Variables</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: Inter, system-ui, sans-serif;
        --bg: #ffffff;
        --fg: #111827;
        --muted: #6b7280;
        --border: #d1d5db;
        --button: #111827;
        --button-fg: #ffffff;
        --surface: #f3f4f6;
        --surface-success: #ecfdf5;
        --surface-success-fg: #166534;
        --surface-error: #fef2f2;
        --surface-error-fg: #991b1b;
      }

      @media (prefers-color-scheme: dark) {
        :root {
          --bg: #1f1f1f;
          --fg: #f9fafb;
          --muted: #a1a1aa;
          --border: #848484;
          --button: #52525b;
          --button-fg: #ffffff;
          --surface: #27272a;
          --surface-success: #052e16;
          --surface-success-fg: #86efac;
          --surface-error: #450a0a;
          --surface-error-fg: #fca5a5;
        }
      }

      body {
        margin: 0;
        padding: 16px;
        background: var(--bg);
        color: var(--fg);
      }

      .stack {
        display: grid;
        gap: 12px;
      }

      .copy {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.5;
      }

      label {
        display: grid;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--fg);
      }

      input {
        width: 100%;
        box-sizing: border-box;
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 10px 12px;
        font: inherit;
        font-size: 14px;
        background: var(--bg);
        color: var(--fg);
      }

      input::placeholder {
        color: var(--muted);
      }

      button {
        border: 0;
        border-radius: 10px;
        padding: 10px 12px;
        background: var(--button);
        color: var(--button-fg);
        font: inherit;
        font-weight: 600;
        cursor: pointer;
        font-size: 12px;
      }

      button:disabled {
        opacity: 0.6;
        cursor: wait;
      }

      .status {
        min-height: 40px;
        border-radius: 12px;
        padding: 10px 12px;
        background: var(--surface);
        font-size: 12px;
        line-height: 1.5;
        white-space: pre-wrap;
      }

      .status.error {
        background: var(--surface-error);
        color: var(--surface-error-fg);
      }

      .status.success {
        background: var(--surface-success);
        color: var(--surface-success-fg);
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

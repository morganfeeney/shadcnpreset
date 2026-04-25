import { generateVariablePayload } from "./preset-theme"
import { uiHtml } from "./ui-html"

type GenerateVariablesMessage = {
  type: "generate-variables"
  presetCode: string
  collectionName?: string
}

function getOrCreateCollection(name: string) {
  return (
    figma.variables
      .getLocalVariableCollections()
      .find((collection) => collection.name === name) ??
    figma.variables.createVariableCollection(name)
  )
}

function ensureModes(collection: VariableCollection) {
  const lightMode = collection.modes[0]

  if (lightMode.name !== "Light") {
    collection.renameMode(lightMode.modeId, "Light")
  }

  const existingDarkMode = collection.modes.find((mode) => mode.name === "Dark")
  const darkModeId = existingDarkMode?.modeId ?? collection.addMode("Dark")

  return {
    lightModeId: lightMode.modeId,
    darkModeId,
  }
}

function getOrCreateVariable(
  collection: VariableCollection,
  name: string,
  resolvedType: VariableResolvedDataType
) {
  return (
    figma.variables
      .getLocalVariables(resolvedType)
      .find(
        (variable) =>
          variable.variableCollectionId === collection.id && variable.name === name
      ) ?? figma.variables.createVariable(name, collection, resolvedType)
  )
}

function createOrUpdateVariables(
  collection: VariableCollection,
  payload: ReturnType<typeof generateVariablePayload>
) {
  const { lightModeId, darkModeId } = ensureModes(collection)

  for (const colorVariable of payload.colors) {
    const variable = getOrCreateVariable(collection, colorVariable.name, "COLOR")
    variable.setValueForMode(lightModeId, colorVariable.light)
    variable.setValueForMode(darkModeId, colorVariable.dark)
  }

  for (const stringVariable of payload.strings) {
    const variable = getOrCreateVariable(collection, stringVariable.name, "STRING")
    variable.setValueForMode(lightModeId, stringVariable.value)
    variable.setValueForMode(darkModeId, stringVariable.value)
  }

  return payload.colors.length + payload.strings.length
}

figma.showUI(uiHtml, {
  width: 420,
  height: 430,
  themeColors: true,
})

figma.ui.onmessage = (message: GenerateVariablesMessage) => {
  if (message.type !== "generate-variables") {
    return
  }

  try {
    const payload = generateVariablePayload(
      message.presetCode,
      message.collectionName
    )
    const collection = getOrCreateCollection(payload.collectionName)
    const variableCount = createOrUpdateVariables(collection, payload)

    figma.notify(`Updated ${variableCount} variables in ${payload.collectionName}.`)
    figma.ui.postMessage({
      type: "generate-success",
      collectionName: payload.collectionName,
      presetCode: payload.presetCode,
      summary: payload.summary,
      variableCount,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not generate variables."

    figma.ui.postMessage({
      type: "generate-error",
      error: message,
    })
  }
}

"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

type CreatePickerProps = {
  label: string
  value: string
  options: readonly string[]
  onValueChange: (value: string) => void
  indicator?: React.ReactNode
}

function formatPickerValue(value: string) {
  return value
    .split("-")
    .map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : part))
    .join(" ")
}

export function CreatePicker({
  label,
  value,
  options,
  onValueChange,
  indicator,
}: CreatePickerProps) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger ref={buttonRef} className="create-picker-trigger" aria-label={`${label} picker`}>
        <span className="create-picker-label">{label}</span>
        <span className="create-picker-value-row">
          <span className="create-picker-value">{formatPickerValue(value)}</span>
          {indicator ? (
            <span aria-hidden="true" className="create-picker-indicator">
              {indicator}
            </span>
          ) : (
            <span aria-hidden="true" className="create-picker-caret">
              <svg
                aria-hidden="true"
                className="create-picker-caret-icon"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </span>
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner
          anchor={buttonRef}
          className="create-picker-positioner"
          sideOffset={8}
        >
          <MenuPrimitive.Popup className="create-picker-popup">
            <MenuPrimitive.RadioGroup
              value={value}
              onValueChange={(next) => onValueChange(next)}
            >
              {options.map((option) => (
                <MenuPrimitive.RadioItem
                  className="create-picker-item"
                  closeOnClick
                  key={option}
                  value={option}
                >
                  <span className="create-picker-item-label">
                    <span>{formatPickerValue(option)}</span>
                  </span>
                  <MenuPrimitive.RadioItemIndicator className="create-picker-check">
                    <svg
                      aria-hidden="true"
                      className="create-picker-check-icon"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 10.5L8.25 13.5L15 6.5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </MenuPrimitive.RadioItemIndicator>
                </MenuPrimitive.RadioItem>
              ))}
            </MenuPrimitive.RadioGroup>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}

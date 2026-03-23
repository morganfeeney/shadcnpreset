"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

type CreatePickerProps = {
  label: string
  value: string
  options: readonly string[]
  onValueChange: (value: string) => void
}

export function CreatePicker({
  label,
  value,
  options,
  onValueChange,
}: CreatePickerProps) {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        ref={buttonRef}
        className="create-picker-trigger"
        aria-label={`${label} picker`}
      >
        <span className="create-picker-label">{label}</span>
        <span className="create-picker-value-row">
          <span className="create-picker-value">{value}</span>
          <span aria-hidden="true" className="create-picker-caret">
            ▾
          </span>
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
                    <span>{option}</span>
                  </span>
                  <MenuPrimitive.RadioItemIndicator className="create-picker-check">
                    ✓
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

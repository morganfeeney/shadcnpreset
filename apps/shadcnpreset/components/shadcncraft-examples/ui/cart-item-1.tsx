"use client"

import { Button } from "@/components/cn-ui/button"
import { ButtonGroup } from "@/components/cn-ui/button-group"
import { IconPlaceholder } from "@/components/icon-placeholder"

type CartItem1Props = {
  title: string
  price: string
  description: string
  imageSrc: string
  imageAlt: string
  quantity: number

  onQuantityChange: (quantity: number) => void
  onRemove?: () => void
}

export function CartItem1({
  title,
  price,
  description,
  imageSrc,
  imageAlt,
  quantity,

  onQuantityChange,
  onRemove,
}: CartItem1Props) {
  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange?.(quantity - 1)
    }
  }

  const handleIncrement = () => {
    onQuantityChange?.(quantity + 1)
  }

  return (
    <div className="flex gap-5">
      <div className="relative h-25.5 w-22.5 shrink-0 overflow-hidden rounded-lg">
        <img src={imageSrc} alt={imageAlt} className="size-full object-cover" />
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-1.5 font-medium">
            <span className="line-clamp-2">{title}</span>
            <span>{price}</span>
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ButtonGroup>
            <Button
              type="button"
              className="w-8 border-r-0"
              variant="outline"
              size="sm"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              -
            </Button>

            <Button
              type="button"
              className="w-8 border-l! tabular-nums select-none disabled:opacity-100"
              variant="outline"
              size="sm"
              disabled
            >
              {quantity}
            </Button>

            <Button
              type="button"
              className="w-8"
              variant="outline"
              size="sm"
              onClick={handleIncrement}
              aria-label="Increase quantity"
            >
              +
            </Button>
          </ButtonGroup>

          {onRemove && (
            <Button
              type="button"
              className="px-0!"
              variant="link"
              size="sm"
              onClick={onRemove}
            >
              <IconPlaceholder
                lucide="Trash2Icon"
                tabler="IconTrash"
                hugeicons="Delete02Icon"
                phosphor="TrashIcon"
                remixicon="RiDeleteBinLine"
              />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

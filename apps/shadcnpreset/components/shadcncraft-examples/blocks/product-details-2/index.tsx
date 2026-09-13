"use client"

import { useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/cn-ui/accordion"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/cn-ui/breadcrumb"
import { Button } from "@/components/cn-ui/button"
import { ButtonGroup } from "@/components/cn-ui/button-group"
import {
  SectionHeading,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { StarRating } from "@/components/shadcncraft-examples/ui/star-rating"
import { Separator } from "@/components/cn-ui/separator"
import { IconPlaceholder } from "@/components/icon-placeholder"

const SIZES = ["XXS", "XS", "S", "M", "L", "XL"]

const COLORS = [
  { name: "White", value: "white", color: "#fff" },
  { name: "Black", value: "black", color: "#000" },
  { name: "Blue", value: "blue", color: "#6a9bdf" },
  { name: "Yellow", value: "yellow", color: "#f9f0b0" },
]

const ACCORDION_ITEMS = [
  {
    trigger: "Composition & care",
    value: "composition-care",
    content:
      "Made from 100% combed cotton jersey (180 GSM) for a soft, breathable feel. Machine wash cold with similar colors, do not bleach, tumble dry low, and warm iron on reverse if needed. Avoid dry cleaning to preserve the fabric finish and print quality.",
  },
  {
    trigger: "Shipping",
    value: "shipping",
    content:
      "Orders are processed within 1-2 business days. Standard delivery takes 3-5 business days, while express shipping arrives in 1-2 business days. Free standard shipping is available for orders over $75. Tracking details are sent by email once your package leaves our warehouse.",
  },
  {
    trigger: "Returns",
    value: "returns",
    content:
      "You can return unworn items within 30 days of delivery for a full refund or exchange. Products must be in original condition with tags attached. Final sale items are non-returnable. To start a return, visit your order history page or contact support with your order number.",
  },
]

export function ProductDetails2() {
  const [selectedSize, setSelectedSize] = useState("L")
  const [selectedColor, setSelectedColor] = useState("white")
  const [quantity, setQuantity] = useState(1)

  const handleDecrement = () => {
    setQuantity((v) => Math.max(v - 1, 1))
  }

  const handleIncrement = () => {
    setQuantity((v) => v + 1)
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 md:py-16 lg:px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">New Arrivals</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbEllipsis />

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Summer</BreadcrumbPage>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Short Sleeves</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col items-start gap-10 md:flex-row md:gap-12">
        {/* Image */}
        <div className="relative aspect-7/8 w-full flex-1 overflow-hidden">
          <img
            src="https://assets.shadcncraft.com/registry/pro-ecommerce/product-details/1.webp"
            alt="Minimal T-shirt"
            className="absolute inset-0 size-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col gap-6 md:gap-8">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <SectionHeading alignment="left" size="sm">
              <SectionHeadingTitle>Minimal T-shirt</SectionHeadingTitle>
            </SectionHeading>

            <StarRating
              orientation="horizontal"
              size="lg"
              label="1.2k+ reviews"
              value={5}
            />

            {/* Description */}
            <p className="text-muted-foreground">
              Minimalist white T-shirt on a gray background, showcasing its
              clean design and soft fabric texture.
            </p>

            {/* Price */}
            <div className="text-3xl font-medium tracking-tight">$19.99</div>

            <Separator />
          </div>

          {/* Configuration */}
          <div className="flex flex-col gap-4">
            {/* Size */}
            <div className="flex flex-col gap-2.5">
              <div className="text-lg font-medium">Size</div>
              <div className="flex flex-wrap gap-3">
                {SIZES.map((size) => {
                  const isSelected = selectedSize === size
                  const variant = isSelected ? "default" : "outline"
                  return (
                    <Button
                      key={size}
                      type="button"
                      className="min-w-16 border data-[variant=default]:border-transparent"
                      variant={variant}
                      data-variant={variant}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Color */}
            <div className="flex flex-col gap-2.5">
              <div className="text-lg font-medium">Color</div>
              <div className="flex items-center gap-3.75">
                {COLORS.map((color) => {
                  const isSelected = selectedColor === color.value
                  return (
                    <button
                      key={color.value}
                      type="button"
                      className="size-6 rounded-full border-3 transition-colors data-[selected=true]:border-foreground"
                      style={{ backgroundColor: color.color }}
                      aria-label={color.name}
                      data-selected={isSelected}
                      onClick={() => setSelectedColor(color.value)}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Quantity */}
            <ButtonGroup className="max-md:w-auto">
              <Button
                type="button"
                className="flex-1 border-r-0 md:w-10"
                variant="outline"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                onClick={handleDecrement}
              >
                -
              </Button>

              <Button
                type="button"
                className="flex-1 border-l! tabular-nums select-none disabled:opacity-100 md:w-10"
                variant="outline"
                disabled
              >
                {quantity}
              </Button>

              <Button
                type="button"
                className="flex-1 md:w-10"
                variant="outline"
                aria-label="Increase quantity"
                onClick={handleIncrement}
              >
                +
              </Button>
            </ButtonGroup>

            <Button className="flex-1">
              <IconPlaceholder
                lucide="ShoppingCartIcon"
                tabler="IconShoppingCart"
                hugeicons="ShoppingCart01Icon"
                phosphor="ShoppingCartIcon"
                remixicon="RiShoppingCartLine"
              />
              Add to cart
            </Button>
          </div>

          {/* Accordions */}
          <Accordion multiple>
            {ACCORDION_ITEMS.map((item) => (
              <AccordionItem key={item.value} value={item.value}>
                <AccordionTrigger>{item.trigger}</AccordionTrigger>
                <AccordionContent>{item.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  )
}

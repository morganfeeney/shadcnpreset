"use client"

import { CartItem1 } from "@/components/shadcncraft-examples/ui/cart-item-1"
import { Button } from "@/components/cn-ui/button"
import { Input } from "@/components/cn-ui/input"
import {
  SectionHeading,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { Separator } from "@/components/cn-ui/separator"

export function ShoppingCart2() {
  return (
    <div className="bg-muted">
      <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 lg:grid-cols-3 lg:gap-12 lg:px-6 lg:py-16">
        <div className="flex flex-col gap-6 self-start rounded-lg bg-card p-5 lg:col-span-2 lg:p-6">
          <SectionHeading alignment="left" size="sm">
            <SectionHeadingTitle>Your cart</SectionHeadingTitle>
          </SectionHeading>

          {/* Cart Items */}
          <div className="flex flex-col gap-5">
            <CartItem1
              title="White T-Shirt"
              price="$19.99"
              description="Minimalist T-Shirt."
              imageSrc="https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/1.webp"
              imageAlt="White T-Shirt"
              quantity={1}
              onQuantityChange={() => {}}
              onRemove={() => {}}
            />

            <Separator />

            <CartItem1
              title="Socks"
              price="$14.99"
              description="Knitted socks with ribbed cuffs."
              imageSrc="https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/2.webp"
              imageAlt="Socks"
              quantity={1}
              onQuantityChange={() => {}}
              onRemove={() => {}}
            />

            <Separator />

            <CartItem1
              title="Green Snearkers"
              price="$89.99"
              description="Sneaker with textured pattern."
              imageSrc="https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/3.webp"
              imageAlt="Green Sneakers"
              quantity={1}
              onQuantityChange={() => {}}
              onRemove={() => {}}
            />
          </div>
        </div>

        <div className="flex flex-col gap-5 self-start rounded-lg bg-card p-5 lg:p-6">
          {/* Promo Code */}
          <div className="flex flex-col gap-2">
            <label htmlFor="promo-code">Promo code</label>

            <div className="flex gap-2 max-sm:flex-col">
              <Input id="promo-code" type="text" placeholder="Enter code" />
              <Button type="button">Apply</Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span className="text-lg font-medium">$19.99</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span className="text-lg font-medium">Free</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Taxes</span>
                <span className="text-lg font-medium">$4.65</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-medium">Total</span>
              <span className="text-lg font-medium">$24.64</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Button type="button">Checkout</Button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { CartItem1 } from "@/components/shadcncraft-examples/ui/cart-item-1"
import { Button } from "@/components/cn-ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/cn-ui/field"
import { Input } from "@/components/cn-ui/input"
import { Label } from "@/components/cn-ui/label"
import {
  SectionHeading,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { RadioGroup, RadioGroupItem } from "@/components/cn-ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { Separator } from "@/components/cn-ui/separator"

export function Checkout1() {
  return (
    <form>
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-5 **:data-[slot=field]:gap-2 md:grid-cols-2 lg:gap-12 lg:px-6 lg:py-16">
        {/* Left Column: Shipping Information & Payment */}
        <div className="flex flex-col gap-7">
          {/* Shipping Information */}
          <div className="flex flex-col gap-7">
            <SectionHeading alignment="left" size="sm">
              <SectionHeadingTitle>Shipping Information</SectionHeadingTitle>
            </SectionHeading>

            {/* Form Fields */}
            <div className="flex flex-col gap-5">
              {/* First Name & Last Name */}
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <Input
                    name="firstName"
                    autoComplete="given-name"
                    placeholder="John"
                  />
                </Field>

                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <Input
                    name="lastName"
                    autoComplete="family-name"
                    placeholder="Doe"
                  />
                </Field>
              </div>

              {/* E-mail & Phone */}
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field>
                  <FieldLabel>E-mail</FieldLabel>
                  <Input
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="email@example.com"
                  />
                </Field>

                <Field>
                  <FieldLabel>Phone</FieldLabel>
                  <Input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="919-555-8247"
                  />
                </Field>
              </div>

              {/* Address */}
              <Field>
                <FieldLabel>Address</FieldLabel>
                <Input
                  name="address"
                  autoComplete="shipping street-address"
                  placeholder="1920 N Tyler Street"
                />
              </Field>

              {/* City & Country */}
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field>
                  <FieldLabel>City</FieldLabel>
                  <Input
                    name="city"
                    autoComplete="shipping address-level2"
                    placeholder="Tacoma"
                  />
                </Field>

                <Field>
                  <FieldLabel>Country</FieldLabel>
                  <Select
                    name="country"
                    autoComplete="shipping country"
                    defaultValue="us"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="vn">Viet Nam</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* State/Province & Postal Code */}
              <div className="grid gap-2.5 md:grid-cols-2">
                <Field>
                  <FieldLabel>State / Province</FieldLabel>
                  <Input
                    name="state"
                    autoComplete="shipping address-level1"
                    placeholder="Washington"
                  />
                </Field>

                <Field>
                  <FieldLabel>Postal code</FieldLabel>
                  <Input
                    name="postalCode"
                    autoComplete="shipping postal-code"
                    placeholder="98406"
                  />
                </Field>
              </div>
            </div>

            {/* Shipping Options (Mobile) */}
            <RadioGroup
              className="grid gap-2.5 md:hidden"
              defaultValue="regular"
            >
              <Field orientation="horizontal">
                <RadioGroupItem value="express" id="express-shipping-mobile" />
                <FieldContent>
                  <FieldLabel htmlFor="express-shipping-mobile">
                    Express (1-2 days)
                  </FieldLabel>
                  <FieldDescription>$4.99</FieldDescription>
                </FieldContent>
              </Field>

              <Field orientation="horizontal">
                <RadioGroupItem value="regular" id="regular-shipping-mobile" />
                <FieldContent>
                  <FieldLabel htmlFor="regular-shipping-mobile">
                    Regular (4-5 days)
                  </FieldLabel>
                  <FieldDescription>Free</FieldDescription>
                </FieldContent>
              </Field>
            </RadioGroup>

            {/* Shipping Options (Desktop) */}
            <RadioGroup
              className="grid gap-2.5 max-md:hidden lg:grid-cols-2"
              defaultValue="regular"
            >
              <FieldLabel htmlFor="express-shipping-desktop">
                <Field orientation="horizontal">
                  <RadioGroupItem
                    value="express"
                    id="express-shipping-desktop"
                  />
                  <FieldContent>
                    <FieldTitle>Express (1-2 days)</FieldTitle>
                    <FieldDescription>$4.99</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>

              <FieldLabel htmlFor="regular-shipping-desktop">
                <Field orientation="horizontal">
                  <RadioGroupItem
                    value="regular"
                    id="regular-shipping-desktop"
                  />
                  <FieldContent>
                    <FieldTitle>Regular (4-5 days)</FieldTitle>
                    <FieldDescription>Free</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </RadioGroup>
          </div>

          <Separator />

          {/* Payment */}
          <div className="flex flex-col gap-7">
            <SectionHeading alignment="left" size="sm">
              <SectionHeadingTitle>Payment</SectionHeadingTitle>
            </SectionHeading>

            {/* Payment Method */}
            <RadioGroup
              className="flex flex-wrap gap-5"
              defaultValue="credit-card"
            >
              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="credit-card" id="credit-card" />
                <Label htmlFor="credit-card">Credit card</Label>
              </div>

              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">PayPal</Label>
              </div>

              <div className="flex items-center gap-2.5">
                <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                <Label htmlFor="bank-transfer">Bank transfer</Label>
              </div>
            </RadioGroup>

            {/* Card Details */}
            <div className="flex flex-col gap-5">
              {/* Card Number, Expiry, CVC */}
              <div className="flex items-end gap-2.5">
                <Field className="flex-1">
                  <FieldLabel>Card Number</FieldLabel>
                  <Input
                    name="cardNumber"
                    autoComplete="cc-number"
                    placeholder="1234 1234 1234 1234"
                  />
                </Field>

                <Field className="w-20">
                  <Input
                    name="cardExpiry"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                  />
                </Field>

                <Field className="w-15">
                  <Input
                    name="cardCVC"
                    autoComplete="cc-csc"
                    placeholder="CVC"
                  />
                </Field>
              </div>

              {/* Name on Card */}
              <Field>
                <FieldLabel>Name on card</FieldLabel>
                <Input
                  name="cardName"
                  autoComplete="cc-name"
                  placeholder="John Doe"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="flex flex-col gap-7">
          <SectionHeading alignment="left" size="sm">
            <SectionHeadingTitle>Summary</SectionHeadingTitle>
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

          {/* Order Summary */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1.5">
                <span>Subtotal</span>
                <span className="text-lg font-medium">$124.97</span>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <span>Shipping</span>
                <span className="text-lg font-medium">Free</span>
              </div>

              <div className="flex items-center justify-between gap-1.5">
                <span>Taxes</span>
                <span className="text-lg font-medium">$34.65</span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between gap-1.5">
              <span className="font-medium">Total</span>
              <span className="text-lg font-medium">$159.62</span>
            </div>
          </div>

          {/* Confirm Order Button */}
          <Button type="submit">Confirm order</Button>
        </div>
      </div>
    </form>
  )
}

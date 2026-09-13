import { Checkout1 } from "@/components/shadcncraft-examples/blocks/checkout-1"
import { ProductCategory3 } from "@/components/shadcncraft-examples/blocks/product-category-3"
import { ProductDetails2 } from "@/components/shadcncraft-examples/blocks/product-details-2"
import { ProductList3 } from "@/components/shadcncraft-examples/blocks/product-list-3"
import { ShoppingCart2 } from "@/components/shadcncraft-examples/blocks/shopping-cart-2"
import { ShadcncraftCredit } from "@/components/shadcncraft-examples/credit"

/** A shopper's path through the store: browse, pick, review the cart, pay. */
export function StoreDemo() {
  return (
    <div className="bg-background px-2 text-foreground">
      <ShadcncraftCredit label="E-commerce blocks" source="store-preview" />
      <main>
        <ProductCategory3 />
        <ProductList3 />
        <ProductDetails2 />
        <ShoppingCart2 />
        <Checkout1 />
      </main>
    </div>
  )
}

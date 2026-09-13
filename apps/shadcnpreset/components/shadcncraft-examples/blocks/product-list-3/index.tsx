import {
  ProductCard2,
  ProductCard2Body,
  ProductCard2Color,
  ProductCard2Colors,
  ProductCard2Content,
  ProductCard2Description,
  ProductCard2Header,
  ProductCard2Image,
  ProductCard2ImageBadge,
  ProductCard2Price,
  ProductCard2StarRating,
  ProductCard2Text,
  ProductCard2Title,
} from "@/components/shadcncraft-examples/ui/product-card-2"
import { Badge } from "@/components/cn-ui/badge"
import { Button } from "@/components/cn-ui/button"
import {
  SectionHeading,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"
import { IconPlaceholder } from "@/components/icon-placeholder"

export function ProductList3() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:py-16 lg:px-6">
      <div className="flex flex-col gap-5 md:gap-7">
        <SectionHeading alignment="left" size="sm">
          <SectionHeadingTitle>Summer collection</SectionHeadingTitle>
        </SectionHeading>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-7 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard2 key={product.id} className="w-full">
              <a href="#" className="flex w-full">
                <ProductCard2Image>
                  <img
                    src={product.image}
                    alt={product.title}
                    className="size-full object-cover"
                  />
                  <ProductCard2ImageBadge>
                    <Badge variant="secondary">Sale</Badge>
                  </ProductCard2ImageBadge>
                </ProductCard2Image>
              </a>

              <ProductCard2Body>
                <ProductCard2Content>
                  <ProductCard2StarRating
                    value={product.starRating}
                    label={product.starRating.toFixed(1).toString()}
                  />

                  <ProductCard2Text>
                    <ProductCard2Header>
                      <ProductCard2Title>{product.title}</ProductCard2Title>
                      <ProductCard2Price>{product.price}</ProductCard2Price>
                    </ProductCard2Header>
                    <ProductCard2Description>
                      {product.description}
                    </ProductCard2Description>
                  </ProductCard2Text>

                  <ProductCard2Colors>
                    <ProductCard2Color style={{ backgroundColor: "#ffffff" }} />
                    <ProductCard2Color style={{ backgroundColor: "#000000" }} />
                    <ProductCard2Color style={{ backgroundColor: "#6A9BDF" }} />
                    <ProductCard2Color style={{ backgroundColor: "#F9F0B0" }} />
                  </ProductCard2Colors>
                </ProductCard2Content>

                <Button className="w-full">
                  <IconPlaceholder
                    lucide="ShoppingCartIcon"
                    tabler="IconShoppingCart"
                    hugeicons="ShoppingCart01Icon"
                    phosphor="ShoppingCartIcon"
                    remixicon="RiShoppingCartLine"
                  />
                  Add item
                </Button>
              </ProductCard2Body>
            </ProductCard2>
          ))}
        </div>
      </div>
    </div>
  )
}

const PRODUCTS = [
  {
    id: 1,
    starRating: 5,
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/1.webp",
    title: "T-Shirt",
    price: "$19.99",
    description: "Minimalist white T-shirt.",
  },
  {
    id: 2,
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/2.webp",
    starRating: 5,
    title: "Socks",
    price: "$14.99",
    description: "Knitted socks with ribbed cuffs.",
  },
  {
    id: 3,
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/4.webp",
    starRating: 4.2,
    title: "T-Shirt",
    price: "$29.99",
    description: "T-shirt with a round neckline.",
  },
  {
    id: 4,
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/checkout/3.webp",
    starRating: 4.3,
    title: "Sneakers",
    price: "$89.99",
    description: "Sneaker with textured pattern.",
  },
]

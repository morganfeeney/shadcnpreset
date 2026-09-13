import {
  ProductCategoryCard,
  ProductCategoryCardContent,
  ProductCategoryCardDescription,
  ProductCategoryCardImage,
  ProductCategoryCardOverlay,
  ProductCategoryCardTitle,
} from "@/components/shadcncraft-examples/ui/product-category-card-1"
import {
  SectionHeading,
  SectionHeadingTitle,
} from "@/components/shadcncraft-examples/ui/section-heading"

export function ProductCategory3() {
  return (
    <div className="mx-auto w-full max-w-7xl py-5 md:py-16">
      <div className="flex flex-col gap-4 md:gap-7">
        <SectionHeading alignment="left" size="sm">
          <SectionHeadingTitle>Categories</SectionHeadingTitle>
        </SectionHeading>

        <div className="grid gap-4 md:grid-cols-2 md:gap-7">
          {CATEGORIES.map((category) => (
            <a
              key={category.title}
              href="#"
              className="flex md:first:row-span-2 md:first:*:data-[slot=product-category-card]:h-full"
            >
              <ProductCategoryCard className="h-108 w-full md:h-95">
                <ProductCategoryCardImage
                  src={category.image}
                  alt={category.title}
                />
                <ProductCategoryCardOverlay />
                <ProductCategoryCardContent>
                  <ProductCategoryCardTitle>
                    {category.title}
                  </ProductCategoryCardTitle>
                  <ProductCategoryCardDescription>
                    {category.description}
                  </ProductCategoryCardDescription>
                </ProductCategoryCardContent>
              </ProductCategoryCard>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

const CATEGORIES = [
  {
    title: "Last Pieces",
    description: "Shop now before it's too late",
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/product-category/1.webp",
  },
  {
    title: "New Arrivals",
    description: "Discover the latest arrivals",
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/product-category/2.webp",
  },
  {
    title: "Accessories",
    description: "Hats, belts, stockings and more",
    image:
      "https://assets.shadcncraft.com/registry/pro-ecommerce/product-category/3.webp",
  },
]

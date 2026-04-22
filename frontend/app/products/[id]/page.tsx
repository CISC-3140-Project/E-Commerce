"use client"

import { use, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { getProductById, products } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params)
  const product = getProductById(id)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      })
    }
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </nav>

        {/* Product details */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {product.badge && (
              <Badge
                className={`absolute left-4 top-4 ${
                  product.badge === "Sale"
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {product.badge}
              </Badge>
            )}
          </div>

          {/* Info */}
          <div className="mt-8 lg:mt-0">
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              {product.category}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-accent text-accent"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-semibold">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && (
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  Save ${(product.originalPrice - product.price).toFixed(2)}
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="mt-6 leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Quantity and Add to Cart */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm font-medium">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-none"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
            </div>

            {/* Features */}
            <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders $50+</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Quality Guarantee</p>
                  <p className="text-xs text-muted-foreground">Premium materials</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 lg:mt-24">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent px-6 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent px-6 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Shipping
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-6 pb-3 pt-0 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Reviews
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-8">
              <div className="prose prose-neutral max-w-none">
                <h3 className="font-serif text-xl font-semibold">Product Details</h3>
                <p className="mt-4 text-muted-foreground">{product.description}</p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>Premium quality materials</li>
                  <li>Designed for comfort and durability</li>
                  <li>Safe for all pets</li>
                  <li>Easy to clean and maintain</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-8">
              <div className="prose prose-neutral max-w-none">
                <h3 className="font-serif text-xl font-semibold">Shipping Information</h3>
                <p className="mt-4 text-muted-foreground">
                  We offer free standard shipping on all orders over $50. Orders are
                  typically processed within 1-2 business days.
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li>Standard Shipping (5-7 business days): Free on orders $50+</li>
                  <li>Express Shipping (2-3 business days): $9.99</li>
                  <li>Next Day Delivery: $19.99</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-8">
              <div className="prose prose-neutral max-w-none">
                <h3 className="font-serif text-xl font-semibold">Customer Reviews</h3>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-6 w-6 ${
                          i < Math.floor(product.rating)
                            ? "fill-accent text-accent"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-medium">{product.rating} out of 5</span>
                </div>
                <p className="mt-2 text-muted-foreground">
                  Based on {product.reviews} reviews
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <h2 className="font-serif text-2xl font-semibold tracking-tight">
              You May Also Like
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

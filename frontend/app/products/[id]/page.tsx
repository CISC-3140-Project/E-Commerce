"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import { mapApiProduct, type ApiProduct, type Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"
import { API_BASE } from "@/lib/utils"

export default function ProductPage() {
  const { id = "" } = useParams()
  const { addItem } = useCart()

  const [product, setProduct]               = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading]               = useState(true)
  const [notFound, setNotFound]             = useState(false)
  const [quantity, setQuantity]             = useState(1)

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    setProduct(null)
    setRelatedProducts([])

    fetch(`${API_BASE}/products/${id}`)
      .then((res) => {
        if (res.status === 404) { setNotFound(true); setLoading(false); return null }
        if (!res.ok) throw new Error("Failed to fetch product")
        return res.json()
      })
      .then((data: ApiProduct | null) => {
        if (!data) return
        const p = mapApiProduct(data)
        setProduct(p)
        return fetch(`${API_BASE}/products?category=${p.category}`)
          .then((r) => r.json())
          .then((all: ApiProduct[]) => {
            setRelatedProducts(
              all.filter((ap) => String(ap.id) !== id).slice(0, 4).map(mapApiProduct)
            )
          })
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!product) return
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

  if (loading) {
    return (
      <div className="min-h-screen py-8 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="animate-pulse lg:grid lg:grid-cols-2 lg:gap-16">
            <div className="aspect-square rounded-lg bg-muted" />
            <div className="mt-8 space-y-4 lg:mt-0">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-10 w-28 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold">Product not found</h1>
        <Link to="/products" className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            to="/products"
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
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="h-full w-full bg-secondary" />
            )}
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
                disabled={!product.inStock}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
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

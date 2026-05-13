"use client"

import { useEffect, useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { mapApiProduct, type ApiProduct, type Product } from "@/lib/products"
import { API_BASE } from "@/lib/utils"

const CATEGORY_DEFS = [
  { name: "Food",        slug: "food"        },
  { name: "Toys",        slug: "toys"        },
  { name: "Accessories", slug: "accessories" },
  { name: "Beds",        slug: "beds"        },
  { name: "Grooming",    slug: "grooming"    },
]

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((r) => r.json())
      .then((data: ApiProduct[]) => setAllProducts(data.map(mapApiProduct)))
      .catch(console.error)
  }, [])

  const featuredProducts = useMemo(
    () => allProducts.filter((p) => p.featured).slice(0, 4),
    [allProducts]
  )

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of allProducts) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    }
    return CATEGORY_DEFS.map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }))
  }, [allProducts])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-xl">
              <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                Premium Pet Products
              </p>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                <span className="text-balance">Thoughtfully crafted for your companions</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Discover our curated collection of premium pet products, designed with love and made to last.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/products">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Shop Collection
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-square lg:aspect-[4/5]">
              <img
                src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80"
                alt="Happy dog with premium products"
                className="h-full w-full rounded-lg object-cover"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
              Shop by Category
            </h2>
            <p className="mt-3 text-muted-foreground">
              Everything your furry friend needs, all in one place
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products?category=${category.slug}`}
                className="group relative flex flex-col items-center justify-center rounded-lg border border-border bg-card p-8 text-center transition-all hover:border-primary hover:shadow-lg"
              >
                <h3 className="text-lg font-medium">{category.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {category.count > 0 ? `${category.count} products` : "Coming soon"}
                </p>
                <ArrowRight className="mt-4 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
                Featured Products
              </h2>
              <p className="mt-3 text-muted-foreground">
                Our most loved items, handpicked for you
              </p>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-2 text-sm font-medium transition-colors hover:text-primary sm:flex"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-lg bg-muted aspect-[3/4]" />
              ))}
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/products">
              <Button variant="outline">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">Made with Love</h3>
              <p className="mt-2 text-muted-foreground">
                Every product is crafted with care and designed with your pet&apos;s happiness in mind.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">Premium Quality</h3>
              <p className="mt-2 text-muted-foreground">
                We source only the finest materials to ensure durability and safety for your pets.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 className="mt-6 text-lg font-semibold">Free Shipping</h3>
              <p className="mt-2 text-muted-foreground">
                Enjoy free shipping on orders over $50. Fast delivery right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20 text-primary-foreground lg:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-8">
          <h2 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Ready to Spoil Your Pet?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join thousands of happy pet parents who trust Petopia for their furry family members.
          </p>
          <Link to="/products" className="mt-8 inline-block">
            <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              Start Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

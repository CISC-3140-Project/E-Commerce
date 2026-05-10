"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
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

const petTypes = [
  { id: "",    label: "All"  },
  { id: "dog", label: "Dogs" },
  { id: "cat", label: "Cats" },
]

const sortOptions = [
  { value: "featured",   label: "Featured"           },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating",     label: "Top Rated"          },
  { value: "newest",     label: "Newest"             },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const initialPet      = searchParams.get("pet")      || ""

  const [allProducts, setAllProducts]         = useState<Product[]>([])
  const [loading, setLoading]                 = useState(true)
  const [error, setError]                     = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedPet, setSelectedPet] = useState<string>(initialPet)
  const [sortBy, setSortBy]           = useState("featured")

  useEffect(() => {
    fetch(`${API_BASE}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products")
        return res.json()
      })
      .then((data: ApiProduct[]) => {
        setAllProducts(data.map(mapApiProduct))
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load products. Make sure the backend is running.")
        setLoading(false)
      })
  }, [])

  // Compute category counts from live data
  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of allProducts) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
    }
    return CATEGORY_DEFS
      .filter((c) => counts.has(c.slug))
      .map((c) => ({ ...c, count: counts.get(c.slug)! }))
  }, [allProducts])

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category))
    }

    if (selectedPet) {
      filtered = filtered.filter((p) => p.animals.includes(selectedPet))
    }

    switch (sortBy) {
      case "price-asc":  filtered.sort((a, b) => a.price - b.price); break
      case "price-desc": filtered.sort((a, b) => b.price - a.price); break
      case "rating":     filtered.sort((a, b) => b.rating - a.rating); break
      case "newest":     filtered.reverse(); break
      default:           filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [allProducts, selectedCategories, selectedPet, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPet("")
  }

  const hasFilters = selectedCategories.length > 0 || selectedPet !== ""

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Categories
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label key={category.slug} className="flex cursor-pointer items-center gap-3">
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm">{category.name}</span>
              <span className="ml-auto text-sm text-muted-foreground">({category.count})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pet type */}
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Pet Type
        </h3>
        <RadioGroup value={selectedPet} onValueChange={setSelectedPet} className="space-y-3">
          {petTypes.map((pet) => (
            <div key={pet.id} className="flex items-center gap-3">
              <RadioGroupItem value={pet.id} id={`pet-${pet.id || "all"}`} />
              <Label htmlFor={`pet-${pet.id || "all"}`} className="cursor-pointer text-sm font-normal">
                {pet.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            All Products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover our complete collection of premium pet products
          </p>
        </div>

        {error && <p className="mb-6 text-destructive">{error}</p>}

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedCategories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => toggleCategory(cat)}
              >
                {categories.find((c) => c.slug === cat)?.name ?? cat}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedPet && (
              <Badge
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => setSelectedPet("")}
              >
                {petTypes.find((p) => p.id === selectedPet)?.label}
                <X className="h-3 w-3" />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              Clear all
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredProducts.length} products`}
            </p>
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Main content */}
        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <FilterContent />
          </aside>

          {/* Product grid */}
          <div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-muted aspect-square" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters to find what you&apos;re looking for.
                </p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

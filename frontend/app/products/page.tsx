"use client"

import { useState, useMemo } from "react"
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
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/lib/products"

const petTypes = [
  { id: "dog", label: "Dogs" },
  { id: "cat", label: "Cats" },
  { id: "both", label: "All Pets" },
]

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const initialPet = searchParams.get("pet") || ""

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  )
  const [selectedPets, setSelectedPets] = useState<string[]>(
    initialPet ? [initialPet] : []
  )
  const [sortBy, setSortBy] = useState("featured")

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category))
    }

    // Filter by pet type
    if (selectedPets.length > 0) {
      filtered = filtered.filter(
        (p) => selectedPets.includes(p.petType) || p.petType === "both"
      )
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        filtered.reverse()
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [selectedCategories, selectedPets, sortBy])

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const togglePet = (pet: string) => {
    setSelectedPets((prev) =>
      prev.includes(pet) ? prev.filter((p) => p !== pet) : [...prev, pet]
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedPets([])
  }

  const hasFilters = selectedCategories.length > 0 || selectedPets.length > 0

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Categories
        </h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <label
              key={category.slug}
              className="flex cursor-pointer items-center gap-3"
            >
              <Checkbox
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={() => toggleCategory(category.slug)}
              />
              <span className="text-sm">{category.name}</span>
              <span className="ml-auto text-sm text-muted-foreground">
                ({category.count})
              </span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Pet Type
        </h3>
        <div className="space-y-3">
          {petTypes.map((pet) => (
            <label
              key={pet.id}
              className="flex cursor-pointer items-center gap-3"
            >
              <Checkbox
                checked={selectedPets.includes(pet.id)}
                onCheckedChange={() => togglePet(pet.id)}
              />
              <span className="text-sm">{pet.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            All Products
          </h1>
          <p className="mt-2 text-muted-foreground">
            Discover our complete collection of premium pet products
          </p>
        </div>

        {/* Active filters */}
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
                {categories.find((c) => c.slug === cat)?.name}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {selectedPets.map((pet) => (
              <Badge
                key={pet}
                variant="secondary"
                className="cursor-pointer gap-1"
                onClick={() => togglePet(pet)}
              >
                {petTypes.find((p) => p.id === pet)?.label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-4">
            {/* Mobile filter button */}
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
              {filteredProducts.length} products
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
            {filteredProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-lg font-medium">No products found</p>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
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

"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"
import { useCart } from "@/lib/cart-context"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    })
  }

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {product.badge && (
          <Badge 
            className={`absolute left-3 top-3 ${
              product.badge === "Sale" 
                ? "bg-accent text-accent-foreground" 
                : "bg-primary text-primary-foreground"
            }`}
          >
            {product.badge}
          </Badge>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-background/95 p-3 backdrop-blur transition-transform duration-300 group-hover:translate-y-0">
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Add to Cart
          </Button>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        <h3 className="font-medium text-foreground group-hover:underline">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <span className="text-sm text-muted-foreground">{product.rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

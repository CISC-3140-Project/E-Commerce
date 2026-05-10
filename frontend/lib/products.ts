// Raw shape returned by the Express API — matches schema.sql exactly
export interface ApiProduct {
  id: number
  name: string
  description: string | null
  price: string
  stock: number
  image: string | null
  category: string
  pet_type: string | null
  rating: string | null
  reviews: number | null
  in_stock: boolean
  featured: boolean
  badge: string | null
}

export function mapApiProduct(p: ApiProduct): Product {
  // Convert pet_type column to animals array used by the UI
  let animals: string[] = []
  if (p.pet_type === "dog") animals = ["dog"]
  else if (p.pet_type === "cat") animals = ["cat"]
  else if (p.pet_type === "both") animals = ["dog", "cat"]

  return {
    id: String(p.id),
    name: p.name,
    description: p.description ?? "",
    price: parseFloat(p.price),
    image: p.image ?? "",
    category: p.category as Product["category"],
    animals,
    rating: p.rating ? parseFloat(p.rating) : 0,
    reviews: p.reviews ?? 0,
    inStock: p.in_stock,
    featured: p.featured,
    badge: p.badge ?? undefined,
  }
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  image: string
  category: "food" | "toys" | "accessories" | "beds" | "grooming"
  animals: string[]
  rating: number
  reviews: number
  inStock: boolean
  featured?: boolean
  badge?: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Organic Salmon Bites",
    description: "Premium wild-caught salmon treats, grain-free and packed with omega-3 fatty acids for a healthy coat.",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&q=80",
    category: "food",
    animals: ["dog"],
    rating: 4.9,
    reviews: 342,
    inStock: true,
    featured: true,
    badge: "Bestseller"
  },
  {
    id: "2",
    name: "Cozy Cloud Bed",
    description: "Ultra-soft memory foam pet bed with removable, machine-washable cover. Perfect for dogs of all sizes.",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=600&q=80",
    category: "beds",
    animals: ["dog", "cat"],
    rating: 4.8,
    reviews: 128,
    inStock: true,
    featured: true,
    badge: "Sale"
  },
  {
    id: "3",
    name: "Interactive Puzzle Feeder",
    description: "Stimulate your pet's mind with this engaging puzzle toy. Adjustable difficulty levels for endless fun.",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=600&q=80",
    category: "toys",
    animals: ["dog"],
    rating: 4.7,
    reviews: 89,
    inStock: true,
    featured: true
  },
  {
    id: "4",
    name: "Premium Leather Collar",
    description: "Handcrafted genuine leather collar with brass hardware. Durable, stylish, and comfortable.",
    price: 45.99,
    image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&q=80",
    category: "accessories",
    animals: ["dog"],
    rating: 4.9,
    reviews: 256,
    inStock: true,
    featured: true
  },
  {
    id: "5",
    name: "Natural Cat Grass Kit",
    description: "Organic wheatgrass growing kit for cats. Aids digestion and provides essential nutrients.",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80",
    category: "food",
    animals: ["cat"],
    rating: 4.6,
    reviews: 178,
    inStock: true
  },
  {
    id: "6",
    name: "Feather Wand Toy Set",
    description: "Interactive feather wand with multiple attachments. Hours of exercise and bonding with your cat.",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&q=80",
    category: "toys",
    animals: ["cat"],
    rating: 4.8,
    reviews: 312,
    inStock: true,
    badge: "Popular"
  },
  {
    id: "7",
    name: "Spa Day Grooming Set",
    description: "Complete grooming kit with natural shampoo, conditioner, brush, and nail clippers.",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
    category: "grooming",
    animals: ["dog", "cat"],
    rating: 4.7,
    reviews: 95,
    inStock: true
  },
  {
    id: "8",
    name: "Elevated Food Bowl Set",
    description: "Bamboo stand with stainless steel bowls. Promotes better posture and digestion.",
    price: 39.99,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80",
    category: "accessories",
    animals: ["dog", "cat"],
    rating: 4.8,
    reviews: 167,
    inStock: true
  },
  {
    id: "9",
    name: "Rope Tug & Fetch Bundle",
    description: "Durable rope toys bundle for interactive play. Perfect for fetch and tug-of-war.",
    price: 29.99,
    image: "https://images.unsplash.com/photo-1546421845-6471bdcf3edf?w=600&q=80",
    category: "toys",
    animals: ["dog"],
    rating: 4.6,
    reviews: 203,
    inStock: true
  },
  {
    id: "10",
    name: "Calming Anxiety Wrap",
    description: "Gentle pressure wrap that helps reduce anxiety during storms, fireworks, or travel.",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
    category: "accessories",
    animals: ["dog"],
    rating: 4.5,
    reviews: 134,
    inStock: true
  },
  {
    id: "11",
    name: "Luxury Cat Tower",
    description: "Multi-level cat tree with sisal scratching posts, cozy hideaways, and plush platforms.",
    price: 149.99,
    originalPrice: 199.99,
    image: "https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&q=80",
    category: "accessories",
    animals: ["cat"],
    rating: 4.9,
    reviews: 87,
    inStock: true,
    badge: "Sale"
  },
  {
    id: "12",
    name: "Grain-Free Chicken Feast",
    description: "Premium grain-free dry food made with real chicken. No artificial preservatives or fillers.",
    price: 64.99,
    image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600&q=80",
    category: "food",
    animals: ["dog"],
    rating: 4.8,
    reviews: 421,
    inStock: true
  }
]

export const categories = [
  { name: "Food", slug: "food", count: products.filter(p => p.category === "food").length },
  { name: "Toys", slug: "toys", count: products.filter(p => p.category === "toys").length },
  { name: "Accessories", slug: "accessories", count: products.filter(p => p.category === "accessories").length },
  { name: "Beds", slug: "beds", count: products.filter(p => p.category === "beds").length },
  { name: "Grooming", slug: "grooming", count: products.filter(p => p.category === "grooming").length },
]

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
  )
}

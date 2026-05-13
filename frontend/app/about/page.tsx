"use client"

import { Link } from "react-router-dom"
import { Heart, ShieldCheck, Truck } from "lucide-react"

const highlights = [
  {
    title: "Built for Pet Parents",
    description:
      "Petopia helps you quickly find trusted essentials for dogs and cats, from daily food to comfort and play.",
    Icon: Heart,
  },
  {
    title: "Reliable Shopping Experience",
    description:
      "Create an account, save your preferences, and track your purchases from checkout through order history.",
    Icon: Truck,
  },
  {
    title: "Quality and Safety First",
    description:
      "Every listing is focused on quality, durability, and pet-safe materials so you can shop with confidence.",
    Icon: ShieldCheck,
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-5xl px-4 py-14 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          About Petopia
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Petopia is a modern pet e-commerce app designed to make shopping simple:
          browse products, checkout securely, and review all your past orders in one place.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {highlights.map(({ title, description, Icon }) => (
            <article key={title} className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">What You Can Do Here</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Explore products by category and pet type.</li>
            <li>Add items to cart and checkout with Stripe.</li>
            <li>View order history and detailed order line items.</li>
            <li>Manage account information from your profile.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-medium">
            <Link to="/products" className="hover:text-accent">
              Start shopping →
            </Link>
            <Link to="/account?section=orders" className="hover:text-accent">
              View your orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

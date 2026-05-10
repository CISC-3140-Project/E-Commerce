"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Package } from "lucide-react"
import { API_BASE, formatDate } from "@/lib/utils"
import { useRequireAuth } from "@/lib/use-require-auth"
import { OrderStatusBadge } from "@/components/order-status-badge"

type OrderItem = {
  name: string
  quantity: number
  price: string
}

type Order = {
  id: number
  status: string
  created_at: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const token = useRequireAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return
    fetch(`${API_BASE}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setOrders(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load orders. Make sure the backend is running.")
        setLoading(false)
      })
  }, [token])

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
          Your Orders
        </h1>
        <p className="mt-2 text-muted-foreground">
          A history of everything you&apos;ve ordered from Petopia
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {loading && <p className="text-muted-foreground">Loading your orders...</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">No orders yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                When you place an order it will show up here.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
              >
                Start shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!loading && !error && orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                  <ul className="mt-2 flex flex-col gap-1">
                    {order.items.map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.name}
                        <span className="text-muted-foreground"> × {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <OrderStatusBadge status={order.status} />
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:text-accent"
                  >
                    View details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

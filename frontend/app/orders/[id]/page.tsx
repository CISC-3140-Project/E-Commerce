"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
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
  total_price: string
  created_at: string
  items: OrderItem[]
}

export default function OrderDetailPage() {
  const token = useRequireAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { id: orderId } = useParams()

  useEffect(() => {
    if (!token || !orderId) return
    fetch(`${API_BASE}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setOrder(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Could not load this order. Make sure the backend is running.")
        setLoading(false)
      })
  }, [token, orderId])

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Link>

        <h1 className="mt-8 font-serif text-3xl font-semibold tracking-tight">
          Order Details
        </h1>

        {loading && <p className="mt-6 text-muted-foreground">Loading...</p>}
        {error && <p className="mt-6 text-destructive">{error}</p>}

        {!loading && !error && order && (
          <div className="mt-8 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground">
                Placed on {formatDate(order.created_at)}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Items
              </h2>
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span>
                    {item.name}
                    <span className="ml-2 text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-6 font-medium">
              <span>Total</span>
              <span>${parseFloat(order.total_price).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import Link from "next/link"
import { User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OrderStatusBadge } from "@/components/order-status-badge"
import { useRequireAuth } from "@/lib/use-require-auth"
import { API_BASE, formatDate } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type UserProfile = {
  id: number
  name: string
  email: string
  created_at: string
}

type OrderItem = { name: string; quantity: number; price: string }
type Order = { id: number; status: string; created_at: string; items: OrderItem[] }

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const navItems = [
  { key: "profile", label: "Profile", Icon: User    },
  { key: "orders",  label: "Orders",  Icon: Package },
]

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection({ token }: { token: string }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const [newEmail, setNewEmail]           = useState("")
  const [emailPassword, setEmailPassword] = useState("")
  const [emailMsg, setEmailMsg]           = useState("")
  const [emailError, setEmailError]       = useState("")
  const [emailLoading, setEmailLoading]   = useState(false)

  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw]         = useState("")
  const [pwMsg, setPwMsg]         = useState("")
  const [pwError, setPwError]     = useState("")
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/account/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { if (!data.error) setProfile(data) })
  }, [token])

  async function handleEmailChange(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(""); setEmailMsg(""); setEmailLoading(true)
    try {
      const res = await fetch(`${API_BASE}/account/email`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail, currentPassword: emailPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setEmailError(data.error)
      } else {
        setEmailMsg("Email updated successfully")
        setProfile((p) => p ? { ...p, email: newEmail } : p)
        setNewEmail(""); setEmailPassword("")
        const stored = localStorage.getItem("petopia_user")
        if (stored) localStorage.setItem("petopia_user", JSON.stringify({ ...JSON.parse(stored), email: newEmail }))
      }
    } catch { setEmailError("Something went wrong") }
    setEmailLoading(false)
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPwError(""); setPwMsg(""); setPwLoading(true)
    try {
      const res = await fetch(`${API_BASE}/account/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwError(data.error)
      } else {
        setPwMsg("Password updated successfully")
        setCurrentPw(""); setNewPw("")
      }
    } catch { setPwError("Something went wrong") }
    setPwLoading(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Account info */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold">Account Information</h2>
        {profile ? (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</dt>
              <dd className="mt-1 text-sm">{profile.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</dt>
              <dd className="mt-1 text-sm">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Member Since</dt>
              <dd className="mt-1 text-sm">{formatDate(profile.created_at)}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        )}
      </div>

      {/* Change email */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold">Change Email</h2>
        <form onSubmit={handleEmailChange} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input id="new-email" type="email" required placeholder="new@example.com"
              value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email-pw">Current Password</Label>
            <Input id="email-pw" type="password" required placeholder="••••••••"
              value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} />
          </div>
          {emailError && <p className="text-sm text-destructive">{emailError}</p>}
          {emailMsg   && <p className="text-sm text-green-600">{emailMsg}</p>}
          <Button type="submit" disabled={emailLoading} className="self-start">
            {emailLoading ? "Updating..." : "Update Email"}
          </Button>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-serif text-xl font-semibold">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="mt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input id="current-pw" type="password" required placeholder="••••••••"
              value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="new-pw">New Password</Label>
            <Input id="new-pw" type="password" required minLength={8} placeholder="Minimum 8 characters"
              value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </div>
          {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          {pwMsg   && <p className="text-sm text-green-600">{pwMsg}</p>}
          <Button type="submit" disabled={pwLoading} className="self-start">
            {pwLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── Orders section ───────────────────────────────────────────────────────────

function OrdersSection({ token }: { token: string }) {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState("")

  useEffect(() => {
    fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error)
        else setOrders(data)
        setLoading(false)
      })
      .catch(() => { setError("Could not load orders."); setLoading(false) })
  }, [token])

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-serif text-xl font-semibold">Order History</h2>

      {loading && <p className="text-muted-foreground">Loading your orders...</p>}
      {error   && <p className="text-destructive">{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">No orders yet</p>
          <Link href="/products" className="mt-2 inline-block text-sm font-medium hover:text-accent">
            Start shopping →
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
              <Link href={`/orders/${order.id}`} className="text-xs font-medium hover:text-accent">
                View details →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const token = useRequireAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const section = searchParams.get("section") ?? "profile"

  const stored = typeof window !== "undefined" ? localStorage.getItem("petopia_user") : null
  const user   = stored ? JSON.parse(stored) : null
  const firstName = user?.name?.split(" ")[0] ?? "Account"

  function setSection(key: string) {
    setSearchParams({ section: key })
  }

  return (
    <div className="min-h-screen bg-secondary">
      <div className="mx-auto max-w-5xl px-4 py-12 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Hi, {firstName}
        </h1>

        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:gap-10">
          {/* Sidebar — mobile: horizontal pills, desktop: vertical nav */}
          <aside className="shrink-0 lg:w-44">
            <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    section === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <nav className="hidden lg:flex lg:flex-col lg:gap-1">
              {navItems.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setSection(key)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left w-full transition-colors ${
                    section === key
                      ? "bg-card text-foreground shadow-sm border-l-2 border-accent"
                      : "text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {token && section === "profile" && <ProfileSection token={token} />}
            {token && section === "orders"  && <OrdersSection  token={token} />}
          </div>
        </div>
      </div>
    </div>
  )
}

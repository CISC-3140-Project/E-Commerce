"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ShoppingBag, Search, Menu, X, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/lib/cart-context"

const navigation = [
  { name: "Shop", href: "/products" },
  { name: "About", href: "/about" },
]

type StoredUser = { name: string; email: string; id: number }

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)
  const { totalItems } = useCart()

  useEffect(() => {
    const stored = localStorage.getItem("petopia_user")
    if (stored) setUser(JSON.parse(stored))
  }, [])

  function handleSignOut() {
    localStorage.removeItem("petopia_token")
    localStorage.removeItem("petopia_user")
    setUser(null)
    window.location.href = "/"
  }

  const firstName = user?.name?.split(" ")[0] ?? ""

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto grid max-w-7xl grid-cols-3 items-center px-4 py-4 lg:px-8">
        {/* Logo — far left */}
        <div className="flex items-center">
          {/* Mobile menu */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-m-2.5">
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs">
                <div className="flex flex-col gap-6 py-6">
                  <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">
                    Petopia
                  </Link>
                  <div className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <Link href="/" className="hidden lg:block">
            <span className="font-serif text-2xl font-semibold tracking-tight lg:text-3xl">
              Petopia
            </span>
          </Link>
          {/* Mobile logo centered via grid */}
          <Link href="/" className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <span className="font-serif text-2xl font-semibold tracking-tight">
              Petopia
            </span>
          </Link>
        </div>

        {/* Desktop navigation — centered */}
        <div className="hidden lg:flex lg:justify-center lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium uppercase tracking-wider text-foreground/70 transition-colors hover:text-foreground"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Empty middle column on mobile */}
        <div className="lg:hidden" />

        {/* Right side actions */}
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden lg:flex"
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden lg:flex">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <span className="font-medium">Hi, {firstName}</span>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account?section=profile" className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account?section=orders" className="cursor-pointer">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer">Sign In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
          </Link>
        </div>
      </nav>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="border-t border-border bg-background px-4 py-4 lg:px-8">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for products..."
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}

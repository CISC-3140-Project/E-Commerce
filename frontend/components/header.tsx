import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCart } from "@/lib/cart-context";

const navigation = [
  { name: "Shop", href: "/products" },
  { name: "About", href: "/about" },
];

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      {/* The 'flex' instead of 'grid' here is better for Safari. 
        'max-w-full' and 'overflow-hidden' ensure nothing slides off-screen.
      */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8 overflow-hidden">
        {/* 1. Left Section (Logo & Mobile Menu) */}
        <div className="flex flex-1 items-center">
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <div className="flex flex-col gap-6 py-6">
                  <Link to ="/" className="font-serif text-2xl font-semibold">
                    Petopia
                  </Link>
                  <div className="flex flex-col gap-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-lg font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="shrink-0">
            <span className="font-serif text-2xl font-semibold tracking-tight lg:text-3xl">
              Petopia
            </span>
          </Link>
        </div>

        {/* 2. Middle Section (Desktop Links) */}
        <div className="hidden lg:flex lg:gap-x-8 flex-initial">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* 3. Right Section (Icons) */}
        <div className="flex flex-1 items-center justify-end gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hidden lg:flex"
          >
            <Search className="h-5 w-5" />
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
                    <Link to="/account?section=profile" className="cursor-pointer">My Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/account?section=orders" className="cursor-pointer">My Orders</Link>
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
                  <Link to="/login" className="cursor-pointer">Sign In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="border-t bg-background px-4 py-4 lg:px-8">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent text-lg outline-none"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
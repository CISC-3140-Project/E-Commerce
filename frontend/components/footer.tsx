import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const footerLinks = {
  shop: [
    { name: "All Products", href: "/products" },
    { name: "Dogs", href: "/products?pet=dog" },
    { name: "Cats", href: "/products?pet=cat" },
    { name: "Sale", href: "/products?sale=true" },
  ],
  support: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs", href: "/faq" },
    { name: "Shipping", href: "/shipping" },
    { name: "Returns", href: "/returns" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Our Story", href: "/story" },
    { name: "Sustainability", href: "/sustainability" },
    { name: "Careers", href: "/careers" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Newsletter section */}
          <div className="max-w-md">
            <h3 className="font-serif text-2xl font-semibold">
              Join Our Pack
            </h3>
            <p className="mt-3 text-muted-foreground">
              Subscribe to receive exclusive offers, pet care tips, and updates on new arrivals.
            </p>
            <form className="mt-6 flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-background"
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Subscribe
              </Button>
            </form>
          </div>

          {/* Links section */}
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Shop</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Support</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold uppercase tracking-wider">Company</h4>
              <ul className="mt-4 space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 lg:flex-row">
          <Link href="/" className="font-serif text-xl font-semibold">
            Petopia
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Petopia. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

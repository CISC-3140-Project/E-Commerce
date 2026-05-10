"use client";

const Image = (props: any) => <img {...props} />;
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/cart-context";
import CheckoutButton from "../../src/components/checkoutButton";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart } =
    useCart();

  const shipping = totalPrice >= 50 ? 0 : 9.99;
  const tax = totalPrice * 0.08;
  const total = totalPrice + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="mt-6 font-serif text-2xl font-semibold">
              Your cart is empty
            </h1>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products" className="mt-8 inline-block">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Start Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Shopping Cart
          </h1>
          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-muted-foreground hover:text-destructive"
          >
            Clear Cart
          </Button>
        </div>

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-12">
          {/* Cart items */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 py-6">
                  {/* Image */}
                  <Link
                    to={`/products/${item.id}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          {item.category}
                        </p>
                        <Link
                          to={`/products/${item.id}`}
                          className="mt-1 font-medium hover:underline"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <p className="font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      {/* Quantity */}
                      <div className="flex items-center rounded-lg border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Remove */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-8 lg:col-span-5 lg:mt-0">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-accent">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
              {shipping > 0 && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Add ${(50 - totalPrice).toFixed(2)} more for free shipping
                </p>
              )}
              <div className="mt-6">
                <CheckoutButton items={items} />
              </div>{" "}
              
              {/* Promo code */}
              <div className="mt-6">
                <p className="text-sm font-medium">Have a promo code?</p>
                <div className="mt-2 flex gap-2">
                  <Input placeholder="Enter code" className="flex-1" />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>
            </div>

            {/* Continue shopping */}
            <Link
              to="/products"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

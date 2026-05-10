"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { loadStripe } from "@stripe/stripe-js"

const stripePromise = loadStripe('pk_test_51TVGgrB0aHIC1xqc7WbNlDCjXzlnmNO1y76RWiYyWXHGWgiVZkSpO1JVXDqEYYipxVA4DZatn9l6ehjLbhA81rJr00n4w9pg6j');

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  category: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  checkout: () => Promise<void> // Added checkout function
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  // --- STRIPE CHECKOUT LOGIC ---
  const checkout = async () => {
    try {
      const stripe = await stripePromise;
      
      const response = await fetch('http://localhost:5001/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }), 
      });

      const session = await response.json();

      if (session.error) throw new Error(session.error);

      if (stripe) {
        // We use 'as any' to bypass the TypeScript error you encountered
        const { error } = await (stripe as any).redirectToCheckout({
          sessionId: session.id,
        });
        if (error) console.error("Stripe error:", error);
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Payment system is currently unavailable. Please check your backend connection.");
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
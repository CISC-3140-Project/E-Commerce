import { Route, Routes, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { CartProvider } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "@/app/globals.css"

import HomePage from "@/app/page"
import ProductsPage from "@/app/products/page"
import CartPage from "@/app/cart/page"
import SuccessPage from "./routes/Success"
import { ProductPageRoute } from "./routes/ProductPageRoute"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function App() {
  return (
    <CartProvider>
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background">
        <ScrollToTop />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductPageRoute />} />
            <Route path="/cart" element={<CartPage />} />
            
            {/* ADDED SUCCESS ROUTE */}
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </CartProvider>
  )
}
import { Route, Routes, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { CartProvider } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "@/app/globals.css"

import HomePage from "@/app/page"
import ProductsPage from "@/app/products/page"
import CartPage from "@/app/cart/page"
import LoginPage from "@/app/login/page"
import AccountPage from "@/app/account/page"
import { ProductPageRoute } from "./routes/ProductPageRoute"
import { OrderDetailRoute } from "./routes/OrderDetailRoute"

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
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPageRoute />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders/:id" element={<OrderDetailRoute />} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  )
}


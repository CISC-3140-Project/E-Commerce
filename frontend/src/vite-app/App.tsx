import { Route, Routes } from "react-router-dom"
import { CartProvider } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import "@/app/globals.css"

import HomePage from "@/app/page"
import ProductsPage from "@/app/products/page"
import CartPage from "@/app/cart/page"
import { ProductPageRoute } from "./routes/ProductPageRoute"

export function App() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductPageRoute />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>
      <Footer />
    </CartProvider>
  )
}


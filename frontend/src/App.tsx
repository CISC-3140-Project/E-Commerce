/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
*/

import { useEffect, useState } from "react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { CartProvider } from "../lib/cart-context";
import "./globals.css"; // Ensure you use globals.css for Tailwind/Safari fixes

type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string | null;
  category: string;
};

export function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Using localhost instead of 127.0.0.1 for better browser compatibility
    fetch("http://localhost:5001/api/products")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Could not load products. Please check if the backend is running.");
        setLoading(false);
      });
  }, []);

  const handleCheckout = async (product: Product) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [
              {
                name: product.name,
                price: parseFloat(product.price),
                quantity: 1,
              },
            ],
          }),
        }
      );

      const data = await response.json();

      // If backend returns a URL, redirect directly (Safari/Chrome friendly)
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: " + (data.error || "Failed to create session"));
      }
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("The backend server is not responding.");
    }
  };

  return (
    <CartProvider>
      {/* The 'overflow-x-hidden' on this wrapper is the magic fix 
        for the Safari "off-screen" horizontal scroll bug.
      */}
      <div className="flex flex-col min-h-screen overflow-x-hidden bg-background font-sans antialiased">
        <Header />

        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif font-bold mb-8 text-center lg:text-left">
            Our Premium Collection
          </h1>

          {loading && <p className="text-center">Loading products...</p>}
          {error && <p className="text-red-500 text-center bg-red-50 p-4 rounded">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground">
                  No products available right now.
                </p>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Product Image Placeholder */}
                    <div className="aspect-square overflow-hidden bg-muted">
                       <img 
                        src={product.image_url || "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?q=80&w=800"} 
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                       />
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-2">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          {product.category}
                        </span>
                        <h2 className="text-lg font-bold text-foreground">
                          {product.name}
                        </h2>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {product.description}
                      </p>

                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-xl font-bold">${product.price}</span>
                        <button
                          onClick={() => handleCheckout(product)}
                          className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}

export default App;
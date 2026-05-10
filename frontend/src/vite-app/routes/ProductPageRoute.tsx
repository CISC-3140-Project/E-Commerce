import { useMemo } from "react"
import { useParams } from "react-router-dom"
import ProductPage from "@/app/products/[id]/page"
import CheckoutButton from "../../components/checkoutButton" // Path adjusted to your screenshot

export function ProductPageRoute() {
  const { id } = useParams()

  const params = useMemo(() => Promise.resolve({ id: id ?? "" }), [id])

  // Logic to define what the user is buying based on the ID
  const cartItems = [
    { 
      name: `Product ID: ${id}`, 
      price: 25.00, // You can change this to a dynamic price later
      quantity: 1 
    }
  ];

  return (
    <div className="product-route-container">
      {/* Your original product display */}
      <ProductPage params={params} />
      
      {/* The Stripe Bridge */}
      <div className="max-w-4xl mx-auto p-6 border-t mt-8">
        <h3 className="text-xl font-semibold mb-4">Ready to purchase?</h3>
        <CheckoutButton items={cartItems} />
      </div>
    </div>
  )
}
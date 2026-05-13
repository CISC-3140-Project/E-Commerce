import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Added a nice icon for you
import { API_BASE } from "@/lib/utils";

const Success = () => {
  const [searchParams] = useSearchParams();
  const [statusMessage, setStatusMessage] = useState("Your order has been placed and is being processed.");
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const token = localStorage.getItem("petopia_token");

    if (!sessionId || !token) return;

    fetch(`${API_BASE}/stripe/confirm-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not confirm payment.");
        }
        setStatusMessage("Payment confirmed. Your processed order is now in order history.");
      })
      .catch((err) => {
        setError(err.message || "Could not confirm your order.");
      });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-8">{statusMessage}</p>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <Link
        to="/orders"
        className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
      >
        View Order History
      </Link>
    </div>
  );
};

// This is the line you were missing:
export default Success;

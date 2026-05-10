import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react"; // Added a nice icon for you

const Success = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        Payment Successful!
      </h1>
      <p className="text-gray-600 mb-8">
        Your order has been placed and is being processed.
      </p>
      <Link
        to="/"
        className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
};

// This is the line you were missing:
export default Success;

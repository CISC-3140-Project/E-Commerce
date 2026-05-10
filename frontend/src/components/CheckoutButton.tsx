import React from 'react';

interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutButtonProps {
  items: CartItem[];
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ items }) => {
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    console.log("Sending items to backend:", items);

    try {
      const response = await fetch('http://localhost:5001/api/create-checkout-session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server Error Detail:", errorData);
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout error: The server didn't return a checkout URL.");
      }
    } catch (err) {
      console.error("Checkout Connection Error:", err);
      alert("Backend is not responding. Please ensure your server is running on port 5001.");
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      className="w-full"
      style={{
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#4f46e5')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6366f1')}
    >
      Proceed to Checkout
    </button>
  );
};

export default CheckoutButton;
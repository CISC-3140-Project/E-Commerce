import React, { useState } from 'react';
import '../Cart.css';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  img: string;
}

const Cart: React.FC = () => {
  // Mock data representing your items
  const [items, setItems] = useState<CartItem[]>([
    { 
      id: 1, 
      name: 'Premium Dog Food', 
      price: 45.00, 
      quantity: 1, 
      img: '/pet-food.png' 
    },
    { 
      id: 3, 
      name: 'Orthopedic Pet Bed', 
      price: 85.00, 
      quantity: 1, 
      img: '/pet-bed.png' 
    },
  ]);

  // Logic: If quantity + delta < 1, remove the item entirely
  const updateQuantity = (id: number, delta: number) => {
    setItems(prevItems => {
      const updated = prevItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + delta };
        }
        return item;
      });
      // Filter out items that have dropped to 0 or less
      return updated.filter(item => item.quantity > 0);
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length > 0 ? 10.00 : 0;
  const total = subtotal + shipping;

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Shopping Cart</h1>

      <div className="cart-layout">
        <div className="cart-items-section">
          {items.length > 0 ? (
            items.map(item => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-img-box">
                  <img src={item.img} alt={item.name} />
                </div>

                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">${item.price.toFixed(2)}</p>
                </div>

                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>

                <button 
                  className="remove-btn" 
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <div className="empty-cart-msg">
              <p>Your cart is empty.</p>
            </div>
          )}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button 
            className="checkout-btn" 
            disabled={items.length === 0}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
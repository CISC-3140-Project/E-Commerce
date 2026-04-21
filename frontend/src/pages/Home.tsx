import React from 'react';
import './Home.css';

interface Category {
  id: number;
  name: string;
  img: string;
  price: string;
}

const Home: React.FC = () => {
  const categories: Category[] = [
    { 
      id: 1, 
      name: 'Foods', 
      img: '/pet-food.png', 
      price: 'From $15' 
    },
    { 
      id: 2, 
      name: 'Toys', 
      img: '/pet-toy.png', 
      price: 'From $5' 
    },
    { 
      id: 3, 
      name: 'Beds', 
      img: '/pet-bed.png', 
      price: 'From $40' 
    },
    { 
      id: 4, 
      name: 'Collars & Leashes', 
      img: '/collar-and-lease.png', 
      price: 'From $10' 
    },
  ];

  return (
    <main className="container">
      <h2 className="section-title">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat: Category) => (
          <div key={cat.id} className="category-card">
            {/* This container is what traps the large images */}
            <div className="card-img-container">
               <img src={cat.img} alt={cat.name} className="category-img" />
            </div>
            
            <div className="card-content">
              <h3>{cat.name}</h3>
              <p>{cat.price}</p>
              <button className="view-btn">View Product</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
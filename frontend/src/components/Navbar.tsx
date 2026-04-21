import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, ShoppingCart, User } from 'lucide-react'; 
import '../Navbar.css';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* 1. Logo on the far left */}
        <Link to="/" className="logo">
          Petopia
        </Link>

        <div className="nav-actions">
          {/* 2. Account Link */}
          <Link to="/profile" className="nav-icon-link">
            <User size={22} />
          </Link>

          {/* 3. Cart Link */}
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={24} />
            <span className="cart-count">2</span>
          </Link>

          {/* 4. Theme Toggle moved to the far right */}
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
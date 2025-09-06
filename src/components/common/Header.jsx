import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/authContext';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header style={{ 
      padding: '1rem 2rem', 
      borderBottom: '1px solid #ddd',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none' }}>
          E-Commerce
        </Link>
      </div>
      
      <nav>
        <Link to="/products" style={{ marginRight: '1rem' }}>Products</Link>
        {isAuthenticated && (
          <Link to="/cart" style={{ marginRight: '1rem' }}>Cart</Link>
        )}
      </nav>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Welcome, {user?.username}!</span>
            <Link to="/user">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <div>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./store/authContext";
import "./App.css";

// Import pages (we'll create these next)
// import Home from './pages/Home';
import Login from "./pages/Login";
// import Register from './pages/Register';
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
// import UserCenter from './pages/UserCenter';

// Import components (we'll create these next)
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";
import { CartProvider } from "./store/cartContext";

function App() {
  return (
        <AuthProvider>
    <CartProvider>
        <BrowserRouter>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/login" element={<Login />} />
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                {/* <Route path="/user" element={<UserCenter />} /> */}
              </Routes>
            </main>
            {/* <Footer /> */}
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

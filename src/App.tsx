// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "./store/authContext";
import { setNavigate } from "./services/api";
import "./App.css";

import { Toaster } from "@/components/ui/sonner";

// Import pages (we'll create these next)
// import Home from './pages/Home';
import Login from "./pages/Login";
// import Register from './pages/Register';
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";
// import UserCenter from './pages/UserCenter';

// Import components (we'll create these next)
import Header from "./components/common/Header";
// import Footer from "./components/common/Footer";
import { CartProvider } from "./store/cartContext";

function AppContent() {
  // Store a component to api.js
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} /> */}
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          {/* <Route path="/user" element={<UserCenter />} /> */}
        </Routes>
      </main>
      <Toaster />
      {/* <Footer /> */}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

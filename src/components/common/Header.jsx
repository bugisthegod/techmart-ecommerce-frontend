import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge"; // Shadcn Badge is a label usually, maybe use a custom badge or just style it
import { Button } from "@/components/ui/button";
import { ShoppingCart, User, LogOut } from "lucide-react";
import { useAuth } from "../../store/authContext";
import { useCart } from "../../store/cartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const { totalItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/80 backdrop-blur-md dark:bg-black/80 dark:border-white/10">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link to="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
          TechMart
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/products" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Products
          </Link>
          {isAuthenticated && (
            <Link to="/orders" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Orders
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <Link to="/cart" className="relative group">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Replaced Profile link/logout with a cleaner dropdown or just actions */}
              <Button variant="ghost" size="sm" onClick={() => navigate('/user')} className="hidden sm:flex">
                Profile
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/login"> {/* Using login for register flow too usually, or create separate register route if needed */}
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/store/authContext";
import { Loader2 } from "lucide-react";
import { logger } from "@/lib/logger";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Wait a tick for session restoration to complete
    const timer = setTimeout(() => {
      const token = localStorage.getItem("jwt_token");

      if (!isLoading && !isAuthenticated && !token) {
        logger.warn("🔒 Authentication check: No token or user data found - redirecting to login");
        navigate("/login", { replace: true });
      } else if (!isLoading && !isAuthenticated && token) {
        // Token exists but user is not authenticated (session restoration failed)
        logger.warn("🔒 Authentication check: Invalid or expired token - redirecting to login");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
      }

      setIsCheckingAuth(false);
    }, 100); // Small delay to allow session restoration

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show loading state while auth is being checked
  if (isLoading || isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If authenticated, render the protected content
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // While redirecting, show loading
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ProtectedRoute;

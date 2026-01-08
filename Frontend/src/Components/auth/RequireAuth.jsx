import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

/**
 * Protected Route Component
 * - Checks if user is logged in -> redirects to /login if not
 * - Checks if user is subscribed -> redirects to /pricing if not
 * - Renders <Outlet /> if both checks pass
 */
const RequireAuth = () => {
  const { user, checkAuth, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setChecking(false);
    };
    verifyAuth();
  }, [checkAuth]);

  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but not subscribed - redirect to pricing/subscription page
  if (!user.isSubscribed) {
    return <Navigate to="/pricing" replace />;
  }

  // Both auth and subscription valid - render children
  return <Outlet />;
};

export default RequireAuth;




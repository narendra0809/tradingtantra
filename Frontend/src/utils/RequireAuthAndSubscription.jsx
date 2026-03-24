import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

const RequireAuthAndSubscription = () => {
  const { user, checkAuth, loading } = useAuth();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Only call checkAuth if we don't have a user yet
    if (!user) {
      const verifyAuth = async () => {
        await checkAuth('RequireAuthAndSubscription');
        setChecking(false);
      };
      verifyAuth();
    } else {
      setChecking(false);
    }
  }, []); // Empty deps - run only once on mount

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

  // Logged in but not subscribed - redirect to subscription page
  if (!user.isSubscribed) {
    return <Navigate to="/dashboard/plan" replace />;
  }

  // Both auth and subscription valid - render children
  return <Outlet />;
};

export default RequireAuthAndSubscription;



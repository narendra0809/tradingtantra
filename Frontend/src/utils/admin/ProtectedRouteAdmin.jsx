import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAdminAuth } from "../../contexts/adminContext/AdminAuthContext";

const ProtectedRouteAdmin = () => {
  const { admin, checkAuth } = useAdminAuth();
  const location = useLocation();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await checkAuth();
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return admin ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" state={{ from: location }} replace />
  );
};

export default ProtectedRouteAdmin;

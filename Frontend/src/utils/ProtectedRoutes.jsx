// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";

// const ProtectedRoute = () => {
//   const { user } = useAuth();
// //   console.log("user", user);


//   return user ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default ProtectedRoute;



import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { user, checkAuth } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await checkAuth();
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading...</div>;

  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;

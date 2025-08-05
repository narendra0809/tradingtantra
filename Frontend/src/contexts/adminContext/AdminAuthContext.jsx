/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import axios from "axios";

const AdminAuthContext = createContext();

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem("adminAccessToken");
    return token ? jwtDecode(token) : null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let token = localStorage.getItem("adminAccessToken");

    if (!token) {
      setAdmin(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;

      if (expirationTime > Date.now()) {
        setAdmin(decoded);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
    }
  };

  const login = (token) => {
    localStorage.setItem("adminAccessToken", token);
    setAdmin(jwtDecode(token));
    navigate("/admin", { replace: true });
  };

  const logout = () => {
    try {
      // await axios.post(
      //   `${SERVER_URI}/admin/auth/logout`,
      //   {},
      //   {
      //     withCredentials: true,
      //   }
      // );
      // localStorage.removeItem("adminAccessToken");
      // setAdmin(null);
      // navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

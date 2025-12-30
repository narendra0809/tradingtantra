/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

import axios from "axios";
import { toast } from "react-hot-toast";

const AuthContext = createContext();
const SERVER_URI = import.meta.env.VITE_SERVER_URI;

// 🔥 CRITICAL: Ensure cookies are sent with every request
axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    let token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const expirationTime = decoded.exp * 1000;

      if (expirationTime > Date.now()) {
        setUser(decoded);
        setTimeout(logout, expirationTime - Date.now()); // Auto logout when token expires
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      logout();
    }
  };

  const login = (token, isAdmin) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode(token));
    if (isAdmin) {
      navigate("/admin", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${SERVER_URI}/auth/logout`,
        {},
        { withCredentials: true }
      );
      Cookies.remove("isSubscribed");
    } catch (error) {
      console.error("Error logging out:", error);
    }

    localStorage.removeItem("token");
    setUser(null);
    Cookies.remove("isSubscribed");
    if (redirect) navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
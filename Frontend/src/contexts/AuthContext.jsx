/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import axios from "axios";

const AuthContext = createContext();

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      // Call /me endpoint - it reads HttpOnly cookie automatically
      const response = await axios.get(`${SERVER_URI}/auth/me`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${SERVER_URI}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Backend already set HttpOnly cookie
        // Just get fresh user data
        await checkAuth();
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${SERVER_URI}/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error) {
      console.error("Logout error:", error);
    }

    setUser(null);
    navigate("/", { replace: true });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

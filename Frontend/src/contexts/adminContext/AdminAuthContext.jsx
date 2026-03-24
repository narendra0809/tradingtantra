/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import axios from "axios";

const AdminAuthContext = createContext();

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

// Inactivity timeout in milliseconds (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(() => {
    const token = localStorage.getItem("adminAccessToken");
    return token ? jwtDecode(token) : null;
  });

  const navigate = useNavigate();
  const inactivityTimerRef = useRef(null);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (admin) {
      inactivityTimerRef.current = setTimeout(() => {
        // Auto logout after 30 minutes of inactivity
        handleAutoLogout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [admin]);

  // Handle auto logout
  const handleAutoLogout = async () => {
    try {
      await axios.post(
        `${SERVER_URI}/admin/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Auto logout error:", error);
    } finally {
      localStorage.removeItem("adminAccessToken");
      setAdmin(null);
      navigate("/admin/login", { replace: true });
    }
  };

  // Set up inactivity event listeners
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup
    if (admin) {
      resetInactivityTimer();
    }

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      // Clear timer on unmount
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [admin, resetInactivityTimer]);

  useEffect(() => {
    checkAuth();
  }, []);

  // Update admin state when it changes and reset timer
  useEffect(() => {
    if (admin) {
      resetInactivityTimer();
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
  }, [admin]);

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
      // Clear any pending inactivity timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Call logout API
      axios.post(
        `${SERVER_URI}/admin/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      localStorage.removeItem("adminAccessToken");
      setAdmin(null);
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
      // Still clear local state even if API fails
      localStorage.removeItem("adminAccessToken");
      setAdmin(null);
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, login, logout, checkAuth }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

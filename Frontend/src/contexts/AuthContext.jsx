/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  // 1. Check Auth on Load (via API, not localStorage, because cookies are httpOnly)
  const checkAuth = async () => {
    try {
      // Create a route /auth/me in your backend that uses verifyUser and returns req.user
      const res = await axios.get(`${SERVER_URI}/auth/me`);
      setUser(res.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Login Function
  const login = async (email, password, forceLogin = false) => {
    try {
      const res = await axios.post(`${SERVER_URI}/auth/login`, {
        email,
        password,
        forceLogin,
      });
      
      setUser(res.data.user);
      Cookies.set("isSubscribed", res.data.user.isSubscribed, { expires: 1 });
      
      return res.data; // Return data so Login Page can handle success
    } catch (error) {
      throw error; // Throw error so Login Page can handle 409
    }
  };

  // 3. Logout Function
  const logout = async (redirect = true) => {
    try {
      await axios.post(`${SERVER_URI}/auth/logout`);
    } catch (error) {
      console.error("Logout error", error);
    }
    setUser(null);
    Cookies.remove("isSubscribed");
    if (redirect) navigate("/", { replace: true });
  };

  // 🔥 4. AXIOS INTERCEPTOR: Catch "Session Taken Over" globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (
          error.response &&
          error.response.status === 401 &&
          error.response.data?.code === "SESSION_TAKEN_OVER"
        ) {
          // Prevent infinite loop if already on login page
          if (window.location.pathname !== "/login") {
            setUser(null);
            Cookies.remove("isSubscribed");
            navigate("/login");
            toast.error("You have been logged out because you logged in on another device.");
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [navigate]);

  // 🔥 5. HEARTBEAT: Poll every 5 seconds to check if session is valid
  // This ensures auto-logout happens even if the user is idle (not clicking anything)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // Just a lightweight check. If verifyUser fails, the Interceptor above catches it.
      axios.get(`${SERVER_URI}/auth/me`).catch(() => {}); 
    }, 5000); // 5 Seconds

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
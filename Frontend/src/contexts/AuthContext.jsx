// import { createContext, useContext, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import axios from "axios";

// const AuthContext = createContext();

// const SERVER_URI = import.meta.env.VITE_SERVER_URI;

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     const token = localStorage.getItem("token");
//     return token ? jwtDecode(token) : null;
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     checkAuth();
//   }, [user]);

//   const checkAuth = async () => {
//     let token = localStorage.getItem("token");

//     if (!token) {
//       navigate("/login", { replace: true });
//       return;
//     }

//     try {
//       const decoded = jwtDecode(token);
//       const expirationTime = decoded.exp * 1000;

//       if (expirationTime > Date.now()) {
//         setUser(decoded);
//         const timeout = setTimeout(logout, expirationTime - Date.now());
//         return () => clearTimeout(timeout);
//       } else {
//         logout();
//       }
//     } catch (error) {
//       console.error("Error decoding token:", error);
//       logout();
//     }
//   };

//   const login = (token) => {
//     localStorage.setItem("token", token);
//     setUser(jwtDecode(token));
//     checkAuth(); // ✅ Ensure authentication is verified after login
//     navigate("/dashboard", { replace: true });
//   };

//   const logout = async () => {
//     try {
//       await axios.post(
//         `${SERVER_URI}/auth/logout`,
//         {},
//         { withCredentials: true }
//       );
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }

//     localStorage.removeItem("token");
//     setUser(null);
//     navigate("/", { replace: true });
//   };

//   return (
//     <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);





import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

const SERVER_URI = import.meta.env.VITE_SERVER_URI;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    return token ? jwtDecode(token) : null;
  });

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

  const login = (token) => {
    localStorage.setItem("token", token);
    setUser(jwtDecode(token));
    navigate("/dashboard", { replace: true });
  };

  const logout = async () => {
    try {
      await axios.post(`${SERVER_URI}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }

    localStorage.removeItem("token");
    setUser(null);
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

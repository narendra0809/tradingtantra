/* eslint-disable react-refresh/only-export-components */
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import GoogleLogo from "../assets/Images/logos/google.png";
import { useNavigate } from "react-router-dom";
import { googleAuth } from "../utils/api";
import Cookies from "js-cookie";
import { useAuth } from "../contexts/AuthContext";

const GoogleSignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const responseGoogle = async (authResult) => {
    try {
      if (authResult.code) {
        const result = await googleAuth(authResult.code);
        if (result.data.success) {
          login(result.data.token);
          Cookies.set("isSubscribed", result?.data?.user?.isSubscribed, {
            expires: 1,
          });
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.log("Error in google login : ", error);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: responseGoogle,
    onError: responseGoogle,
  });

  return (
    <div
      onClick={() => handleGoogleLogin()}
      className="cursor-pointer flex justify-center"
    >
      <img
        src={GoogleLogo}
        alt="Sign in with Google"
        style={{
          height: "auto",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          ":hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            transform: "translateY(-2px)",
          },
        }}
      />
    </div>
  );
};

const GoogleButton = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <GoogleSignIn />
    </GoogleOAuthProvider>
  );
};

export default GoogleButton;

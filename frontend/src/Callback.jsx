import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get("code");

      if (authCode) {
        try {
          const response = await axios.post(`${BACKEND_URL}/auth/google`, {
            code: authCode,
            redirectUri: REDIRECT_URI,
          });

          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/");
        } catch (error) {
          console.error("Error exchanging code for token:", error);
          if (error.response?.status === 403) {
            alert("Only @g.ucla.edu email addresses are allowed to login!");
          }
          navigate("/");
        }
      }
    };
    exchangeCodeForToken();
    navigate("/");
  }, [navigate]);

  return <p>Logging you in...</p>;
}

export default Callback;

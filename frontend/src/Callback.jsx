// src/Callback.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get("code");

      if (authCode) {
        try {
          const response = await axios.post(
            "http://localhost:3000/auth/google",
            {
              code: authCode,
              redirectUri: "http://localhost:5173/callback",
            }
          );

          // Store the token and user info (e.g., in localStorage or a global context)
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));

          // Redirect to the main app page
          navigate("/");
        } catch (error) {
          console.error("Error exchanging code for token:", error);
          // Optionally, redirect to an error page or show a message
        }
      }
    };
    exchangeCodeForToken();
  }, [navigate]);

  return <p>Logging you in...</p>;
}

export default Callback;

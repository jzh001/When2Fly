import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

function Callback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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
          setLoading(false);
          navigate("/");
        } catch (error) {
          console.error("Error exchanging code for token:", error);
          if (error.response?.status === 403) {
            alert("Only @g.ucla.edu email addresses are allowed to login!");
          }
          setLoading(false);
          navigate("/");
        }
      } else {
        setLoading(false);
        navigate("/");
      }
    };
    exchangeCodeForToken();
  }, [navigate]);

  return loading ? (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg, #e6f0fa 0%, #b3c6e0 100%)'
    }}>
      <div style={{
        border: '6px solid #f3f3f3',
        borderTop: '6px solid #23406e',
        borderRadius: '50%',
        width: 60,
        height: 60,
        animation: 'spin 1s linear infinite',
        marginBottom: 24
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <h2 style={{ color: '#23406e', fontWeight: 600, marginBottom: 8 }}>Logging you in...</h2>
      <div style={{ color: '#23406e', opacity: 0.8, textAlign: 'center' }}>
        <div>Please wait while we connect to the server and log you in securely.</div>
        <div>It take up to a minute for our server to boot up. Thank you for your patience.</div>
      </div>
    </div>
  ) : null;
}

export default Callback;

import { Link } from 'react-router-dom';
import LoginButton from "./components/loginButton";
import "./Home.css";
import AllowUsersOnly from './components/allowUsersOnly';
import { useAuth } from "./hooks/useAuth";
import MenuBarWithLogout from './components/MenuBar';

function Home() {
  const { user, loading } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="home-root" style={{ background: '#f7fafd', minHeight: '100vh', padding: 0 }}>
      {/* Header and menu bar moved to AppLayout */}
      <div className="airplane-wrapper">
        <img
          className="airplane"
          src="/airplane.webp"
          alt="Airplane flying"
        />
        <img
          className="airplane delay"
          src="/airplane.webp"
          alt="Airplane flying"
        />
      </div>
      <main className="home-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', marginTop: '2rem' }}>
        <div className="home-body-content" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 2px 8px rgba(60, 64, 67, 0.04)', padding: '2rem 2.5rem', maxWidth: '600px', color: '#23406e', fontSize: '1.1rem', lineHeight: 1.7 }}>
          <p>
            <strong>When2Fly</strong> is your go-to app for UCLA students looking to save on travel to and from Los Angeles International Airport (LAX).
            Inspired by the ease of When2meet, our platform connects you with fellow Bruins whose flight times match yours, making it simple to share an Uber and split the cost.
            Say goodbye to the hassle of informal group chats and hello to a smarter, more affordable way to travel!
          </p>
        </div>
      </main>
    </div>
  );
}

export default Home;
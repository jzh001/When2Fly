import { Link } from 'react-router-dom';
import LoginButton from "./components/loginButton";
import { useState } from "react";
import "./Home.css";

function Home() {
    const [token, setToken] = useState(localStorage.getItem("token"));

    const handleLogout = () => {
      localStorage.removeItem("token");
      setToken(null);
      window.location.reload();
    };

    return (
      <div className="home-root">
        <header className="home-header">
          <h1 className="home-title">When2Fly</h1>
          <LoginButton />
        </header>

        {token && (
          <nav className="home-nav">
            <Link to="/Profile">
              <button className="profile-btn">Profile Page</button>
            </Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}

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

        <main className="home-body">
          <div className="home-body-content">
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
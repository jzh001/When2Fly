import { Link } from 'react-router-dom';
import LoginButton from "./components/loginButton";
function Home() {
    return (
      <>
        <div className="home">
          <h1>When2Fly</h1>
          <LoginButton />
        </div>
        <div style={{marginTop: "50px"}}>
          <Link to="/Profile">
            <button>Profile Page</button>
          </Link>
        </div>

        <div className="airplane-wrapper">
          <img className="airplane" src="/airplane.webp" alt="Airplane flying" />
          <img className="airplane delay" src="/airplane.webp" alt="Airplane flying" />
        </div>

        <div className="body">
          <h2>Find the best time to fly</h2>
          <p>
            When2Fly is your go-to app for UCLA students looking to save on travel to and from Los Angeles International Airport (LAX). 
            Inspired by the ease of When2meet, our platform connects you with fellow Bruins whose flight times match yours, making it simple to share an Uber and split the cost. Say goodbye to the hassle of informal group chats and hello to a smarter, more affordable way to travel!
          </p>
        </div>
      </>
    );
  }
  
  export default Home;
  
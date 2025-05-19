import { Link } from 'react-router-dom';
import LoginButton from "./components/loginButton";
import { useEffect, useRef, useState } from "react";
function Home() {


    const bodyRef = useRef(null);
    const [airplaneTop, setAirplaneTop] = useState(0);

    useEffect(() => {
      const updateAirplanePosition = () => {
        if (bodyRef.current) {
          const bodyBottom = bodyRef.current.getBoundingClientRect().bottom + window.scrollY;
          setAirplaneTop(bodyBottom + 40); // 40px gap below the content
        }
      };

      updateAirplanePosition();
      window.addEventListener("resize", updateAirplanePosition);
      return () => window.removeEventListener("resize", updateAirplanePosition);
    }, []);
      
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
          <img
            className="airplane"
            src="/airplane.webp"
            alt="Airplane flying"
            style={{ top: `${airplaneTop}px` }}
          />
          <img
            className="airplane delay"
            src="/airplane.webp"
            alt="Airplane flying"
            style={{ top: `${airplaneTop + 60}px` }}
          />
        </div>

        <div className="body">
          <div ref={bodyRef} className="body">
            <p>
              When2Fly is your go-to app for UCLA students looking to save on travel to and from Los Angeles International Airport (LAX). 
              Inspired by the ease of When2meet, our platform connects you with fellow Bruins whose flight times match yours, making it simple to share an Uber and split the cost. Say goodbye to the hassle of informal group chats and hello to a smarter, more affordable way to travel!
            </p>
          </div>
        </div>
      </>
    );
  }
  
  export default Home;
  
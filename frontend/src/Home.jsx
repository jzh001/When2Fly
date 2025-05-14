import LoginButton from "./components/loginButton";
function Home() {
    return (
      <>
        <div className="home">
          <h1>When2Fly</h1>
          <LoginButton />
        
        </div>

        <div className="airplane-wrapper">
          <img className="airplane" src="/airplane.webp" alt="Airplane flying" />
          <img className="airplane delay" src="/airplane.webp" alt="Airplane flying" />
        </div>
      </>
    );
  }
  
  export default Home;
  
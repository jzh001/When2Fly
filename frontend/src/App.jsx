import "./App.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginButton from "./components/loginButton";
import Home from './Home.jsx'
import Callback from "./Callback";
import Profile from './Profile.jsx';
import Notifications from "./Notifications.jsx";
function App() {
  // src/App.jsx
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/callback" element={<Callback />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;

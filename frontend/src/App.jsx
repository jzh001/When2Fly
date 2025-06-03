import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet, useLocation } from 'react-router-dom';
import { FlightAdder } from './FlightAdder.jsx';
import { FlightEditor } from './FlightEditor.jsx';
import BrowseFlights from './BrowseFlights.jsx';
import LoginButton from "./components/loginButton";
import Home from './Home.jsx'
import Callback from "./Callback";
import Profile from './Profile.jsx';
import Notifications from "./Notifications.jsx";
import AllowUsersOnly from "./components/allowUsersOnly";
import { HomeOutlined, EditOutlined, UserOutlined, BellOutlined, SearchOutlined } from '@ant-design/icons';
import { ConfigProvider, Layout, Menu } from 'antd';
import MenuBar from './components/MenuBar.jsx';
import { useAuth } from "./hooks/useAuth";
const { Header, Content } = Layout;

const menuItems = [
  {
    label: <Link to="/">Home</Link>,
    icon: <HomeOutlined />,
    key: 'home',
  },
  {
    label: <Link to="/edit">Flight Editor</Link>,
    icon: <EditOutlined />,
    key: 'edit',
  },
  {
    label: <Link to="/profile">Profile</Link>,
    icon: <UserOutlined />,
    key: 'profile',
  },
  {
    label: <Link to="/notifications">Notifications</Link>,
    icon: <BellOutlined />,
    key: 'notifications',
  },
  {
    label: <Link to="/browse">Browse Flights</Link>,
    icon: <SearchOutlined />,
    key: 'browse',
  },
];

const AppLayout = () => {
  const { user, loading } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch {
        setUnreadCount(0);
      }
    };
    if (user) fetchUnread();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerPadding: '0 24px',
          },
          Menu: {
            darkItemBg: 'transparent',
            darkItemColor: 'rgba(255, 255, 255, 0.9)',
            darkItemSelectedBg: 'rgba(0, 0, 0, 0.3)',
          }
        }
      }}
    >
      <Layout>
        <Header className="custom-header" style={{ minHeight: 0, height: 'auto', boxShadow: 'none', borderBottom: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 16, paddingBottom: 0 }}>
          <h1 className="home-title" style={{ fontWeight: 700, color: '#23406e', letterSpacing: '1px', fontSize: '2.5rem', margin: 0 }}>When2Fly</h1>
          {!loading && !user && <LoginButton />}
          {user && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 0, width: '100%' }}>
              <MenuBar onLogout={handleLogout} unreadCount={unreadCount} />
            </div>
          )}
        </Header>
        <Content style={{ 'backgroundColor': "#e6f0fa"}}>
          <Outlet context={{ setUnreadCount }} />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

function App() {
  const [selectedKey, setSelectedKey] = useState('home');
  // src/App.jsx
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout/>}>
          <Route index element={<Home />} />
          <Route path="edit" element={<AllowUsersOnly><FlightEditor /></AllowUsersOnly>} />
          <Route path="profile" element={<AllowUsersOnly><Profile /></AllowUsersOnly>} />
          <Route path="notifications" element={<AllowUsersOnly><Notifications /></AllowUsersOnly>} />
          <Route path="browse" element={<AllowUsersOnly><BrowseFlights /></AllowUsersOnly>} />
          <Route path="callback" element={<Callback />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

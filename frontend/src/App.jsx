import "./App.css";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
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
  return (
    <ConfigProvider
      theme={{
        components: {
          Layout: {
            headerBg: '#6baed6', // Navbar background
            headerPadding: '0 24px', // Adjust padding as needed
          },
          Menu: {
            darkItemBg: 'transparent', // Makes dark menu transparent
            darkItemColor: 'rgba(255, 255, 255, 0.9)', // Menu text color
            darkItemSelectedBg: 'rgba(0, 0, 0, 0.3)', // Selected state
          }
        }
      }}
    >
      <Layout>
        <Header>
          <Menu 
            items={menuItems} 
            style={{ width: "100%"}} 
            theme="dark" 
            mode="horizontal" 
            defaultSelectedKeys={['home']}  
          />
        </Header>
        <Content style={{ 'backgroundColor': "#e6f0fa"}}>
          <Outlet />
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

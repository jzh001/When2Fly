import "./App.css";
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
import { ConfigProvider, Layout, Menu } from 'antd';
const { Header, Content } = Layout;

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
          <Menu style={{ width: "100%"}} theme="dark" mode="horizontal" defaultSelectedKeys={['home']}>
            <Menu.Item key="home">
              <Link to="/">Home</Link>
            </Menu.Item>
            <Menu.Item key="edit">
              <Link to="/edit">Flight Editor</Link>
            </Menu.Item>
            <Menu.Item key="profile">
              <Link to="/profile">Profile</Link>
            </Menu.Item>
            <Menu.Item key="notifications">
              <Link to="/notifications">Notifications</Link>
            </Menu.Item>
            <Menu.Item key="browse">
              <Link to="/browse">Browse Flights</Link>
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ 'background-color': "#e6f0fa"}}>
          <Outlet />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

function App() {
  // src/App.jsx
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="edit" element={<FlightEditor />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="browse" element={<BrowseFlights />} />
          <Route path="callback" element={<Callback />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

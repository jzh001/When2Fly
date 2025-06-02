import { Menu } from 'antd';
import { HomeOutlined, EditOutlined, UserOutlined, BellOutlined, SearchOutlined, LogoutOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import React from 'react';

const MenuBarWithLogout = ({ onLogout }) => {
  const location = useLocation();
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
    {
      label: <span style={{ color: '#e53935', fontWeight: 600 }}>Logout</span>,
      icon: <LogoutOutlined style={{ color: '#e53935' }} />,
      key: 'logout',
      onClick: onLogout,
    },
  ];
  // Determine selected key based on location
  let selectedKey = menuItems.find(item => location.pathname.toLowerCase().includes(item.key))?.key || 'home';
  if (selectedKey === 'logout') selectedKey = 'home';
  return (
    <Menu
      className="custom-menu-bar"
      items={menuItems}
      theme="dark"
      mode="horizontal"
      selectedKeys={[selectedKey]}
      onClick={({ key }) => {
        if (key === 'logout') onLogout();
      }}
      style={{ minWidth: 220, borderRadius: 18, boxShadow: '0 4px 16px rgba(60,64,67,0.10)', border: '1px solid #dbe7f3', background: '#3a6ea5', margin: 0 }}
    />
  );
};

export default MenuBarWithLogout;

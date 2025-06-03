import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Card, Button, Input, Select, Spin, message } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  BellOutlined,
} from "@ant-design/icons";
import "./Profile.css";
import AllowUsersOnly from "./components/allowUsersOnly";

dayjs.extend(utc);
dayjs.extend(timezone);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const timezones = [
  "Pacific/Midway",
  "US/Hawaii",
  "US/Alaska",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "Atlantic/Bermuda",
  "America/Miquelon",
  "America/Nuuk",
  "Atlantic/Azores",
  "UTC",
  "Europe/London",
  "Europe/Paris",
  "Europe/Athens",
  "Africa/Nairobi",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dhaka",
  "Asia/Bangkok",	
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Norfolk",
  "Pacific/Auckland",
];

const Profile = () => {
  const [user, setUser] = useState(null);
  const [accData, setAccData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tzEditMode, setTzEditMode] = useState(false);
  const [timezoneValue, setTimezoneValue] = useState("UTC");
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setAccData({ name: response.data.name, email: response.data.email });
        setTimezoneValue(response.data.timezone || "UTC");
      } catch (error) {
        message.error("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token, location.pathname]);

  const handleChange = (e) => {
    setAccData({ ...accData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/users/update-name`,
        { userId: user.google_id, newName: accData.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, name: accData.name });
      setEditMode(false);
      message.success("Profile updated!");
    } catch (error) {
      message.error("Failed to update profile.");
    }
  };

  const handleTimezoneSave = async () => {
    try {
      await axios.put(
        `${BACKEND_URL}/users/update-timezone`,
        { userId: user.google_id, timezone: timezoneValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, timezone: timezoneValue });
      setTimezoneValue(timezoneValue);
      setTzEditMode(false);
      message.success("Timezone updated!");
    } catch (error) {
      message.error("Failed to update timezone.");
    }
  };

  if (loading) {
    return (
      <div
        className="profile-root"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  // User not found: Home button + redirect after 10 seconds
  if (!user) {
    useEffect(() => {
      const timer = setTimeout(() => {
        navigate("/");
      }, 10000);
      return () => clearTimeout(timer);
    }, [navigate]);

    return (
      <div className="profile-root" style={{ textAlign: "center", marginTop: 40 }}>
        <p style={{ fontSize: 18, marginBottom: 16 }}>User not found.</p>
        <Button type="primary" onClick={() => navigate("/")}>Go Home</Button>
        <p style={{ marginTop: 12, color: '#888' }}>
          You will be redirected to the home page in 10 seconds.
        </p>
      </div>
    );
  }

  return (
    <AllowUsersOnly>
      <div className="profile-root">
        <div className="profile-card">
          <div className="profile-field">
            <label>Name</label>
            {editMode ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Input
                  name="name"
                  value={accData.name}
                  onChange={handleChange}
                  style={{ flex: 1 }}
                  maxLength={32}
                  autoFocus
                />
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleSave}
                  style={{ minWidth: 40 }}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setEditMode(false);
                    setAccData({ ...accData, name: user.name });
                  }}
                  style={{ minWidth: 40 }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{user.name}</span>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => setEditMode(true)}
                  style={{ marginLeft: 8 }}
                />
              </div>
            )}
          </div>
          <div className="profile-field">
            <label>Email</label>
            <span style={{ fontSize: 16 }}>{user.email}</span>
          </div>
          <div className="profile-field">
            <label>Timezone</label>
            {tzEditMode ? (
              <div style={{ display: "flex", gap: 8 }}>
                <Select
                  showSearch
                  value={timezoneValue}
                  onChange={setTimezoneValue}
                  style={{ flex: 1 }}
                  options={timezones.map((tz) => {
                    const offset = dayjs().tz(tz).utcOffset() / 60;
                    const sign = offset >= 0 ? "+" : "";
                    return {
                      value: tz,
                      label: `${tz} (UTC${sign}${offset})`
                    };
                  })}
                  optionFilterProp="label"
                />
                <Button
                  icon={<SaveOutlined />}
                  type="primary"
                  onClick={handleTimezoneSave}
                  style={{ minWidth: 40 }}
                />
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setTimezoneValue(user.timezone || "UTC");
                    setTzEditMode(false);
                  }}
                  style={{ minWidth: 40 }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{timezoneValue || "UTC"}</span>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => setTzEditMode(true)}
                  style={{ marginLeft: 8 }}
                />
              </div>
            )}
          </div>
          <div className="profile-buttons" style={{ justifyContent: "center" }}>
            <Button
              icon={<BellOutlined />}
              onClick={() => navigate("/notifications")}
              type="default"
              className="profile-btn secondary"
            >
              Notifications
            </Button>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/")}
              type="default"
              className="profile-btn secondary"
            >
              Home
            </Button>
          </div>
        </div>
      </div>
    </AllowUsersOnly>
  );
};

export default Profile;

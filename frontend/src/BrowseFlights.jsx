import React, { useEffect, useState } from "react";
import { Avatar, Button, List, Skeleton, Switch, Slider, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import AllowUsersOnly from "./components/allowUsersOnly";
import "./Home.css"; // Import Home.css for consistent styling
dayjs.extend(utc);
dayjs.extend(timezone);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BrowseFlights = () => {
  const [flights, setFlights] = useState([]);
  const [initLoading, setInitLoading] = useState(true);
  const [interval, setInterval] = useState(24); // hours
  const [showMine, setShowMine] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    const fetchFlights = async () => {
      setInitLoading(true);
      const now = new Date();
      try {
        const res = await axios.get(
          `${BACKEND_URL}/flights/allFlights?time=${encodeURIComponent(
            now.toISOString()
          )}&interval=${interval}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFlights(res.data || []);
      } catch (error) {
        message.error("Failed to load flights.");
        setFlights([]);
      } finally {
        setInitLoading(false);
      }
    };
    fetchFlights();
  }, [interval, token]);

  // Filter out own flights if toggle is off
  const filteredFlights = flights.filter(
    (f) => showMine || !user || String(f.userId) !== String(user.google_id)
  );

  // console.log("user from useAuth:", user);
  const userTimezone = user?.timezone || "UTC";
  return (
    <AllowUsersOnly>
      <div className="home-root" style={{ background: '#f8fafc', minHeight: '100vh', padding: '40px 16px' }}>
        <div className="home-body" style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: '700px', background: '#fff', borderRadius: '14px', boxShadow: '0 4px 24px rgba(30,41,59,0.09)', padding: '36px 32px', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px', textAlign: 'center' }}>Browse All Flights</h2>
          <div
            style={{
              margin: "24px 0",
              display: "flex",
              alignItems: "center",
              gap: 24,
              justifyContent: "center",
            }}
          >
            <span>Show flights in next</span>
            <Slider
              min={1}
              max={168}
              value={interval}
              onChange={setInterval}
              marks={{ 1: "1h", 24: "1d", 72: "3d", 168: "7d" }}
              tooltip={{
                open: true,
                formatter: (v) => (v >= 24 ? `${Math.round(v / 24)}d` : `${v}h`),
              }}
              style={{ width: 200 }}
            />
            <span>
              {interval >= 24
                ? `${Math.round(interval / 24)} day(s)`
                : `${interval} hour(s)`}
            </span>
            <Switch
              checked={showMine}
              onChange={setShowMine}
              style={{ marginLeft: 24 }}
            />
            <span>Show my flights</span>
          </div>
          <div
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: 14,
              marginBottom: 8,
            }}
          >
            Showing times in your timezone: <b>{userTimezone}</b>
          </div>
          <List
            className="demo-loadmore-list"
            loading={initLoading}
            itemLayout="horizontal"
            dataSource={filteredFlights}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<Avatar src={item.avatar} />}
                  title={
                    <>
                      <span>{item.name}</span>
                      <span style={{ color: "#888", marginLeft: 8 }}>
                        {item.users?.name ? `by ${item.users.name}` : ""}
                      </span>
                    </>
                  }
                  description={
                    <>
                      Time:{" "}
                      {dayjs
                        .utc(item.time)
                        .tz(userTimezone)
                        .format("YYYY-MM-DD HH:mm")}
                      <br />
                      {item.users?.email && (
                        <span style={{ color: "#888" }}>
                          Author Email:{" "}
                          <a
                            href={`mailto:${item.users.email}`}
                            style={{
                              color: "#1677ff",
                              textDecoration: "underline",
                            }}
                          >
                            {item.users.email}
                          </a>
                        </span>
                      )}
                    </>
                  }
                />
                <div>Enjoy your flight!</div>
              </List.Item>
            )}
            locale={{ emptyText: "No flights found in this window." }}
          />
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
              justifyContent: "center",
            }}
          >
            <Button type="primary" onClick={() => navigate("/")}>
              Back
            </Button>
          </div>
        </div>
      </div>
    </AllowUsersOnly>
  );
};

export default BrowseFlights;

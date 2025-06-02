import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Notifications.css";
import AllowUsersOnly from "./components/allowUsersOnly";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(data);
      } catch {
        alert("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  const renderMessage = (message, parentKey) => {
    // Regex to match UCLA email addresses
    const emailRegex = /([a-zA-Z0-9._-]+@g\.ucla\.edu)/g;
    const parts = message.split(emailRegex);

    return parts.map((part, index) => {
      const key = `${parentKey}-part-${index}`;
      if (part.match(emailRegex)) {
        return (
          <a
            key={key}
            href={`mailto:${part}`}
            style={{
              color: "#1677ff",
              textDecoration: "underline",
            }}
          >
            {part}
          </a>
        );
      }
      return <span key={key}>{part}</span>;
    });
  };

  return (
    <AllowUsersOnly>
      <div className="notifications-root">
        <h2 className="notifications-header">Notifications</h2>
        {loading ? (
          <div className="notifications-status">Loading notifications...</div>
        ) : !notifications.length ? (
          <div className="notifications-status">No notifications found.</div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notif, idx) => (
              <li key={notif.id ?? `notif-${idx}`}>
                {renderMessage(notif.message, notif.id ?? `notif-${idx}`)}{" "}
                {!notif.isRead && <strong>(Unread)</strong>}
              </li>
            ))}
          </ul>
        )}
        <button className="notifications-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </AllowUsersOnly>
  );
};

export default Notifications;

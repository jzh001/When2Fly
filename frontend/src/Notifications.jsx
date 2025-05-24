import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("http://localhost:3000/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data);
      } catch (error) {
        alert("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  return (
  <div>
    <h2>Notifications</h2>
    {loading ? (
      <div>Loading notifications...</div>
    ) : !notifications.length ? (
      <div>No notifications found.</div>
    ) : (
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>
            {notif.message} {!notif.isRead && <strong>(Unread)</strong>}
          </li>
        ))}
      </ul>
    )}
    <button onClick={() => navigate("/")}>Back to Home</button>
  </div>
  );
}
export default Notifications;
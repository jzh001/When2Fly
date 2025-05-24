import { useEffect, useState } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading notifications...</div>;
  if (!notifications.length) return <div>No notifications found.</div>;

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notif) => (
          <li key={notif.id}>
            {notif.message}{" "}
            {!notif.isRead && <strong>(Unread)</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notifications;
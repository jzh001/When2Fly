import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [accData, setAccData] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  // Get token from localStorage (adjust if you store it elsewhere)
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setAccData({ name: response.data.name, email: response.data.email });
      } catch (error) {
        alert("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleChange = (e) => {
    setAccData({ ...accData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}/users/update-name`,
        { userId: user.google_id, newName: accData.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser({ ...user, name: accData.name });
      setEditMode(false);
      alert("Profile updated!");
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>No user data found.</div>;

  return (
  <div className="profile-root">
    <h2 className="profile-header">Profile</h2>
    <div className="profile-card">
      <div className="profile-field">
        <label>Name:</label>
        {editMode ? (
          <input
            name="name"
            value={accData.name}
            onChange={handleChange}
          />
        ) : (
          <span>{user.name}</span>
        )}
      </div>
      <div className="profile-field">
        <label>Email:</label>
        <span>{user.email}</span>
      </div>

      {editMode ? (
        <div className="profile-inline-buttons">
          <button className="profile-btn primary" onClick={handleSave}>Save</button>
          <button className="profile-btn secondary" onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <button className="profile-btn primary" onClick={() => setEditMode(true)}>Edit Name</button>
      )}

      <div className="profile-bottom-buttons">
        <button className="profile-btn secondary" onClick={() => navigate("/notifications")}>View Notifications</button>
        <button className="profile-btn secondary" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  </div>
  );

};

export default Profile;
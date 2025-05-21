import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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
    <div>
      <h2>Profile</h2>
      <div>
        <label>Name: </label>
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
      <div>
        <label>Email: </label>
        <span>{user.email}</span>
      </div>
      {editMode ? (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </>
      ) : (
        <button onClick={() => setEditMode(true)}>Edit Name</button>
      )}
      <br />
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Profile;
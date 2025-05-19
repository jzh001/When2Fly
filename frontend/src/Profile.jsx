import {useState, useEffect} from "react";
import axios from "axios";


function Profile() {

    const [user, setUser] = useState(null); // user info
    const [loading, setLoading] = useState(true); // Loading state
    const [accData, setAccData] = useState({name: "", email: ""});
    const [editing, setEditing] = useState(false);

    useEffect(() => {

        async function fetchUser() {
            try {
                const token = localStorage.getItem("token");
                console.log("Token:", token);
                if (token) {
                    const response = await axios.get("http://localhost:3000/user", {
                        headers: {Authorization: `Bearer ${token}`}
                    });
                    setUser(response.data);
                    setAccData(response.data);
                    setLoading(false);
                }
                // if timed out, use fake user
                else {
                    setTimeout(() => {
                        const fakeUser = {
                            name: "Joe Bruin",
                            email: "joebruin@ucla.edu",
                        };
                    setUser(fakeUser);
                    setAccData(fakeUser);
                    setLoading(false);
                    }, 1000);   // Wait 1 second
                    return;
                }
            }
            catch (error) {
                console.error("Failed to load user data", error);
                alert("CRITICAL ERROR WHAT ARE YOU DOING")
                return;
            }
        }

        fetchUser();
    }, []);

    if (loading) return <p>Loading profile...</p>;

    function cancelChanges() {
        setAccData(user);
        setEditing(false);
    }

    async function saveChanges() {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No token found");
            
            const response = await axios.put(
                "http://localhost:3000/user",
                accData,
                {headers: {Authorization: `Bearer ${token}`}}
            );
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));        
            setEditing(false);
        }
        catch (error) {
            console.error("Failed to save changes", error);
            alert("CRITICAL ERROR WHAT ARE YOU DOING")
        }
        
    }

    function handleChange(event) {
        setAccData({
            ...accData, // everything else unchanged
            [event.target.name]: event.target.value // update field
        });
    }

    return (
        <div className="profile">
        <h1>My Profile</h1>

        {editing ? (
            <>
            <label>
                Name:{" "}
                <input
                name="name"
                value={accData.name}
                onChange={handleChange}
                />
            </label>
            <br />
            <label>
                Email:{" "}
                <input
                name="email"
                value={accData.email}
                onChange={handleChange}
                />
            </label>
            <br />
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancelChanges}>Cancel</button>
            </>
        ) : (
            <>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <button onClick={() => setEditing(true)}>Edit</button>
            </>
        )}
        </div>
    );
  }
  
  export default Profile;
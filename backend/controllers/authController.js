const db = require("../db");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const handleGoogleTokenExchange = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    // Exchange the code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      null,
      {
        params: {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        },
      }
    );

    const { id_token, access_token } = tokenResponse.data;

    // Decode and verify the ID token
    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
    );

    const { email, name, sub: googleId } = userInfoResponse.data;

    // Upsert user in Supabase
    const { data, error } = await db
      .from("users")
      .upsert({ google_id: googleId, email, name });
    // Upsert: inserts a new row if google_id or email does not exist

    if (error) throw error;
    // Generate a session token (JWT)
    const token = jwt.sign({ userId: googleId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { email, name },
    });
  } catch (err) {
    console.error("Error during Google OAuth:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = {
  handleGoogleTokenExchange,
};

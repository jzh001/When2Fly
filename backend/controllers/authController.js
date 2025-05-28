const db = require("../db");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const handleGoogleTokenExchange = async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

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

    const userInfoResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${id_token}`
    );

    const { email, name, sub: googleId } = userInfoResponse.data;


    if (!email.endsWith("@g.ucla.edu")) {
      return res
        .status(403)
        .json({ error: "Only @g.ucla.edu email addresses are allowed" });
    }

    const { data: existingUser } = await db
      .from("users")
      .select("*")
      .eq("google_id", googleId)
      .single();

    let userData;
    if (!existingUser) {
  
      const { data, error } = await db
        .from("users")
        .insert({ google_id: googleId, email, name })
        .select()
        .single();
      if (error) throw error;
      userData = data;
    } else {

      if (existingUser.email !== email) {
        const { data, error } = await db
          .from("users")
          .update({ email })
          .eq("google_id", googleId)
          .select()
          .single();
        if (error) throw error;
        userData = data;
      } else {
        userData = existingUser;
      }
    }

    const token = jwt.sign({ userId: googleId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      token,
      user: { email: userData.email, name: userData.name },
    });
  } catch (err) {
    console.error("Error during Google OAuth:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};

const validateToken = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token" });
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data, error } = await db
      .from("users")
      .select("google_id, name, email, timezone")
      .eq("google_id", decoded.userId)
      .single();

    if (error || !data)
      return res.status(404).json({ error: "User not found" });
    res.json(data);
  } catch (err) {
    res.status(401).json({ error: "Invalid token/Invalid user" });
  }
};

module.exports = {
  handleGoogleTokenExchange,
  validateToken,
};

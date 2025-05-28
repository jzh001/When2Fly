const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const flightRoutes = require("./routes/flights");
const {
  handleGoogleTokenExchange,
  validateToken,
} = require("./controllers/authController");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");


app.use(
  cors({
    origin: ["http://localhost:5173", "https://when2-fly.vercel.app"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes);
app.use("/flights", flightRoutes);
app.post("/auth/google", handleGoogleTokenExchange);
app.get("/auth/verify", validateToken);

// Test route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Only start the server if run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

module.exports = app;

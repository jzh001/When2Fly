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
const userRoutes = require("./routes/users"); // <-- Add this

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/notifications", notificationRoutes);
app.use("/users", userRoutes); // <-- And this

console.log("Flights route is active.");
app.use("/flights", flightRoutes);

app.post("/auth/google", handleGoogleTokenExchange);
app.get("/auth/verify", validateToken);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}

module.exports = app; // Export the app for testing

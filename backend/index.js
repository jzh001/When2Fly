const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
const flightRoutes = require("./routes/flights");
const { handleGoogleTokenExchange } = require("./controllers/authController");

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

console.log("Flights route is active.");
app.use("/flights", flightRoutes);

app.post("/auth/google", handleGoogleTokenExchange);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

const express = require("express");
const router = express.Router();
const {
  getAllFlights,
  getFlightsInTimeRange,
  getFlightsByUser,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
} = require("../controllers/flightController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware); // Apply authMiddleware to all routes

router.get("/", getAllFlights);
router.get("/queryTime", getFlightsInTimeRange);
router.get("/user/:userId", getFlightsByUser);
router.get("/:id", getFlightById);
router.post("/", createFlight);
router.put("/:id", updateFlight);
router.delete("/:id", deleteFlight);

module.exports = router;
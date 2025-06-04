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
  getAllFlightsInTimeRange,
} = require("../controllers/flightController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/allFlights", getAllFlightsInTimeRange);
router.get("/", getAllFlights);
router.get("/queryTime", getFlightsInTimeRange);
router.get("/user/:userId", getFlightsByUser);
router.get("/:id", getFlightById);
router.post("/", createFlight);
router.put("/:id", updateFlight);
router.delete("/:id", deleteFlight);

module.exports = router;

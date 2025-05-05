const express = require("express");
const router = express.Router();

// Import flight controller
const flightController = require("../controllers/flightController.js");

// Define routes for flights
router.get("/", flightController.getAllFlights);  // Get all flights
router.post("/", flightController.createFlight);  // Add a new flight
router.get("/:id", flightController.getFlightById); // Get a specific flight by ID
router.put("/:id", flightController.updateFlight); // Update a flight
router.delete("/:id", flightController.deleteFlight); // Delete a flight

module.exports = router;

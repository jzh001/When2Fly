// controllers/flightController.js

// Temporary in-memory flight storage
//let flights = [
  //  { id: 1, name: "Flight A", time: "10:00 AM" },
    //{ id: 2, name: "Flight B", time: "3:30 PM" }
  //];
  const flights = require("../data/flightsData");
  // Get all flights
  const getAllFlights = (req, res) => {
    res.json(flights);
  };
  
  // Get a single flight by ID
  const getFlightById = (req, res) => {
    const id = parseInt(req.params.id);
    const flight = flights.find(f => f.id === id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    res.json(flight);
  };
  
  // Create a new flight
  const createFlight = (req, res) => {
    const { name, time } = req.body;
    if (!name || !time) {
      return res.status(400).json({ message: "Name and time are required" });
    }
    const newFlight = {
      id: flights.length + 1,
      name,
      time
    };
    flights.push(newFlight);
    res.status(201).json(newFlight);
  };
  
  // Update an existing flight
  const updateFlight = (req, res) => {
    const id = parseInt(req.params.id);
    const flight = flights.find(f => f.id === id);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }
    const { name, time } = req.body;
    if (name) flight.name = name;
    if (time) flight.time = time;
    res.json(flight);
  };
  
  // Delete a flight
  const deleteFlight = (req, res) => {
    const id = parseInt(req.params.id);
    const index = flights.findIndex(f => f.id === id);
    if (index === -1) {
      return res.status(404).json({ message: "Flight not found" });
    }
    flights.splice(index, 1);
    res.status(204).send(); // No content
  };
  
  // Export controller functions
  module.exports = {
    getAllFlights,
    getFlightById,
    createFlight,
    updateFlight,
    deleteFlight
  };
  
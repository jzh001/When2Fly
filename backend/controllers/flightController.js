// controllers/flightController.js

// Temporary in-memory flight storage
//let flights = [
//  { id: 1, name: "Flight A", time: "10:00 AM" },
//{ id: 2, name: "Flight B", time: "3:30 PM" }
//];
const flights = require("../data/flightsData");
const db = require("../db");
// Get all flights
const getAllFlights = async (req, res) => {
  // res.json(flights);
  try {
    const { data, error } = await db
      .from('flights')
      .select('*')
    console.log("Data fetched from Supabase:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single flight by ID
const getFlightById = async (req, res) => {
  try {
    const { data, error } = await db
      .from('flights')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Flight not found" });
    }
    res.json(data);
  } catch (error) {
    console.error("Error fetching flight:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new flight
const createFlight = async (req, res) => {
  const { name, time, userId} = req.body;
  if (!name || !time) {
    return res.status(400).json({ message: "Name and time are required" });
  }

  try {
    const { data, error } = await db
      .from('flights')
      .insert([{ name, time, userId}])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating flight:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an existing flight
const updateFlight = async (req, res) => {
  const { name, time } = req.body;
  try {
    const { data, error } = await db
      .from('flights')
      .update({ name, time })
      .eq('id', req.params.id)
      .select();

    if (error || !data || data.length === 0) {
      return res.status(404).json({ message: "Flight not found" });
    }
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating flight:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete a flight
const deleteFlight = async (req, res) => {
  try {
    const { error } = await db
      .from('flights')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting flight:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export controller functions
module.exports = {
  getAllFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight
};

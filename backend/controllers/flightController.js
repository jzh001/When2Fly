const flights = require("../data/flightsData");
const db = require("../db");

// Get all flights for the authenticated user
const getAllFlights = async (req, res) => {
  try {
    const { data, error } = await db
      .from("flights")
      .select("*")
      .eq("userId", req.user.id); // Filter by authenticated user's ID

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching flights:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get a single flight by ID for the authenticated user
const getFlightById = async (req, res) => {
  try {
    const { data, error } = await db
      .from("flights")
      .select("*")
      .eq("id", req.params.id)
      .eq("userId", req.user.id) // Ensure the flight belongs to the authenticated user
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

// Create a new flight for the authenticated user
const createFlight = async (req, res) => {
  const { name, time } = req.body;
  if (!name || !time) {
    return res.status(400).json({ message: "Name and time are required" });
  }

  try {
    const { data, error } = await db
      .from("flights")
      .insert([{ name, time, userId: req.user.id }]) // Use userId from the authenticated user
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error creating flight:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update an existing flight for the authenticated user
const updateFlight = async (req, res) => {
  const { name, time } = req.body;
  try {
    const { data, error } = await db
      .from("flights")
      .update({ name, time })
      .eq("id", req.params.id)
      .eq("userId", req.user.id) // Ensure the flight belongs to the authenticated user
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

// Delete a flight for the authenticated user
const deleteFlight = async (req, res) => {
  try {
    const { error } = await db
      .from("flights")
      .delete()
      .eq("id", req.params.id)
      .eq("userId", req.user.id); // Ensure the flight belongs to the authenticated user

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
  deleteFlight,
};
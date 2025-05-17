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

// Get flights within interval hours of queried time
const getFlightsInTimeRange = async (req, res) => {
  const { time, interval } = req.query;
  if (!time || !interval) {
    return res.status(400).json({ message: "Time and interval are required" });
  }

  try {
    const queryTime = new Date(time); // Input time
    const minTime = new Date(queryTime.getTime() - interval * 60 * 60 * 1000); // Subtract interval
    const maxTime = new Date(queryTime.getTime() + interval * 60 * 60 * 1000); // Add interval

    // console.log("Query time:", queryTime.toISOString());
    // console.log("Min time:", minTime.toISOString());
    // console.log("Max time:", maxTime.toISOString());

    const { data, error } = await db
      .from("flights")
      .select("*")
      .eq("userId", req.user.id)
      .gte("time", minTime.toISOString())
      .lte("time", maxTime.toISOString());

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // console.log("Database result:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching flights in time range:", error);
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

// Get all flights for a specific user
const getFlightsByUser = async (req, res) => {
  const userId = req.params.userId;
  
  try {
    const { data, error } = await db
      .from("flights")
      .select("*")
      .eq("userId", userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Error fetching user flights:", error);
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
  getFlightsInTimeRange,
  getFlightsByUser
};
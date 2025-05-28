const db = require("../db");

const getAllFlights = async (req, res) => {
  try {
    const { data, error } = await db
      .from("flights")
      .select("*")

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
      .eq("userId", req.user.userId) // Ensure the flight belongs to the authenticated user
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
      .eq("userId", req.user.userId)
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

const getAllFlightsInTimeRange = async (req, res) => {
  const { time, interval } = req.query;
  if (!time || !interval) {
    return res.status(400).json({ message: "Time and interval are required" });
  }

  try {
    const now = new Date().toISOString();
    const queryTime = new Date(time);
    const maxTime = new Date(queryTime.getTime() + interval * 60 * 60 * 1000).toISOString();

    const { data, error } = await db
      .from("flights")
      .select("*, users(name)")
      .gte("time", now)
      .lte("time", maxTime);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching all flights in time range:", error);
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
    // 1. Insert the new flight
    const { data, error } = await db
      .from("flights")
      .insert([{ name, time, userId: req.user.userId }])
      .select();

    if (error) throw error;
    const newFlight = data[0];

    // 2. Find all flights and their users within 2 hours of the new flight's time (excluding the creator)
    const flightTime = new Date(time);
    const minTime = new Date(flightTime.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const maxTime = new Date(flightTime.getTime() + 2 * 60 * 60 * 1000).toISOString();

    const { data: nearbyFlights, error: nearbyError } = await db
      .from("flights")
      .select(`
        userId,
        name,
        users (
          name
        )
      `)
      .neq("userId", req.user.userId)
      .gte("time", minTime)
      .lte("time", maxTime);

    if (nearbyError) throw nearbyError;

    // Get unique userIds and prepare notifications for other users
    const userIds = [...new Set(nearbyFlights.map(f => f.userId))];
    const notifications = userIds.map(userId => ({
      google_id: userId,
      message: `A new flight "${name}" was added within 2 hours of your flight.`,
      isRead: false,
      created_at: new Date().toISOString()
    }));

    // Prepare notifications for the current user about other users' flights
    const currentUserNotifications = nearbyFlights.map(flight => ({
      google_id: req.user.userId,
      message: `User ${flight.users.name} has a flight "${flight.name}" within 2 hours of your new flight.`,
      isRead: false,
      created_at: new Date().toISOString()
    }));

    // Combine all notifications
    const allNotifications = [...notifications, ...currentUserNotifications];

    if (allNotifications.length > 0) {
      const { error: notifError } = await db
        .from("notifications")
        .insert(allNotifications);

      if (notifError) throw notifError;
    }

    res.status(201).json(newFlight);
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
      .eq("userId", req.user.userId) // Ensure the flight belongs to the authenticated user
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
      .eq("userId", req.user.userId); // Ensure the flight belongs to the authenticated user

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
  getFlightsByUser,
  getAllFlightsInTimeRange
};
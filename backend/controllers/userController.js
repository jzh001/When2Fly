const db = require("../db");

const updateUserName = async (req, res) => {
    try {
        const { userId, newName } = req.body;

        if (!userId || !newName) {
            return res.status(400).json({ message: 'User ID and new name are required' });
        }

        const { data, error } = await db
            .from("users")
            .update({ name: newName })
            .eq("google_id", userId)
            .select();

        if (error) {
            return res.status(500).json({
                success: false,
                message: 'Error updating user name',
                error: error.message
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            data: data[0]
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user name',
            error: error.message
        });
    }
};

const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id || req.user.google_id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await db
      .from("users")
      .select("google_id, name, email")
      .eq("google_id", userId)
      .single();

    if (error || !data) return res.status(404).json({ error: "User not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateUserTimezone = async (req, res) => {
    const { userId, timezone } = req.body;
    if (!userId || !timezone) return res.status(400).json({ message: "Missing fields" });
    const { error } = await db.from("users").update({ timezone }).eq("google_id", userId);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
};


module.exports = {
    updateUserName,
    getCurrentUser,
    updateUserTimezone,
};
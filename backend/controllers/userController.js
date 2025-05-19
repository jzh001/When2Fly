const db = require("../db");

// Update user's name
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

module.exports = {
    updateUserName
};
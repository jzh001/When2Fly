 const db = require("../db");

const getNotifications = async (req, res) => {
 try {
    const { data, error } = await db
      .from("notifications")
	  .select(' message, created_at')
	  .eq('google_id', req.user.id)
	  .eq('isRead', false)
	  .order('created_at', { ascending: false });
     

    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const readNotification = async (req, res) => {
  try {
    const { data, error } = await db
      .from("notifications")
      .update({ isRead: true })
      .eq('google_id', req.user.id)
      .eq('id', req.params.id);

    if (error) throw error;

    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getNotifications,
  readNotification
};

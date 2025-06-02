const db = require("../db");

const getNotifications = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const { data, error } = await db
      .from("notifications")
      .select(' message, created_at, id, isRead')
      .eq('google_id', req.user.userId)
      .or(`isRead.eq.false,created_at.gte.${sevenDaysAgo.toISOString()}`)
      .order('created_at', { ascending: false });


    if (error) throw error;

    return res.json(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const toggleNotification = async (req, res) => {
  try {
    const { data, fetchError } = await db
      .from("notifications")
      .select("isRead")
      .eq('google_id', req.user.userId)
      .eq('id', req.params.id);

    if (fetchError) throw error;
    if (!data || !data[0]) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const isReadNot = !data[0]?.isRead;

    const { wData, error } = await db
      .from("notifications")
      .update({ isRead: isReadNot })
      .eq('google_id', req.user.userId)
      .eq('id', req.params.id);
    
    if (error) throw error;

    return res.json({ message: `Notification marked as ${isReadNot ? "read" : "unread"}`, isRead: isReadNot });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  getNotifications,
  toggleNotification
};
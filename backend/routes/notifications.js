const express = require("express");
const router = express.Router();
const { getNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/notifications", getNotifications); 

module.exports = router;

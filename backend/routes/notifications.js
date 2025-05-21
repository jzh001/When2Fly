const express = require("express");
const router = express.Router();
const { getNotifications, readNotification,createNotification, } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/", createNotification);
router.post("/read/:id", readNotification);

module.exports = router;

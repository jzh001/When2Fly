const express = require("express");
const router = express.Router();
const { updateUserName, getCurrentUser } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const { updateUserTimezone } = require("../controllers/userController");

router.use(authMiddleware);

router.put("/update-timezone", updateUserTimezone);
router.put("/update-name", updateUserName);
router.get("/", getCurrentUser);

module.exports = router;
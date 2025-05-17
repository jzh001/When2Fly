const express = require("express");
const router = express.Router();
const { updateUserName } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

// Route to update user's name
router.put("/update-name", updateUserName);

module.exports = router;
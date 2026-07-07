const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addFeedback,
} = require("../controllers/feedbackController");

router.post(
  "/add",
  authMiddleware,
  addFeedback
);

module.exports = router;
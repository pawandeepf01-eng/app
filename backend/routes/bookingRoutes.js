const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createBooking,
    getWorkerBookings
} = require("../controllers/bookingController");

router.post(
  "/create/:workerId",
  authMiddleware,
  createBooking
);
router.get(
  "/worker",
  authMiddleware,
  getWorkerBookings
);

module.exports = router;
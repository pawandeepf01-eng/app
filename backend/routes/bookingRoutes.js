const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createBooking,
  getWorkerBookings,
    acceptBooking,
    rejectBooking,
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

router.put(
  "/accept/:bookingId",
  authMiddleware,
  acceptBooking
);

router.put(
  "/reject/:bookingId",
  authMiddleware,
  rejectBooking
);

module.exports = router;
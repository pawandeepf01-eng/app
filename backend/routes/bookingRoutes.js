const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createBooking,
  getWorkerBookings,
  acceptBooking,
  rejectBooking,
  getMyBookings,
  completeBooking,
  updateBooking,
} = require("../controllers/bookingController");

router.post("/create/:workerId", authMiddleware, createBooking);
router.get("/worker", authMiddleware, getWorkerBookings);

router.put("/accept/:bookingId", authMiddleware, acceptBooking);

router.put("/reject/:bookingId", authMiddleware, rejectBooking);
router.get("/my-bookings", authMiddleware, getMyBookings);
router.put("/complete/:bookingId", authMiddleware, completeBooking);
router.put("/update/:bookingId", authMiddleware, updateBooking);
module.exports = router;

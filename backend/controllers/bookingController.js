const Booking = require("../models/Booking");
const User = require("../models/User");
const sendNotification = require("../utils/sendNotification");

const createBooking = async (req, res) => {
  try {
    const { workerId } = req.params;

    const { serviceType, address, date, description } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can book workers",
      });
    }

    const worker = await User.findById(workerId);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    if (worker.role !== "worker") {
      return res.status(400).json({
        success: false,
        message: "Selected user is not a worker",
      });
    }

    if (!worker.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Worker is unavailable",
      });
    }

    const alreadyBooked = await Booking.findOne({
      customerId: req.user.id,
      workerId,
      status: "Pending",
    });

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending booking with this worker",
      });
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      workerId,
      serviceType,
      address,
      date,
      description,
    });
    if (worker.fcmToken) {
      await sendNotification({
        userId: worker._id,
        token: worker.fcmToken,
        title: "New Booking",
        body: "You have received a new booking request.",
        type: "booking",
        referenceId: booking._id,
      });
    }

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getWorkerBookings = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can view bookings",
      });
    }

    const bookings = await Booking.find({
      workerId: req.user.id,
    })
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    const pendingCount = await Booking.countDocuments({
      workerId: req.user.id,
      status: "Pending",
    });

    res.status(200).json({
      success: true,
      total: bookings.length,
      pendingCount,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can delete booking requests",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending booking requests can be deleted",
      });
    }

    const worker = await User.findById(booking.workerId);

    await Booking.findByIdAndDelete(bookingId);

    if (worker?.fcmToken) {
      await sendNotification(
        worker.fcmToken,
        "Booking Cancelled",
        "The customer cancelled the booking request.",
      );
    }
    res.status(200).json({
      success: true,
      message: "Booking request deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can accept bookings",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.workerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Booking already processed",
      });
    }

    booking.status = "Accepted";

    await booking.save();

    const customer = await User.findById(booking.customerId);

    if (customer?.fcmToken) {
      await sendNotification(
        customer.fcmToken,
        "Booking Accepted",
        "Your booking request has been accepted by the worker.",
      );
    }

    res.status(200).json({
      success: true,
      message: "Booking accepted successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rejectionReason } = req.body;

    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can reject bookings",
      });
    }

    if (!rejectionReason || rejectionReason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.workerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Booking already processed",
      });
    }

    booking.status = "Rejected";
    booking.rejectionReason = rejectionReason;

    await booking.save();
    const customer = await User.findById(booking.customerId);

    if (customer?.fcmToken) {
      await sendNotification(
        customer.fcmToken,
        "Booking Rejected",
        `Your booking request was rejected. Reason: ${rejectionReason}`,
      );
    }

    res.status(200).json({
      success: true,
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can view their bookings",
      });
    }

    const bookings = await Booking.find({
      customerId: req.user.id,
    })
      .populate("workerId", "name phone serviceType")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings: bookings.map((booking) => ({
        _id: booking._id,
        worker: booking.workerId,
        serviceType: booking.serviceType,
        address: booking.address,
        date: booking.date,
        time: booking.time,
        description: booking.description,
        status: booking.status,
        rejectionReason: booking.rejectionReason || "",
        createdAt: booking.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can complete bookings",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
        bookingCustomerId: booking.customerId,
        loggedInUser: req.user.id,
      });
    }

    if (booking.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Booking is already completed",
      });
    }

    if (booking.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted bookings can be completed",
      });
    }

    booking.status = "Completed";

    await booking.save();
    const worker = await User.findById(booking.workerId);

    if (worker?.fcmToken) {
      await sendNotification(
        worker.fcmToken,
        "Service Completed",
        "The customer has marked this booking as completed.",
      );
    }

    res.status(200).json({
      success: true,
      message: "Booking marked as completed",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { serviceType, address, date, time, description } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can update bookings",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (booking.customerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "Booking cannot be updated after it has been accepted or rejected",
      });
    }

    booking.serviceType = serviceType || booking.serviceType;
    booking.address = address || booking.address;
    booking.date = date || booking.date;
    booking.time = time || booking.time;
    booking.description = description || booking.description;

    await booking.save();
    const worker = await User.findById(booking.workerId);

    if (worker?.fcmToken) {
      await sendNotification(
        worker.fcmToken,
        "Booking Updated",
        "The customer has updated the booking details. Please review the changes.",
      );
    }

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getWorkerBookings,
  rejectBooking,
  acceptBooking,
  getMyBookings,
  completeBooking,
  updateBooking,
  deleteBooking,
};

const Booking = require("../models/Booking");
const User = require("../models/User");

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

    res.status(200).json({
      success: true,
      total: bookings.length,
      bookings,
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

    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can complete bookings",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check worker owns this booking
    if (booking.workerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Booking must be accepted first
    if (booking.status !== "Accepted") {
      return res.status(400).json({
        success: false,
        message: "Only accepted bookings can be completed",
      });
    }

    booking.status = "Completed";

    await booking.save();

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

module.exports = {
  createBooking,
  getWorkerBookings,
  rejectBooking,
  acceptBooking,
  getMyBookings,
  completeBooking,
};

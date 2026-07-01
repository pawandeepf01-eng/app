const Booking = require("../models/Booking");
const User = require("../models/User");

const createBooking = async (req, res) => {
  try {
    const { workerId } = req.params;

    const {
      serviceType,
      address,
      date,
      description,
    } = req.body;

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

    // Worker can accept only his own booking
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

    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can reject bookings",
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

module.exports = {
    createBooking,
  getWorkerBookings,
    rejectBooking,
    acceptBooking,
};
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const User = require("../models/User");



const addReview = async (req, res) => {
  try {
    const { workerId } = req.params;
    const { rating, review } = req.body;

    if (req.user.role !== "customer") {
      return res.status(403).json({
        success: false,
        message: "Only customers can review.",
      });
    }

    const worker = await User.findById(workerId);

    if (!worker || worker.role !== "worker") {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    await Review.create({
      customerId: req.user.id,
      workerId,
      rating,
      review,
    });

    const reviews = await Review.find({ workerId });

    const totalReviews = reviews.length;

    const averageRating =
      reviews.reduce((sum, item) => sum + item.rating, 0) / totalReviews;

    await User.findByIdAndUpdate(workerId, {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addReview };


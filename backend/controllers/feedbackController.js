const Feedback = require("../models/Feedback");

const addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const newFeedback = await Feedback.create({
      userId: req.user.id,
      role: req.user.role,
      rating,
      feedback,
    });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: newFeedback,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addFeedback,
};
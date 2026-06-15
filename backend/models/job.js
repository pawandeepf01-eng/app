const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    address: {
      type: String,
    },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    budget: {
      type: Number,
    },
    photo: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);

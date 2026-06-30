const Job = require("../models/job");

const createJob = async (req, res) => {
  try {
    const { description, category, address, date, time, budget } = req.body;

    const job = await Job.create({
      userId: req.user.id,
      description,
      category,
      address,
      date,
      time,
      budget,
      photo: req.file ? req.file.path : "",
    });

    res.status(201).json({
      success: true,
      message: "Job Posted Successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const { search, category } = req.query;

    let filter = {};

    // Customer sees only their own jobs
    if (req.user.role === "customer") {
      filter.userId = req.user.id;
    }

    // Worker sees all jobs

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(filter)
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Job.countDocuments(filter);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      total,
      jobs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createJob,
  getJobs,
};

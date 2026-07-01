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

const User = require("../models/User");

const bookJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Only workers can accept jobs
    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can accept jobs",
      });
    }

    const worker = await User.findById(req.user.id);

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    if (!worker.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Worker is unavailable",
      });
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (job.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Job already accepted by another worker",
      });
    }

    job.workerId = req.user.id;
    job.status = "Accepted";

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job accepted successfully",
      job,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyAcceptedJobs = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can view accepted jobs",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const jobs = await Job.find({
      workerId: req.user.id,
    })
      .populate("userId", "name phone")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalJobs = await Job.countDocuments({
      workerId: req.user.id,
    });

    const totalPending = await Job.countDocuments({
      workerId: req.user.id,
      status: "Pending",
    });

    const totalAccepted = await Job.countDocuments({
      workerId: req.user.id,
      status: "Accepted",
    });

    const totalCompleted = await Job.countDocuments({
      workerId: req.user.id,
      status: "Completed",
    });

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(totalJobs / limit),

      counts: {
        totalJobs,
        totalPending,
        totalAccepted,
        totalCompleted,
      },

      jobs,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Only the customer who created the job can delete it
    if (job.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this job",
      });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
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
  bookJob,
  getMyAcceptedJobs,
  deleteJob,
};

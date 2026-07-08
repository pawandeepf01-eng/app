const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const register = async (req, res) => {
  try {
    const {
      name,
      phone,
      password,
      role,
      serviceType,
      fcmToken
    } = req.body;

    const exists = await User.findOne({ phone });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const user = await User.create({
      name,
      phone,
      password: hashedPassword,
      role,
      serviceType,
      fcmToken
    });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      token,
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const login = async (req, res) => {
  try {
    const { phone, password ,fcmToken} = req.body;

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

      if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const Review = require("../models/Review");

const getWorkers = async (req, res) => {
  try {
    const { search = "", serviceType = "" } = req.query;

    let filter = {
      role: "worker",
    };

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const workers = await User.find(filter)
      .select("-password")
      .sort({
        averageRating: -1,
        totalReviews: -1,
      });

    const workersWithReviews = await Promise.all(
      workers.map(async (worker) => {
        const reviews = await Review.find({
          workerId: worker._id,
        })
          .populate("customerId", "name")
          .sort({ createdAt: -1 });

        return {
          ...worker.toObject(),
          reviews,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: workersWithReviews.length,
      workers: workersWithReviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, serviceType } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        phone,
        serviceType,
      },
      {
        new: true,
      }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "worker") {
      return res.status(403).json({
        success: false,
        message: "Only workers can change availability",
      });
    }

    user.isAvailable = isAvailable;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Availability Updated Successfully",
      user,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const likeWorker = async (req, res) => {
  try {
    const workerId = req.params.workerId;
    const customerId = req.user.id;

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
        message: "User is not a worker",
      });
    }

    const alreadyLiked = worker.likedBy.includes(customerId);

    if (alreadyLiked) {
      worker.likedBy.pull(customerId);

      await worker.save();

      return res.status(200).json({
        success: true,
        message: "Worker Unliked",
        isLiked: false,
      });
    }

    worker.likedBy.push(customerId);

    await worker.save();

    res.status(200).json({
      success: true,
      message: "Worker Liked",
      isLiked: true,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  getWorkers,
  updateProfile,
  getProfile,
  updateAvailability,
  likeWorker,
};
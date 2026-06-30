const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  getWorkers,
  updateProfile,
  getProfile,
  updateAvailability,
  likeWorker,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/workers", getWorkers);
router.put("/profile", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getProfile);
router.put("/availability", authMiddleware, updateAvailability);
router.put("/like/:workerId", authMiddleware, likeWorker);
module.exports = router;

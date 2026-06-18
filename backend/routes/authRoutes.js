const express = require("express");

const router = express.Router();

const {
  register,
  login,
  forgotPassword,
  getWorkers,
  updateProfile,
  getProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/workers", getWorkers);
router.put("/profile", authMiddleware, updateProfile);
router.get("/profile", authMiddleware, getProfile);
module.exports = router;

const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createJob,getJobs,getJobsByCategory
} = require("../controllers/jobController");

router.post(
  "/create",
  authMiddleware,
  upload.single("photo"),
  createJob
);

router.get("/", getJobs);
router.get(
  "/category/:category",
  getJobsByCategory
);

module.exports = router;
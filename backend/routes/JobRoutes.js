const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createJob, getJobs,
  bookJob,
  getMyAcceptedJobs,
} = require("../controllers/jobController");

router.post(
  "/create",
  authMiddleware,
  upload.single("photo"),
  createJob
);

router.get("/", authMiddleware, getJobs);

router.put(
  "/book/:jobId",
  authMiddleware,
  bookJob
);

router.get(
  "/my-accepted-jobs",
  authMiddleware,
  getMyAcceptedJobs
);

module.exports = router;
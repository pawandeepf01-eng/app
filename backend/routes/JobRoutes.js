const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createJob,getJobs
} = require("../controllers/jobController");

router.post(
  "/create",
  authMiddleware,
  upload.single("photo"),
  createJob
);

router.get("/", getJobs);

module.exports = router;
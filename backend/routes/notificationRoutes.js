const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationController");

router.get("/", authMiddleware, getNotifications);
router.patch("/:notificationId/read", authMiddleware, markAsRead);

router.patch("/read-all", authMiddleware, markAllAsRead);

router.delete("/:notificationId", authMiddleware, deleteNotification);

router.delete("/", authMiddleware, deleteAllNotifications);

module.exports = router;

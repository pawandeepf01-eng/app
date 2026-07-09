const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      total: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getNotifications,
};
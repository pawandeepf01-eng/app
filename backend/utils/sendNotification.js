const { getMessaging } = require("firebase-admin/messaging");
const Notification = require("../models/Notification");

const sendNotification = async ({
  userId,
  token,
  title,
  body,
  type = "system",
  referenceId = null,
}) => {
  try {
    // Save notification in database
    await Notification.create({
      userId,
      title,
      body,
      type,
      referenceId,
    });

    // Send push notification
    if (token) {
      const response = await getMessaging().send({
        token,
        notification: {
          title,
          body,
        },
        data: {
          type,
          referenceId: referenceId ? referenceId.toString() : "",
        },
      });

      console.log("Notification sent:", response);
    }
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = sendNotification;
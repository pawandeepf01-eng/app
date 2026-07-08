const { getMessaging } = require("firebase-admin/messaging");

const sendNotification = async (token, title, body) => {
  try {
    const response = await getMessaging().send({
      token,
      notification: {
        title,
        body,
      },
    });

    console.log("Notification sent:", response);
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = sendNotification;
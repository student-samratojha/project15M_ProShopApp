const notificationModel = require("../db/models/notification.model");

async function sendNotification(userId, message, type = "system", link = "#") {
  try {
    const notification = new notificationModel({
      user: userId,
      message,
      type,
      link,
    });
    await notification.save();
    return true;
  } catch (error) {
    console.error("Notification Error:", error.message);
    return false;
  }
}

module.exports = { sendNotification };
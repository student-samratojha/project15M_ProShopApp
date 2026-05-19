const shippedModel = require("../db/models/shipped.model");
const bookingModel = require("../db/models/booking.model");
const userModel = require("../db/models/user.model");
const { auditLog } = require("../helper/audit.helper");
const { sendNotification } = require("../helper/notification.helper");
async function manageShipped(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    auditLog(
      req,
      res,
      "Accessed Manage Shipped",
      `User ${user.username} accessed the manage shipped page.`,
      false,
      "info",
    );
    const shipped = await shippedModel
      .find({ employee: userId })
      .populate("booking");
    if (shipped.length === 0) {
      return res.render("manageShipped", { shipped: [], user });
    }

    res.render("employee/manageShipped", { shipped, user });
  } catch (error) {
    console.error("Error fetching shipped:", error);
    res.redirect("/employee/dashboard?error=Unable to fetch shipped");
  }
}
async function updateShipped(req, res) {
  try {
    const shippedId = req.body.id;

    const { detailes, currentCity, currentAddress } = req.body;

    const shipped = await shippedModel.findById(shippedId);

    if (!shipped) {
      await auditLog(
        req,
        res,
        "Failed Shipped Update",
        `User ${req.user.username} attempted to update a shipped that does not exist.`,
        false,
        "warning",
      );

      return res.redirect("/employee/dashboard?error=Shipped not found");
    }

    // Populate booking to get customer ID for notification
    await shipped.populate({
      path: 'booking',
      populate: { path: 'product user' } // Populate product and user within booking
    });
    const customerId = shipped.booking.user._id;

    shipped.detailes = detailes;
    shipped.currentCity = currentCity;
    shipped.currentAddress = currentAddress;

    // DEFAULT VALUES
    let trackingStatus = "shipped";
    let trackingMessage = `Package reached ${currentCity}`;

    // DELIVERY CITY CHECK
    if (currentCity.toLowerCase() === shipped.deliveryCity.toLowerCase()) {
      shipped.status = "arrived_at_your_nearest_hub";

      trackingStatus = "arrived_at_your_nearest_hub";

      trackingMessage = `Package arrived at MotherHub ${currentCity}`;
    }

    // LAST LOG CHECK
    const lastLog = shipped.trackingLogs[shipped.trackingLogs.length - 1];

    // ONLY PUSH IF DIFFERENT
    if (
      !lastLog ||
      lastLog.city !== currentCity ||
      lastLog.status !== trackingStatus
    ) {
      shipped.trackingLogs.push({
        status: trackingStatus,
        city: currentCity,
        address: currentAddress,
        message: trackingMessage,
        time: new Date(),
      });
    }

    await shipped.save();

    await auditLog(
      req,
      res,
      "Shipped Updated",
      `User ${req.user.username} updated shipped.`,
      false,
      "info",
    );

    // Notify customer about shipping update
    await sendNotification(
      customerId,
      `Your order for ${shipped.booking.product.name} is now ${shipped.status.replace(/_/g, ' ')}.`,
      "shipping",
      "/customer/bookings/manage",
    );
    res.redirect("/employee/dashboard?success=Shipped updated successfully");
  } catch (error) {
    console.error("Error update shipped:", error);

    res.redirect("/employee/dashboard?error=Unable to update shipped");
  }
}
module.exports = {
  manageShipped,
  updateShipped,
};

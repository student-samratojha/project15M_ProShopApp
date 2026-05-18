const shippedModel = require("../db/models/shipped.model");
const bookingModel = require("../db/models/booking.model");
const userModel = require("../db/models/user.model");
const { auditLog } = require("../helper/audit.helper");
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
    res.redirect("/secure/employee?error=Unable to fetch shipped");
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

      return res.redirect("/secure/employee?error=Shipped not found");
    }

    shipped.detailes = detailes;

    shipped.currentCity = currentCity;

    shipped.currentAddress = currentAddress;

    // DEFAULT STATUS
    let trackingStatus = "shipped";

    let trackingMessage = `Package reached ${currentCity}`;

    // IF REACHED DELIVERY CITY
    if (
      currentCity.toLowerCase() ===
      shipped.deliveryCity.toLowerCase()
    ) {
      shipped.status = "arrived_at_your_nearest_hub";

      trackingStatus = "arrived_at_your_nearest_hub";

      trackingMessage = `Package arrived at MotherHub ${currentCity}`;
    }

    // PUSH TRACKING LOG
    shipped.trackingLogs.push({
      status: trackingStatus,

      city: currentCity,

      address: currentAddress,

      message: trackingMessage,

      time: new Date(),
    });

    await shipped.save();

    await auditLog(
      req,
      res,
      "Shipped Updated",
      `User ${req.user.username} updated shipped.`,
      false,
      "info",
    );

    res.redirect("/secure/employee?success=Shipped updated successfully");

  } catch (error) {
    console.error("Error update shipped:", error);

    res.redirect("/secure/employee?error=Unable to update shipped");
  }
}
module.exports = {
  manageShipped,
  updateShipped,
};

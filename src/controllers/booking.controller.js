const bookingModel = require("../db/models/booking.model");
const productModel = require("../db/models/product.model");
const userModel = require("../db/models/user.model");
const { auditLog }  = require("../helper/audit.helper");
async function manageBookings(req, res) {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId);
    auditLog(
      req,
      res,
      "Accessed Manage Bookings",
      `User ${user.username} accessed the manage bookings page.`,
      false,
      "info",
    );
    const bookings = await bookingModel
      .find({ user: userId })
      .populate("product");
    if (bookings.length === 0) {
      return res.render("manageBookings", { bookings: [], user });
    }
    res.render("manageBookings", { bookings, user });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.redirect("/secure/customer?error=Unable to fetch bookings");
  }
}

async function cancelBooking(req, res) {
  try {
    const bookingId = req.body.id;
    const booking = await bookingModel.findById(bookingId).populate("product");
    if (!booking) {
      await auditLog(
        req,
        res,
        "Failed Booking Cancellation",
        `User ${req.user.username} attempted to cancel a booking that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/secure/manage-bookings?error=Booking not found");
    }
    if (booking.user.toString() !== req.user.id) {
      await auditLog(
        req,
        res,
        "Failed Booking Cancellation",
        `User ${req.user.username} attempted to cancel a booking that does not belong to them.`,
        false,
        "warning",
      );
      return res.redirect("/secure/manage-bookings?error=Unauthorized action");
    }
    if (booking.status === "cancelled") {
      await auditLog(
        req,
        res,

        "Failed Booking Cancellation",
        `User ${req.user.username} attempted to cancel a booking that is already cancelled.`,
        false,
        "warning",
      );
      return res.redirect(
        "/secure/manage-bookings?error=Booking is already cancelled",
      );
    }
    booking.status = "cancelled";
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Cancelled",
      `User ${req.user.username} cancelled booking for product ${booking.product.name}.`,
      false,
      "info",
    );
    res.redirect(
      "/secure/manage-bookings?success=Booking cancelled successfully",
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.redirect("/secure/manage-bookings?error=Unable to cancel booking");
  }
}

async function makeBooking(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.query;
    const product = await productModel.findById(id);
    if (!product) {
      await auditLog(
        req,
        res,
        "Failed Access to Make Booking",
        `User ${req.user.username} attempted to access the make booking page for a product that does not exist.`,
        false,
        "warning",
      );

      return res.redirect("/secure/customer?error=Product not found");
    }
    const user = await userModel.findById(userId);
    auditLog(
      req,
      res,

      "Accessed Make Booking",
      `User ${user.username} accessed the make booking page.`,
      false,
      "info",
    );
    res.render("makeBooking", { product, user });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.redirect("/secure/customer?error=Unable to fetch products");
  }
}

async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const {
      productId,
      quantity,
      deliveryAddress,
      paymentMethod,
      deliveryDate,
    } = req.body;
    const product = await productModel.findById(productId);
    if (!product) {
      await auditLog(
        req,
        res,
        "Failed Booking Creation",
        `User ${req.user.username} attempted to create a booking for a product that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/secure/customer?error=Product not found");
    }
    const user = await userModel.findById(userId);
    const totalPrice = product.price * quantity;
    const booking = new bookingModel({
      user: userId,
      product: productId,
      quantity,
      totalPrice,
      deliveryAddress,
      paymentMethod,
      deliveryDate,
    });
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Created",
      `User ${user.username} created a booking for product ${product.name}.`,
      false,
      "info",
    );
    res.redirect(
      "/secure/manage-bookings?success=Booking created successfully",
    );
  } catch (error) {
    console.error("Error creating booking:", error);
    res.redirect("/secure/customer?error=Unable to create booking");
  }
}

async function updateBooking(req, res) {
  try {
    const bookingId = req.body.id;
    const { status } = req.body;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      await auditLog(
        req,

        res,
        "Failed Booking Update",
        `User ${req.user.username} attempted to update a booking that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/secure/employee?error=Booking not found");
    }
    booking.status = status;
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Updated",
      `User ${req.user.username} updated booking status to ${status}.`,
      false,
      "info",
    );
    res.redirect("/secure/employee?success=Booking updated successfully");
  } catch (error) {
    console.error("Error updating booking:", error);
    res.redirect("/secure/employee?error=Unable to update booking");
  }
}

async function viewAllBookings(req, res) {
  try {
    const bookings = await bookingModel
      .find()
      .populate("user")
      .populate("product");

    const user = await userModel.findById(req.user.id);
    auditLog(
      req,
      res,
      "Accessed All Bookings",
      `User ${user.username} accessed the all bookings page.`,
      false,
      "info",
    );
    res.render("allBookings", { bookings, admin: user });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.redirect("/secure/admin?error=Unable to fetch bookings");
  }
}

async function assignBooking(req, res) {
  try {
    const bookingId = req.body.id;
    const employeeId = req.body.employeeId;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      await auditLog(
        req,
        res,
        "Failed Booking Assignment",
        `User ${req.user.username} attempted to assign a booking that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/secure/admin?error=Booking not found");
    }
    const employee = await userModel.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      await auditLog(
        req,
        res,
        "Failed Booking Assignment",
        `User ${req.user.username} attempted to assign a booking to a user that is not an employee.`,
        false,
        "warning",
      );
      return res.redirect("/secure/admin?error=Employee not found");
    }
    booking.assignedTo = employeeId;
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Assigned",
      `User ${req.user.username} assigned booking to employee ${employee.username}.`,
      false,
      "info",
    );
    res.redirect("/secure/admin?success=Booking assigned successfully");
  } catch (error) {
    console.error("Error assigning booking:", error);
    res.redirect("/secure/admin?error=Unable to assign booking");
  }
}

async function employeeBookManage(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await bookingModel
      .find({ assignedTo: userId })
      .populate("product")
      .populate("user");
    const employee = await userModel.findById(userId);
    if (bookings.length === 0) {
      await auditLog(
        req,
        res,
        "Accessed Employee Booking Management",
        `Employee ${employee.username} accessed the employee booking management page but has no assigned bookings.`,
        false,
        "info",
      );
      return res.render("employeeBookings", { bookings: [], employee });
    }
    auditLog(
      req,
      res,
      "Accessed Employee Booking Management",
      `Employee ${employee.username} accessed the employee booking management page.`,
      false,
      "info",
    );
    res.render("employeeBookings", { bookings, employee });
  } catch (error) {
    console.error("Error fetching employee bookings:", error);
    res.redirect("/secure/employee?error=Unable to fetch bookings");
  }
}

module.exports = {
  manageBookings,
  cancelBooking,
  makeBooking,
  createBooking,
  updateBooking,
  viewAllBookings,
  assignBooking,
  employeeBookManage,
};

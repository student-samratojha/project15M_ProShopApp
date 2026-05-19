const bookingModel = require("../db/models/booking.model");
const productModel = require("../db/models/product.model");
const shippedModel = require("../db/models/shipped.model");
const userModel = require("../db/models/user.model");
const { sendNotification } = require("../helper/notification.helper");
const { auditLog } = require("../helper/audit.helper");
async function manageBookings(req, res) {
  try {
    const userId = req.user.id;
    auditLog(
      req,
      res,
      "Accessed Manage Bookings",
      `User ${req.user.username} accessed the manage bookings page.`,
      false,
      "info",
    );
    const bookings = await bookingModel
      .find({ user: userId })
      .populate("product")
      .populate("shipped")
      .populate("assignedTo");
    if (bookings.length === 0) {
      return res.render("customer/manageBookings", { bookings: [], user: req.user });
    }
    res.render("customer/manageBookings", { bookings, user: req.user });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.redirect("/customer/dashboard?error=Unable to fetch bookings");
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
      return res.redirect("/customer/bookings/manage?error=Booking not found");
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
      return res.redirect("/customer/bookings/manage?error=Unauthorized action");
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
        "/customer/bookings/manage?error=Booking is already cancelled",
      );
    }
    booking.status = "cancelled";
    await booking.save();
    const product = await productModel.findById(booking.product);
    product.stock += booking.quantity;
    await product.save();
    await auditLog(
      req,
      res,
      "Booking Cancelled",
      `User ${req.user.username} cancelled booking for product ${booking.product.name}.`,
      false,
      "info",
    );
    await sendNotification(
      req.user.id,
      `Your booking for ${booking.product.name} has been cancelled.`,
      "booking",
      "/customer/bookings/manage",
    );

    res.redirect(
      "/customer/bookings/manage?success=Booking cancelled successfully",
    );
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.redirect("/customer/bookings/manage?error=Unable to cancel booking");
  }
}

async function makeBooking(req, res) {
  try {
    const userId = req.user.id;
    const id = req.params.productId;
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

      return res.redirect("/customer/dashboard?error=Product not found");
    }
    auditLog(
      req,
      res,

      "Accessed Make Booking",
      `User ${req.user.username} accessed the make booking page.`,
      false,
      "info",
    );
    res.render("customer/makeBooking", { product, user: req.user });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.redirect("/customer/dashboard?error=Unable to fetch products");
  }
}
function adjustDate(inputDate) {
  const givenDate = new Date(inputDate);
  const currentDate = new Date();

  // Time difference in milliseconds
  const diffTime = givenDate - currentDate;

  // Convert into days
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Clone original date
  let resultDate = new Date(givenDate);

  // Agar 3 din se jyada gap hai
  if (Math.abs(diffDays) > 3) {
    resultDate.setDate(resultDate.getDate() - 1);
  } else {
    // warna 2 din aage
    resultDate.setDate(resultDate.getDate() + 2);
  }

  return resultDate.toDateString();
}

async function createBooking(req, res) {
  try {
    const userId = req.user.id;
    const {
      productId,
      quantity,
      selectedAddressIndex,
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
      return res.redirect("/customer/dashboard?error=Product not found");
    }
    const totalPrice = product.price * quantity + product.shippingCharge;
    const booking = new bookingModel({
      user: userId,
      product: productId,
      quantity,
      totalPrice,
      deliveryAddress: req.user.addresses[selectedAddressIndex],
      deliveryCity: req.user.addresses[selectedAddressIndex].city,
      paymentMethod,
      deliveryDate: adjustDate(deliveryDate),
    });
    product.stock -= quantity;
    await product.save();
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Created",
      `User ${req.user.username} created a booking for product ${product.name}.`,
      false,
      "info",
    );
    await sendNotification(
      userId,
      `Your booking for ${product.name} has been successfully created!`,
      "booking",
      "/customer/bookings/manage",
    );
    res.redirect("/customer/bookings/manage?success=Booking created successfully");
  } catch (error) {
    console.error("Error creating booking:", error);
    res.redirect("/customer/dashboard?error=Unable to create booking");
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

      return res.redirect("/employee/dashboard?error=Booking not found");
    }

    // Fetch product name for notification
    const product = await productModel.findById(booking.product);
    if (!product) {
      console.error("Product not found for booking notification.");
      // Continue without notification if product is missing
    }

    booking.status = status;

    const s = await shippedModel.create({
      booking: bookingId,

      employee: req.user.id,

      deliveryDate: booking.deliveryDate,

      details: "",

      currentCity: "Bangalore",

      currentAddress: "MotherHub Bangalore",

      deliveryAddress: booking.deliveryAddress,

      deliveryCity: booking.deliveryCity,

      status: "shipped",

      // FIRST TRACKING LOG
      trackingLogs: [
        {
          status: "shipped",

          city: "Bangalore",

          address: "MotherHub Bangalore",

          message: "Dispatched from MotherHub Bangalore",
        },
      ],
    });

    booking.shipped = s._id;

    await booking.save();

    await auditLog(
      req,
      res,
      "Booking Updated",
      `User ${req.user.username} updated booking status to ${status}.`,
      false,
      "info",
    );

    // Notify customer about booking status update
    if (product && booking.user) {
      await sendNotification(
        booking.user,
        `Your booking for ${product.name} has been marked as ${status}.`,
        "booking",
        "/customer/bookings/manage",
      );
    }
    res.redirect("/employee/ship/manage?success=Booking updated successfully");
  } catch (error) {
    console.error("Error updating booking:", error);

    res.redirect("/employee/dashboard?error=Unable to update booking");
  }
}
async function viewAllBookings(req, res) {
  try {
    const bookings = await bookingModel
      .find()
      .populate("user")
      .populate("product")
      .populate("assignedTo");
    const employees = await userModel.find({ role: "employee" });

    auditLog(
      req,
      res,
      "Accessed All Bookings",
      `User ${req.user.username} accessed the all bookings page.`,
      false,
      "info",
    );
    res.render("admin/allBookings", { bookings, employees, admin: req.user });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.redirect("/admin/dashboard?error=Unable to fetch bookings");
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
      return res.redirect("/admin/dashboard?error=Booking not found");
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
      return res.redirect("/admin/dashboard?error=Employee not found");
    }
    booking.assignedTo = employeeId;
    booking.status = "confirmed";
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Assigned",
      `User ${req.user.username} assigned booking to employee ${employee.username}.`,
      false,
      "info",
    );
    
    // Trigger Notification for Employee
    await sendNotification(
      employeeId,
      `New Booking Assigned: You have a new booking for ${booking.product.name}`,
      "booking",
      "/employee/bookings/manage"
    );

    res.redirect("/admin/dashboard?success=Booking assigned successfully");
  } catch (error) {
    console.error("Error assigning booking:", error);
    res.redirect("/admin/dashboard?error=Unable to assign booking");
  }
}

async function employeeBookManage(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await bookingModel
      .find({ assignedTo: userId })
      .populate("product")
      .populate("user")
      .populate("shipped");
    if (bookings.length === 0) {
      await auditLog(
        req,
        res,
        "Accessed Employee Booking Management",
        `Employee ${req.user.username} accessed the employee booking management page but has no assigned bookings.`,
        false,
        "info",
      );
      return res.render("employee/employeeBookings", {
        bookings: [],
        employee: req.user,
      });
    }
    auditLog(
      req,
      res,
      "Accessed Employee Booking Management",
        `Employee ${req.user.username} accessed the employee booking management page.`,
      false,
      "info",
    );
    res.render("employee/employeeBookings", { bookings, employee: req.user });
  } catch (error) {
    console.error("Error fetching employee bookings:", error);
    res.redirect("/employee/dashboard?error=Unable to fetch bookings");
  }
}

async function bookingPayment(req, res) {
  try {
    const bookingId = req.params.id;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      await auditLog(
        req,
        res,
        "Failed Booking Payment",
        `User ${req.user.username} attempted to pay for a booking that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/customer/dashboard?error=Booking not found");
    }
    if (booking.user.toString() !== req.user.id) {
      await auditLog(
        req,
        res,
        "Failed Booking Payment",
        `User ${req.user.username} make unauthorised attempted to pay`,
        false,
        "warning",
      );
      return res.redirect("/customer/dashboard?error=Unauthorized action");
    }
    res.render("customer/payment", { booking, user: req.user });
  } catch (error) {
    console.error("Error fetching booking", error.message);
    res.redirect("/customer/dashboard?error=Unable to fetch booking");
  }
}

async function bookingPaymentSuccess(req, res) {
  try {
    const { bookingId, transactionId, paymentMethod } = req.body;
    const booking = await bookingModel.findById(bookingId);
    if (!booking) {
      await auditLog(
        req,
        res,
        "Failed Booking Payment",
        "Failed Booking Payment",
        `User ${req.user.username} attempted to pay for a booking that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/customer/dashboard?error=Booking not found");
    }
    if (booking.user.toString() !== req.user.id) {
      await auditLog(
        req,
        res,
        "Failed Booking Payment",
        `User ${req.user.username} make unauthorised attempted to pay`,
        false,
        "warning",
      );
      return res.redirect("/customer/dashboard?error=Unauthorized action");
    }
    booking.paymentStatus = "paid";
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId;
    await booking.save();
    await auditLog(
      req,
      res,
      "Booking Payment Success",
      `User ${req.user.username} make successfull payment for booking ${booking.product.name}.`,
      false,
      "info",
    );
    await sendNotification(
      req.user.id,
      `Payment for your booking of ${booking.product.name} was successful!`,
      "payment",
      "/customer/bookings/manage",
    );
    res.redirect("/customer/dashboard?success=Payment successfull");
  } catch (error) {
    console.error("error while make payment", error.message);
    res.redirect("/customer/dashboard?error=Unable to make payment");
  }
}

module.exports = {
  manageBookings,
  cancelBooking,
  makeBooking,
  createBooking,
  updateBooking,
  viewAllBookings,
  bookingPayment,
  bookingPaymentSuccess,
  assignBooking,
  employeeBookManage,
};

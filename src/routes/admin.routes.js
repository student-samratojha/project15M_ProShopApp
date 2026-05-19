const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const bookingController = require("../controllers/booking.controller");
const feedbackController = require("../controllers/feedback.controller");
const categoryController = require("../controllers/category.controller");
const { verifyToken, verifyRoles } = require("../middlewares/auth.middleware");

// Middleware to ensure only Admin can access these
router.use(verifyToken, verifyRoles("admin"));

// Dashboard
router.get("/dashboard", secureController.adminDashboard);

// User Management
router.post("/deactivate-account", secureController.deactivateAccount);
router.post("/reactivate-account", secureController.reactivateAccount);
router.get("/employee/create", secureController.createEmployee);
router.post("/employee/create", secureController.createEmployeePost);

// Booking Management
router.get("/bookings", bookingController.viewAllBookings);
router.post("/bookings/assign", bookingController.assignBooking);

// Feedback Management
router.get("/feedback/manage", feedbackController.manageFeedback);
router.post("/feedback/delete", feedbackController.deleteFeedback);

// Category Management
router.post("/categories/delete", categoryController.deleteCategory);

module.exports = router;
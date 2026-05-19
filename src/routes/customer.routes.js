const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const bookingController = require("../controllers/booking.controller");
const feedbackController = require("../controllers/feedback.controller");
const productController = require("../controllers/product.controller");
const { verifyToken, verifyRoles } = require("../middlewares/auth.middleware");

// Middleware to ensure only Customer can access these
router.use(verifyToken, verifyRoles("customer"));

// Dashboard
router.get("/dashboard", secureController.customerDashboard);
router.post("/delete-account", secureController.deleteAccount);

// Address Management
router.get("/address/manage", secureController.manageAddress);
router.post("/address/add", secureController.addAddress);
router.post("/address/delete", secureController.deleteAddress);

// Booking Management
router.get("/bookings/manage", bookingController.manageBookings);
router.get("/bookings/make/:productId", bookingController.makeBooking);
router.post("/bookings/create", bookingController.createBooking);
router.post("/bookings/cancel/:id", bookingController.cancelBooking);

// Payment
router.get("/bookings/payment/:id", bookingController.bookingPayment);
router.post("/bookings/payment/success", bookingController.bookingPaymentSuccess);

// Wishlist
router.post("/wishlist", productController.addToWishlist);

// Notifications
router.get("/notifications", secureController.getNotifications);
router.get("/notifications/open/:id", secureController.openNotification);
router.post("/notifications/mark-all-read", secureController.markAllNotificationsAsRead);

// Feedback
router.get("/feedback/make", feedbackController.getMakefeedback);
router.post("/feedback/make", feedbackController.makeFeedback);

module.exports = router;
const router = require("express").Router();
const {
  manageBookings,
  cancelBooking,
  makeBooking,
  createBooking,
  updateBooking,
  viewAllBookings,
  assignBooking,
  employeeBookManage,
} = require("../controllers/booking.controller");
const { verifyToken, verifyRoles } = require("../middlewares/auth.middleware");
router.get("/manage", verifyToken, verifyRoles("customer"), manageBookings);
router.post("/cancel/:id", verifyToken, verifyRoles("customer"), cancelBooking);
router.get(
  "/make/:productId",
  verifyToken,
  verifyRoles("customer"),
  makeBooking,
);
router.post("/create", verifyToken, verifyRoles("customer"), createBooking);
router.post("/update/:id", verifyToken, verifyRoles("employee"), updateBooking);
router.get("/all", verifyToken, verifyRoles("employee"), viewAllBookings);
router.post("/assign/:id", verifyToken, verifyRoles("admin"), assignBooking);
router.get(
  "/employee/manage",
  verifyToken,
  verifyRoles("employee"),
  employeeBookManage,
);
module.exports = router;

const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const bookingController = require("../controllers/booking.controller");
const shipController = require("../controllers/ship.controller");
const productController = require("../controllers/product.controller");
const categoryController = require("../controllers/category.controller");
const { verifyToken, verifyRoles } = require("../middlewares/auth.middleware");

// Middleware to ensure only Employee can access these
router.use(verifyToken, verifyRoles("employee"));

// Dashboard
router.get("/dashboard", secureController.employeeDashboard);

// Booking Management
router.get("/bookings/manage", bookingController.employeeBookManage);
router.post("/bookings/update", bookingController.updateBooking);

// Shipping Management
router.get("/ship/manage", shipController.manageShipped);
router.post("/ship/update", shipController.updateShipped);

// Product Management
router.get("/products/manage", productController.employeeProductManage);
router.get("/products/create", productController.getMakeProduct);
router.post("/products/create", productController.createProduct);
router.get("/products/edit/:id", productController.editProduct);
router.post("/products/edit", productController.updateProduct);
router.post("/products/delete", productController.deleteProduct);

// Category Management
router.get("/categories/create", categoryController.getMakeCategory);
router.post("/categories/create", categoryController.createCategory);
router.get("/categories/edit/:id", categoryController.editCategory);
router.post("/categories/edit", categoryController.updateCategory);

module.exports = router;
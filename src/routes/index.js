const express = require("express");
const router = express.Router();

// Route imports
const authRoutes = require("./auth.routes");
const adminRoutes = require("./admin.routes");
const employeeRoutes = require("./employee.routes");
const customerRoutes = require("./customer.routes");
const generalRoutes = require("./secure.routes"); // For shared routes like profile
const productRoutes = require("./product.routes"); // Only for public routes like shop/details
const mainRoutes = require("./main.routes");

// Mounting routes
router.use("/", mainRoutes);
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/employee", employeeRoutes);
router.use("/customer", customerRoutes);
router.use("/user", generalRoutes); // Shared authenticated routes
router.use("/products", productRoutes);

module.exports = router;
const express = require("express");
const router = express.Router();

// Route imports
const authRoutes = require("./auth.routes");
const secureRoutes = require("./secure.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const bookingRoutes = require("./booking.routes");
const shipRoutes = require("./ship.routes");
const mainRoutes = require("./main.routes");

// Mounting routes
router.use("/", mainRoutes);
router.use("/auth", authRoutes);
router.use("/secure", secureRoutes);
router.use("/categories", categoryRoutes);
router.use("/bookings", bookingRoutes);
router.use("/ship", shipRoutes);
router.use("/products", productRoutes);

module.exports = router;
const express = require("express");
require("dotenv").config();
const connectDB = require("./db/db");
const authRoutes = require("./routes/auth.routes");
const secureRoutes = require("./routes/secure.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const bookingRoutes = require("./routes/booking.routes");
const shipRoutes = require("./routes/ship.routes");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.use("/auth", authRoutes);
app.use("/secure", secureRoutes);
app.use("/categories", categoryRoutes);
app.use("/bookings", bookingRoutes);
app.use("/ship", shipRoutes);
app.use("/products", productRoutes);
app.get("/", (req, res) => {
  res.render("index", { user: req.user || null });
});
app.get("/about", (req, res) => {
  res.render("about", { user: req.user || null });
});
app.get("/contact", (req, res) => {
  res.render("contact", { user: req.user || null });
});
app.get("/404", (req, res) => {
  res.status(404).render("404", {
    user: req.user || null,
    message: req.query.message || "Page Not Found",
  });
});

// 404 Not Found Middleware
app.use((req, res, next) => {
  res
    .status(404)
    .render("404", { user: req.user || null, message: "Page Not Found" });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

module.exports = app;

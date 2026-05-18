const express = require("express");
require("dotenv").config();
const path = require("path");
const cookieParser = require("cookie-parser");
const routes = require("./routes");

const app = express();

// =========================
// CONFIGURATION & MIDDLEWARE
// =========================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// =========================
// ROUTES
// =========================
app.use("/", routes);

// =========================
// ERROR HANDLING
// =========================
app.use((req, res, next) => {
  res.status(404).render("404", { user: req.user || null, message: "Page Not Found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

module.exports = app;

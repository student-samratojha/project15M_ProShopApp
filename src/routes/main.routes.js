const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { user: req.user || null });
});

router.get("/about", (req, res) => {
  res.render("about", { user: req.user || null });
});

router.get("/contact", (req, res) => {
  res.render("contact", { user: req.user || null });
});

router.get("/404", (req, res) => {
  res.status(404).render("404", {
    user: req.user || null,
    message: req.query.message || "Page Not Found",
  });
});

module.exports = router;
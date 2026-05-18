const jwt = require("jsonwebtoken");
const userModel = require("../db/models/user.model");

// =========================================
// VERIFY TOKEN MIDDLEWARE
// =========================================
async function verifyToken(req, res, next) {
  try {
    // =========================
    // GET TOKEN FROM COOKIE
    // =========================
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.redirect("/404");
    }

    // =========================
    // VERIFY TOKEN
    // =========================
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    // =========================
    // FIND USER
    // =========================
    const user = await userModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.redirect("/404");
    }

    // =========================
    // ACCOUNT CHECK
    // =========================
    if (user.isDeleted || !user.isActive) {
      return res.redirect("/404");
    }

    // =========================
    // SAVE USER IN REQUEST
    // =========================
    req.user = user;

    next();
  } catch (error) {
    console.error("Verify Token Error:", error.message);

    return res.redirect("/404");
  }
}

// =========================================
// VERIFY ROLE MIDDLEWARE
// =========================================
function verifyRoles(...roles) {
  return (req, res, next) => {
    try {
      // =========================
      // USER CHECK
      // =========================
      if (!req.user) {
        return res.redirect("/404");
      }

      // =========================
      // ROLE CHECK
      // =========================
      if (!roles.includes(req.user.role)) {
        return res.redirect("/404");
      }

      next();
    } catch (error) {
      console.error("Verify Role Error:", error.message);

      return res.redirect("/404");
    }
  };
}

module.exports = {
  verifyToken,
  verifyRoles,
};

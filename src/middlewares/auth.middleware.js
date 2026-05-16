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
      return res.status(401).send({
        success: false,
        message: "Access token missing",
      });
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
      return res.status(401).send({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // ACCOUNT CHECK
    // =========================
    if (user.isDeleted || !user.isActive) {
      return res.status(403).send({
        success: false,
        message: "Account inactive or deleted",
      });
    }

    // =========================
    // SAVE USER IN REQUEST
    // =========================
    req.user = user;

    next();
  } catch (error) {
    console.error("Verify Token Error:", error.message);

    return res.status(401).send({
      success: false,
      message: "Invalid or expired token",
    });
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
        return res.status(401).send({
          success: false,
          message: "Unauthorized access",
        });
      }

      // =========================
      // ROLE CHECK
      // =========================
      if (!roles.includes(req.user.role)) {
        return res.status(403).send({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (error) {
      console.error("Verify Role Error:", error.message);

      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  };
}

module.exports = {
  verifyToken,
  verifyRoles,
};

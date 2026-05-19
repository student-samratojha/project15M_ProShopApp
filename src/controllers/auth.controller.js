const userModel = require("../db/models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { auditLog } = require("../helper/audit.helper");
const { sendNotification } = require("../helper/notification.helper");

// =====================================
// REGISTER PAGE
// =====================================
async function getRegister(req, res) {
  try {
    return res.render("registerPage", {
      title: "Register",
    });
  } catch (error) {
    console.error("Register Page Error:", error.message);

    return res.status(500).send("Internal Server Error");
  }
}

// =====================================
// REGISTER USER
// =====================================
async function postRegister(req, res) {
  try {
    const {
      name,
      username,
      email,
      phone,
      password,
      avatar,
      gender,
      dateOfBirth,
    } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!name || !email || !password) {
      await auditLog(
        req,
        res,
        "register_failed",
        "Required fields missing",
        false,
        "warning",
      );

      return res.status(400).send({
        success: false,
        message: "Name, Email and Password are required",
      });
    }

    // =========================
    // PASSWORD VALIDATION
    // =========================
    if (password.length < 6) {
      await auditLog(
        req,
        res,
        "register_failed",
        "Password too short",
        false,
        "warning",
      );

      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // =========================
    // EMAIL CHECK
    // =========================
    const existingEmail = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      await auditLog(
        req,
        res,
        "register_failed",
        "Email already exists",
        false,
        "warning",
      );

      return res.status(400).send({
        success: false,
        message: "Email already exists",
      });
    }

    // =========================
    // USERNAME CHECK
    // =========================
    if (username) {
      const existingUsername = await userModel.findOne({
        username: username.toLowerCase(),
      });

      if (existingUsername) {
        await auditLog(
          req,
          res,
          "register_failed",
          "Username already taken",
          false,
          "warning",
        );

        return res.status(400).send({
          success: false,
          message: "Username already taken",
        });
      }
    }

    // =========================
    // PHONE CHECK
    // =========================
    if (phone) {
      const existingPhone = await userModel.findOne({
        phone,
      });

      if (existingPhone) {
        await auditLog(
          req,
          res,
          "register_failed",
          "Phone already exists",
          false,
          "warning",
        );

        return res.status(400).send({
          success: false,
          message: "Phone number already exists",
        });
      }
    }

    // =========================
    // HASH PASSWORD
    // =========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // CREATE USER
    // =========================
    const newUser = await userModel.create({
      name,

      username: username ? username.toLowerCase() : email.split("@")[0],

      email: email.toLowerCase(),

      phone,

      password: hashedPassword,

      avatar,

      gender,

      dateOfBirth,

      role: "customer",

      authProvider: "local",

      isVerified: false,
    });

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "register_success",
      `New user registered with email: ${email}`,
      true,
      "info",
    );
    await sendNotification(
      newUser._id,
      `Welcome to ProShop! Your account has been successfully created.`,
      "account",
      "/customer/dashboard",
    );

    return res.redirect("/auth/login?registered=true");
  } catch (error) {
    console.error("Register Error:", error.message);

    await auditLog(
      req,
      res,
      "register_error",
      error.message,
      false,
      "critical",
    );

    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// =====================================
// LOGIN PAGE
// =====================================
async function getLogin(req, res) {
  try {
    return res.render("loginPage", {
      title: "Login",
    });
  } catch (error) {
    console.error("Login Page Error:", error.message);

    return res.status(500).send("Internal Server Error");
  }
}

// =====================================
// LOGIN USER
// =====================================
async function postLogin(req, res) {
  try {
    const { email, password } = req.body;

    // =========================
    // VALIDATION
    // =========================
    if (!email || !password) {
      await auditLog(
        req,
        res,
        "login_failed",
        "Email or password missing",
        false,
        "warning",
      );

      return res.status(400).send({
        success: false,
        message: "Email and Password are required",
      });
    }

    // =========================
    // FIND USER
    // =========================
    const user = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      await auditLog(
        req,
        res,
        "login_failed",
        "User not found",
        false,
        "warning",
      );

      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // ACCOUNT CHECK
    // =========================
    if (user.isDeleted || !user.isActive) {
      await auditLog(
        req,
        res,
        "login_failed",
        "Account inactive or deleted",
        false,
        "warning",
      );

      return res.status(403).send({
        success: false,
        message: "Account inactive or deleted",
      });
    }

    // =========================
    // PASSWORD CHECK
    // =========================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await auditLog(
        req,
        res,
        "login_failed",
        "Incorrect password",
        false,
        "warning",
      );

      return res.status(400).send({
        success: false,
        message: "Incorrect password",
      });
    }

    // =========================
    // TOKENS
    // =========================
    const accessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.ACCESS_SECRET,
      {
        expiresIn: "15m",
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // =========================
    // SAVE REFRESH TOKEN
    // =========================
    user.refreshToken = refreshToken;

    user.lastLogin = new Date();

    await user.save();

    // =========================
    // ACCESS TOKEN COOKIE
    // =========================
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    // =========================
    // REFRESH TOKEN COOKIE
    // =========================
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "login_success",
      `User logged in with email: ${email}`,
      true,
      "info",
    );

    // =========================
    // ROLE REDIRECT
    // =========================
    return res.redirect(`/${user.role}/dashboard?login=true`);
  } catch (error) {
    console.error("Login Error:", error.message);

    await auditLog(req, res, "login_error", error.message, false, "critical");

    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// =====================================
// LOGOUT USER
// =====================================
async function logout(req, res) {
  try {
    // =========================
    // REMOVE REFRESH TOKEN
    // =========================
    if (req.user?._id) {
      await userModel.findByIdAndUpdate(req.user._id, {
        refreshToken: "",
      });
    }

    // =========================
    // CLEAR COOKIES
    // =========================
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "logout_success",
      "User logged out successfully",
      true,
      "info",
    );

    return res.redirect("/auth/login?logout=true");
  } catch (error) {
    console.error("Logout Error:", error.message);

    await auditLog(req, res, "logout_error", error.message, false, "critical");

    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
};

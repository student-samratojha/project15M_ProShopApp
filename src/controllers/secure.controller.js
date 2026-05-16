const userModel = require("../db/models/user.model");
const auditHelper = require("../helper/audit.helper");
const categoryModel = require("../db/models/category.model");
const productModel = require("../db/models/product.model");
const bookingModel = require("../db/models/booking.model");
const bcrypt = require("bcrypt");
async function adminDashboard(req, res) {
  try {
    const users = await userModel.find().select("-password");
    const audits = await auditHelper.getAuditLogs(10);
    const bookings = await bookingModel.find().populate("user").populate("product");
    const employees = await userModel.find({ role: "employee" }).select("-password");
    const admin = await userModel
      .findOne({ role: "admin" })
      .select("-password");
    res.render("admin/dashboard", {
      users,
      admin,
      bookings,
      employees,
      audits,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error.message);
    res.status(500).send("Server Error");
  }
}

async function employeeDashboard(req, res) {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    const category = await categoryModel.find({ employee: req.user._id });
    const categoryIds = category.map(cat => cat._id);
    const products = await productModel.find({ category: { $in: categoryIds } }).populate("category");
    const bookings = await bookingModel.find({ assignedTo: req.user._id }).populate("user").populate("product");
    res.render("employee/dashboard", {
      user,
      category,
      products,
      bookings,
    });
  } catch (error) {
    console.error("Employee Dashboard Error:", error.message);
    res.status(500).send("Server Error");
  }
}

async function customerDashboard(req, res) {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.render("customer/dashboard", {
      user,
    });
  } catch (error) {
    console.error("Customer Dashboard Error:", error.message);
    res.status(500).send("Server Error");
  }
}
async function deleteAccount(req, res) {
  try {
    await userModel.findByIdAndUpdate(req.user._id, {
      isDeleted: true,
    });
    await auditHelper.auditLog(
      req,
      res,
      "Account Deleted",
      "User account marked as deleted",
      false,
      "warning",
    );
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    return res.redirect("/auth/login?deleted=true");
  } catch (error) {
    console.error("Delete Account Error:", error.message);
    res.status(500).send("Server Error");
  }
}

async function deactivateAccount(req, res) {
  try {
    // =========================
    // DEACTIVATE ACCOUNT
    // =========================
    const { id } = req.body;
    const user = await userModel.findByI(id);
    if (!user) {
      await auditHelper.auditLog(
        req,
        res,
        "Deactivate Account Failed",
        `User with ID ${id} not found`,
        false,
        "warning",
      );
      return res.redirect("/secure/admin?deactivated=false");
    }
    await userModel.findByIdAndUpdate(id, {
      isActive: false,
    });
    await auditHelper.auditLog(
      req,
      res,
      "Account Deactivated",
      `User account with ID ${id} deactivated`,
      false,
      "warning",
    );
    return res.redirect("/secure/admin?deactivated=true");
  } catch (error) {
    await auditHelper.auditLog(
      req,
      res,
      "Deactivate Account Error",
      error.message,
      false,
      "critical",
    );
    console.error("Deactivate Account Error:", error.message);
    res.redirect("/secure/admin?deactivated=false");
  }
}

async function reactivateAccount(req, res) {
  try {
    // =========================
    // REACTIVATE ACCOUNT
    // =========================
    const { id } = req.body;
    const user = await userModel.findById(id);
    if (!user) {
      await auditHelper.auditLog(
        req,
        res,
        "Reactivate Account Failed",
        `User with ID ${id} not found`,
        false,
        "warning",
      );
      return res.redirect("/secure/admin?reactivated=false");
    }
    await user.findByIdAndUpdate(id, {
      isActive: true,
    });
    await auditHelper.auditLog(
      req,
      res,
      "Account Reactivated",
      `User account with ID ${id} reactivated`,
      false,
      "info",
    );
    return res.redirect("/secure/admin?reactivated=true");
  } catch (error) {
    await auditHelper.auditLog(
      req,
      res,
      "Reactivate Account Error",
      error.message,
      false,
      "critical",
    );
    console.error("Reactivate Account Error:", error.message);
    res.redirect("/secure/admin?reactivated=false");
  }
}
async function editProfile(req, res) {
  try {
    // =========================
    // FIND USER
    // =========================
    const user = await userModel.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    // =========================
    // RENDER PAGE
    // =========================
    return res.render("edit-profile", {
      title: "Edit Profile",
      user,
    });
  } catch (error) {
    console.error("Edit Profile Error:", error.message);

    return res.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  }
}

// =========================================
// UPDATE PROFILE
// =========================================
async function updateProfile(req, res) {
  try {
    const { name, username, phone, avatar, gender, dateOfBirth } = req.body;

    // =========================
    // FIND USER
    // =========================
    const user = await userModel.findById(req.user._id);

    if (!user) {
      await auditLog(
        req,
        res,
        "profile_update_failed",
        "User not found",
        false,
        "warning",
      );

      return res.redirect(`/secure/${req.user.role}?updated=false`);
    }

    // =========================
    // USERNAME CHECK
    // =========================
    if (username && username !== user.username) {
      const existingUsername = await userModel.findOne({
        username: username.toLowerCase(),
      });

      if (existingUsername) {
        await auditLog(
          req,
          res,
          "profile_update_failed",
          "Username already taken",
          false,
          "warning",
        );

        return res.redirect(
          `/secure/${req.user.role}?updated=false&error=username`,
        );
      }

      user.username = username.toLowerCase();
    }

    // =========================
    // PHONE CHECK
    // =========================
    if (phone && phone !== user.phone) {
      const existingPhone = await userModel.findOne({
        phone,
      });

      if (existingPhone) {
        await auditLog(
          req,
          res,
          "profile_update_failed",
          "Phone number already exists",
          false,
          "warning",
        );

        return res.redirect(
          `/secure/${req.user.role}?updated=false&error=phone`,
        );
      }

      user.phone = phone;
    }

    // =========================
    // UPDATE FIELDS
    // =========================
    user.name = name || user.name;

    user.avatar = avatar || user.avatar;

    user.gender = gender || user.gender;

    user.dateOfBirth = dateOfBirth || user.dateOfBirth;

    // =========================
    // SAVE USER
    // =========================
    await user.save();

    // =========================
    // AUDIT LOG
    // =========================
    await auditLog(
      req,
      res,
      "profile_updated",
      `Profile updated by ${user.email}`,
      true,
      "info",
    );

    // =========================
    // RESPONSE
    // =========================
    return res.redirect(`/secure/${req.user.role}?updated=true`);
  } catch (error) {
    console.error("Update Profile Error:", error.message);

    await auditLog(
      req,
      res,
      "profile_update_error",
      error.message,
      false,
      "critical",
    );

    return res.redirect(`/secure/${req.user.role}?updated=false`);
  }
}

async function createEmployee(req, res) {
  try {
    res.render("createEmployee");
  } catch (error) {
    console.error("Create Employee Error:", error.message);
    res.redirect("/secure/admin?employee_created=false");
  }
}

async function createEmployeePost(req, res) {
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
    const existingUser = await userModel.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
        { phone },
      ],
    });
    if (existingUser) {
      await auditLog(
        req,
        res,
        "Employee_create_Failed",
        `Employee creation failed - Duplicate username, email, or phone: ${email}`,
        true,
        "warning",
      );
      return res.redirect("/secure/admin?employee_created=false");
    }
    const newEmployee = new userModel({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      phone,
      password: await bcrypt.hash(password, 10),
      avatar,
      gender,
      dateOfBirth,
      role: "employee",
      authProvider: "local",
    });
    await newEmployee.save();
    await auditLog(
      req,
      res,
      "Employee_created",
      `Employee created successfully: ${email}`,
      true,
      "info",
    );
    return res.redirect("/secure/admin?employee_created=true");
  } catch (error) {
    console.error("Create Employee Error:", error.message);
    res.redirect("/secure/admin?employee_created=false");
  }
}

async function manageAddress(req, res) {
  try {
    const user = await userModel.findById(req.user._id).select("-password");
    res.render("manage-address", {
      user,
    });
  }
  catch (error) {
    console.error("Manage Address Error:", error.message);
    res.status(500).send("Server Error");
  }
}

async function addAddress(req, res) {
  try {
    const { address } = req.body;
    const user = await userModel.findById(req.user._id);
    if (!user) {
      await auditLog(
        req,
        res,
        "Add Address Failed",
        `User with ID ${req.user._id} not found`,
        false,
        "warning",
      );
      return res.redirect("/secure/manage-address?added=false");
    }
    if(user.addresses.length >= 5) {
      await auditLog(
        req,
        res,
        "Add Address Failed",
        `User with ID ${req.user._id} already has 5 addresses`,
        false,
        "warning",
      );
      return res.redirect("/secure/manage-address?added=false&error=max_addresses");
    }
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address },
    });
    await auditLog(
      req,
      res,
      "Address Added",
      `New address added for user ${user.email}`,
      true,
      "info",
    );
    res.redirect("/secure/manage-address?added=true");

  } catch (error) {
    console.error("Add Address Error:", error.message);
    res.status(500).send("Server Error");
  }
}

module.exports = {
  adminDashboard,
  employeeDashboard,
  customerDashboard,
  deleteAccount,
  manageAddress,
  addAddress,
  deactivateAccount,
  reactivateAccount,
  createEmployee,
  createEmployeePost,
  editProfile,
  updateProfile,
};

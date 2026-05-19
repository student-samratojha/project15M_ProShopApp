const userModel = require("../db/models/user.model");
const auditHelper = require("../helper/audit.helper");
const { auditLog } = auditHelper;
const categoryModel = require("../db/models/category.model");
const { sendNotification } = require("../helper/notification.helper");
const productModel = require("../db/models/product.model");
const bookingModel = require("../db/models/booking.model");
const notificationModel = require("../db/models/notification.model");
const bcrypt = require("bcrypt");
const auditModel = require("../db/models/audit.model");
async function adminDashboard(req, res) {
  try {
    const users = await userModel.find().select("-password");
    const audits = await auditHelper.getAuditLogs(10);
    const totalAudits = await auditModel.countDocuments();
    const bookings = await bookingModel
      .find()
      .populate("user")
      .populate("product").populate("assignedTo");
    const employees = await userModel
      .find({ role: "employee" })
      .select("-password");
    res.render("admin/dashboard", {
      users,
      admin: req.user,
      bookings,
      employees,
      totalAudits,
      audits,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error.message);
    res.status(500).send("Server Error");
  }
}

async function employeeDashboard(req, res) {
  try {
    const category = await categoryModel.find({ employee: req.user._id });
    const categoryIds = category.map((cat) => cat._id);
    const products = await productModel
      .find({ category: { $in: categoryIds }, isDeleted: false })
      .populate("category");
    const bookings = await bookingModel
      .find({ assignedTo: req.user._id })
      .populate("user")
      .populate("product");
    res.render("employee/dashboard", {
      user: req.user,
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
    const bookings = await bookingModel
      .find({ user: req.user._id }).populate("product");
    const notifications = await notificationModel.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5); // Fetch latest 5 notifications
    const unreadNotificationsCount = await notificationModel.countDocuments({ user: req.user._id, isRead: false });
    res.render("customer/dashboard", {
      user: req.user, bookings, notifications, unreadNotificationsCount
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
    const user = await userModel.findById(id);
    if (!user) {
      await auditHelper.auditLog(
        req,
        res,
        "Deactivate Account Failed",
        `User with ID ${id} not found`,
        false,
        "warning",
      );
      return res.redirect("/admin/dashboard?deactivated=false");
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
    return res.redirect("/admin/dashboard?deactivated=true");
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
    res.redirect("/admin/dashboard?deactivated=false");
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
      return res.redirect("/admin/dashboard?reactivated=false");
    }
    await userModel.findByIdAndUpdate(id, {
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
    return res.redirect("/admin/dashboard?reactivated=true");
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
    res.redirect("/admin/dashboard?reactivated=false");
  }
}
async function editProfile(req, res) {
  try {
    // =========================
    // RENDER PAGE
    // =========================
    return res.render("edit-profile", {
      title: "Edit Profile",
      user: req.user,
    });
  } catch (error) {
    console.error("Edit Profile Error:", error.message);
    return res.redirect(`/${req.user.role}/dashboard?Error_During_Update`);
  }
}

// =========================================
// UPDATE PROFILE
// =========================================
async function updateProfile(req, res) {
  try {
    const { name, username, phone, avatar, gender, dateOfBirth } = req.body;

    // =========================
    // USE LOGGED IN USER
    // =========================
    const user = req.user;

    if (!user) {
      await auditLog(
        req,
        res,
        "profile_update_failed",
        "User not found",
        false,
        "warning",
      );

      return res.redirect(`/${req.user.role}/dashboard?updated=false`);
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
          `/${req.user.role}/dashboard?updated=false&error=username`,
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
          `/${req.user.role}/dashboard?updated=false&error=phone`,
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
    await sendNotification(
      user._id,
      `Your profile information has been updated.`,
      "account",
      `/${user.role}/dashboard`,
    );

    // =========================
    // RESPONSE
    // =========================
    return res.redirect(`/${req.user.role}/dashboard?updated=true`);
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

    return res.redirect(`/${req.user.role}/dashboard?updated=false`);
  }
}

async function createEmployee(req, res) {
  try {
    res.render("admin/createEmployee");
  } catch (error) {
    console.error("Create Employee Error:", error.message);
    res.redirect("/admin/dashboard?employee_created=false");
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
      return res.redirect("/admin/dashboard?employee_created=false");
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
    return res.redirect("/admin/dashboard?employee_created=true");
  } catch (error) {
    console.error("Create Employee Error:", error.message);
    res.redirect("/admin/dashboard?employee_created=false");
  }
}

async function manageAddress(req, res) {
  try {
    res.render("customer/manage-address", {
      user: req.user,
    });
  } catch (error) {
    console.error("Manage Address Error:", error.message);
    res.redirect("/customer/address/manage?error=true");
  }
}

async function addAddress(req, res) {
  try {
    const { address } = req.body;
    if (!req.user) {
      await auditLog(
        req,
        res,
        "Add Address Failed",
        "User not found",
        false,
        "warning",
      );
      return res.redirect("/customer/address/manage?added=false");
    }
    if (req.user.addresses.length >= 5) {
      await auditLog(
        req,
        res,
        "Add Address Failed",
        `User ${req.user.email} already has 5 addresses`,
        false,
        "warning",
      );
      return res.redirect("/customer/address/manage?added=false&error=max_addresses");
    }
    if (req.user.addresses.includes(address)) {
      await auditLog(
        req,
        res,
        "Add Address Failed",
        `User ${req.user.email} already has this address`,
        false,
        "warning",
      );
      return res.redirect("/customer/address/manage?added=false&error=duplicate_address");
    }
    await userModel.findByIdAndUpdate(req.user._id, {
      $push: { addresses: address },
    });
    await auditLog(
      req,
      res,
      "Address Added",
      `New address added for user ${req.user.email}`,
      true,
      "info",
    );
    await sendNotification(
      req.user._id,
      `New address "${address.addressLine}" added to your account.`,
      "account",
      "/customer/address/manage",
    );
    res.redirect("/customer/address/manage?added=true");
  } catch (error) {
    console.error("Add Address Error:", error.message);
    res.redirect("/customer/address/manage?added=false&error=server_error");
  }
}
async function deleteAddress(req, res) {
  try {
    const { addressId, address } = req.body;
    if (!req.user) {
      await auditLog(
        req,
        res,
        "Delete Address Failed",
        "User not found",
        false,
        "warning",
      );
      return res.redirect("/customer/address/manage?deleted=false");
    }

    const pullQuery = addressId ? { _id: addressId } : address ? address : null;

    if (!pullQuery) {
      await auditLog(
        req,
        res,
        "Delete Address Failed",
        "No address identifier provided",
        false,
        "warning",
      );
      return res.redirect("/customer/address/manage?deleted=false&error=invalid_request");
    }

    await userModel.findByIdAndUpdate(req.user._id, {
      $pull: { addresses: pullQuery },
    });
    await auditLog(
      req,
      res,
      "Address Deleted",
      `Address deleted for user ${req.user.email}`,
      true,
      "info",
    );
    await sendNotification(
      req.user._id,
      `An address has been removed from your account.`,
      "account",
      "/customer/address/manage",
    );
    res.redirect("/customer/address/manage?deleted=true");
  } catch (error) {
    console.error("Delete Address Error:", error.message);
    res.redirect("/customer/address/manage?deleted=false&error=server_error");
  }
}

async function getNotifications(req, res) {
  try {
    const notifications = await notificationModel.find({ user: req.user._id }).sort({ createdAt: -1 });
    const unreadNotificationsCount = await notificationModel.countDocuments({ user: req.user._id, isRead: false });
    res.render("customer/notifications", {
      user: req.user,
      notifications,
      unreadNotificationsCount
    });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.redirect("/customer/dashboard?error=Unable to fetch notifications");
  }
}

async function openNotification(req, res) {
  try {
    const notification = await notificationModel.findByIdAndUpdate(req.params.id, { isRead: true });
    if (!notification) return res.redirect("/customer/dashboard");
    res.redirect(notification.link || "/customer/dashboard");
  } catch (error) {
    console.error("Open Notification Error:", error.message);
    res.redirect("/customer/dashboard");
  }
}

async function markAllNotificationsAsRead(req, res) {
  try {
    await notificationModel.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.redirect("/customer/dashboard?success=All notifications marked as read");
  } catch (error) {
    console.error("Mark All Read Error:", error.message);
    res.redirect("/customer/dashboard?error=Unable to update notifications");
  }
}

module.exports = {
  adminDashboard,
  employeeDashboard,
  customerDashboard,
  deleteAddress,
  deleteAccount,
  manageAddress,
  addAddress,
  deactivateAccount,
  reactivateAccount,
  createEmployee,
  createEmployeePost,
  editProfile,
  updateProfile,
  getNotifications,
  openNotification,
  markAllNotificationsAsRead
};

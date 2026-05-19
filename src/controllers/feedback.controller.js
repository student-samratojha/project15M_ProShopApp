const feedbackModel = require("../db/models/feedback.model");
const userModel = require("../db/models/user.model");
const { sendNotification } = require("../helper/notification.helper");
const { auditLog } = require("../helper/audit.helper");
async function getMakefeedback(req, res) {
  try {
    auditLog(
      req,
      res,
      "Accessed Make Feedback",
      `User ${req.user.username} accessed the make feedback page.`,
      false,
      "info",
    );
    res.render("customer/makeFeedback", { user: req.user });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.redirect("/customer/dashboard?error=Unable to load feedback page");
  }
}

async function makeFeedback(req, res) {
  try {
    const { name,rating, email, message } = req.body;
    const feedback = new feedbackModel({
      name,
      email,
      message,
      rating,
      profilePic: req.user.avatar
    });
    await feedback.save();
    await auditLog(
      req,
      res,
      "Feedback Made",
      `User ${req.user.username} made a feedback.`,
      false,
      "info",
    );
    await sendNotification(
      req.user.id,
      `Thank you for your feedback! We appreciate your input.`,
      "feedback",
      "/customer/dashboard",
    );
    res.redirect("/customer/dashboard?success=Feedback submitted successfully");
  } catch (error) {
    console.error("Error making feedback:", error);
    res.redirect("/customer/dashboard?error=Unable to submit feedback");
  }
}

async function deleteFeedback(req, res) {
  try {
    const feedbackId = req.body.id;
    const feedback = await feedbackModel.findById(feedbackId);
    if (!feedback) {
      await auditLog(
        req,
        res,
        "Failed Feedback Deletion",
        `User ${req.user.username} attempted to delete a feedback that does not exist.`,
        false,
        "warning",
      );
      return res.redirect("/admin/feedback/manage?error=Feedback not found"); // Already correct
    }
    feedback.isDeleted = true;
    await feedback.save();
    await auditLog(
      req,
      res,
      "Feedback Deleted",
      `User ${req.user.username} deleted feedback.
      `,
      false,
      "info",
    );
    res.redirect("/admin/feedback/manage?success=Feedback deleted successfully");
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return res.redirect("/admin/feedback/manage?error=Unable to delete feedback");
  }
}

async function manageFeedback(req, res) {
    try {
    const feedbacks = await feedbackModel.find({ isDeleted: false }).sort({ createdAt: -1 });
    const admin = await userModel.findOne({ role: "admin" });
    auditLog(
      req,
      res,
      "Accessed Manage Feedback",
      `Admin ${admin.username} accessed the manage feedback page.`,
      false,
      "info",
    );
    res.render("admin/manageFeedback", { feedbacks, admin });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.redirect("/admin/dashboard?error=Unable to fetch feedbacks");
    }
}

module.exports = {
  makeFeedback,
  getMakefeedback,
  deleteFeedback,
    manageFeedback
};

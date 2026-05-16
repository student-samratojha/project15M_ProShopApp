const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    role: {
      type: String,
      enum: ["admin", "employee", "customer"],
    },

    route: {
      type: String,
      required: true,
    },

    method: {
      type: String,
      required: true,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    },

    statusCode: {
      type: Number,
      default: 200,
    },

    ip: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      required: true,
    },

    device: {
      type: String,
      default: "",
    },

    browser: {
      type: String,
      default: "",
    },

    os: {
      type: String,
      default: "",
    },

    requestBody: {
      type: Object,
      default: {},
    },

    responseMessage: {
      type: String,
      default: "",
    },

    module: {
      type: String,
      enum: [
        "auth",
        "product",
        "category",
        "order",
        "payment",
        "user",
        "admin",
      ],
    },

    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },

    isSuccess: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Audit", auditSchema);

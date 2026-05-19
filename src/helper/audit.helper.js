const auditModel = require("../db/models/audit.model");

async function auditLog(
  req,
  res,
  action,
  message = "",
  isSuccess = true,
  severity = "info",
) {
  try {
    await auditModel.create({
      action: action,

      message: message,

      userId: req.user?._id || null,

      role: req.user?.role || "customer",

      route: req.originalUrl,

      method: req.method,

      statusCode: res.statusCode || 200,

      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "unknown",

      userAgent: req.headers["user-agent"] || "",

      device: req.device || "",

      browser: req.browser || "",

      os: req.os || "",

      requestBody: req.body || {},

      responseMessage: message,

      module: req.baseUrl?.includes("auth")
        ? "auth"
        : req.baseUrl?.includes("product")
          ? "product"
          : req.baseUrl?.includes("category")
            ? "category"
            : req.baseUrl?.includes("order")
              ? "order"
              : req.baseUrl?.includes("payment")
                ? "payment"
                : req.baseUrl?.includes("user")
                  ? "user"
                  : req.baseUrl?.includes("admin")
                    ? "admin"
                    : "user",

      severity: severity,

      isSuccess: isSuccess,
    });
  } catch (error) {
    console.log("Audit Log Error:", error.message);
  }
}
async function getAuditLogs(limit) {
  try {
    const audits = await auditModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit || 10);
    return audits;
  } catch (error) {
    console.log("Get Audit Logs Error:", error.message);
    return [];
  }
}

module.exports = {
  auditLog,
  getAuditLogs,
};
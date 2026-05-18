const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const { verifyRoles, verifyToken } = require("../middlewares/auth.middleware");
router.get(
  "/admin",
  verifyToken,
  verifyRoles("admin"),
  secureController.adminDashboard,
);
router.get(
  "/customer",
  verifyToken,
  verifyRoles("customer"),
  secureController.customerDashboard,
);
router.get(
  "/employee",
  verifyToken,
  verifyRoles("employee"),
  secureController.employeeDashboard,
);
router.post(
  "/delete-account",
  verifyToken,
  verifyRoles("customer"),
  secureController.deleteAccount,
);
router.post(
  "/deactivate-account",
  verifyToken,
  verifyRoles("admin"),
  secureController.deactivateAccount,
);
router.post(
  "/reactivate-account",
  verifyToken,
  verifyRoles("admin"),
  secureController.reactivateAccount,
);
router.get("/edit", verifyToken, secureController.editProfile);
router.post("/profile", verifyToken, secureController.updateProfile);

router.get(
  "/create",
  verifyToken,
  verifyRoles("admin"),
  secureController.createEmployee,
);
router.post(
  "/create",
  verifyToken,
  verifyRoles("admin"),
  secureController.createEmployeePost,
);
router.get(
  "/manage",
  verifyToken,
  verifyRoles("customer"),
  secureController.manageAddress,
);
router.post(
  "/address",
  verifyToken,
  verifyRoles("customer"),
  secureController.addAddress,
);
router.post(
  "/address/delete",
  verifyToken,
  verifyRoles("customer"),
  secureController.deleteAddress,
);
module.exports = router;

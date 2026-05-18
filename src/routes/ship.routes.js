const router = require("express").Router();
const shipController = require("../controllers/ship.controller");
const { verifyToken, verifyRoles} = require("../middlewares/auth.middleware");
router.get(
  "/manage",
  verifyToken,
  verifyRoles("employee"),
  shipController.manageShipped,
);
router.post(
  "/update",
  verifyToken,
  verifyRoles("employee"),
  shipController.updateShipped,
);
module.exports = router;

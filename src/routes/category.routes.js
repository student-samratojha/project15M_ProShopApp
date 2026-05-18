const router = require("express").Router();
const categoryController = require("../controllers/category.controller");
const { verifyRoles, verifyToken } = require("../middlewares/auth.middleware");
router.get(
  "/create",
  verifyToken,
  verifyRoles("employee"),
  categoryController.getMakeCategory,
);
router.post(
  "/create",
  verifyToken,
  verifyRoles("employee"),
  categoryController.createCategory,
);
router.get(
  "/edit/:id",
  verifyToken,
  verifyRoles("employee"),
  categoryController.editCategory,
);
router.post(
  "/edit",
  verifyToken,
  verifyRoles("employee"),
  categoryController.updateCategory,
);
router.post(
  "/delete",
  verifyToken,
  verifyRoles("employee"),
  categoryController.deleteCategory,
);
module.exports = router;

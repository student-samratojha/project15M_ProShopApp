const router = require("express").Router();
const productController = require("../controllers/product.controller");
const { verifyRoles, verifyToken } = require("../middlewares/auth.middleware");
router.get(
  "/create",
  verifyToken,
  verifyRoles("employee"),
  productController.getMakeProduct,
);
router.post(
  "/create",
  verifyToken,
  verifyRoles("employee"),
  productController.createProduct,
);
router.post(
  "/delete",
  verifyToken,
  verifyRoles("employee"),
  productController.deleteProduct,
);
router.get(
  "/edit/:id",
  verifyToken,
  verifyRoles("employee"),
  productController.editProduct,
);
router.post(
  "/edit/:id",
  verifyToken,
  verifyRoles("employee"),
  productController.updateProduct,
);
router.get("/all", productController.shopAtTop);
router.get(
  "/employee/manage",
  verifyToken,
  verifyRoles("employee"),
  productController.employeeProductManage,
);
module.exports = router;

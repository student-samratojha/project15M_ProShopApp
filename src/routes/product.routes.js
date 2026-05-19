const router = require("express").Router();
const productController = require("../controllers/product.controller");

// Public routes
router.get("/all", productController.shopAtTop);
router.get("/:id", productController.productDetails);

module.exports = router;

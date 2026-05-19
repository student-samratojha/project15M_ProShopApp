const router = require("express").Router();
const secureController = require("../controllers/secure.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Routes shared by all authenticated users
router.get("/edit", verifyToken, secureController.editProfile);
router.post("/profile", verifyToken, secureController.updateProfile);

module.exports = router;

const express = require("express");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

router.get(
  "/userProfile",
  authController.isLoggedIn,
  authController.userProfile
);

router.patch("/updateUser/:id", authController.update);
router.delete("/deleteUser/:id", authController.delete);

module.exports = router;

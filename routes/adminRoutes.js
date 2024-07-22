const express = require("express");
const adminControllers = require("../controllers/adminController");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.get("/users", authController.isLoggedIn, adminControllers.users);
router.delete(
  "/users/:id",
  authController.isLoggedIn,
  adminControllers.deleteUser
);

router.put("/users/:id/block", adminControllers.blockUser);
router.put("/users/:id/unblock", adminControllers.unblockUser);

module.exports = router;

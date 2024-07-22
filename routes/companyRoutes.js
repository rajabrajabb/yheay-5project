const express = require("express");
const companyController = require("../controllers/companyController");
const authController = require("../controllers/authControllers");

const router = express.Router();

router.post(
  "/travel-line",
  authController.isLoggedIn,
  companyController.createTravelLine
);

router.get(
  "/travel-line",
  authController.isLoggedIn,
  companyController.getTravelLine
);

router.post(
  "/employees",
  authController.isLoggedIn,
  companyController.createEmployeeAccount
);

router.get(
  "/employees",
  authController.isLoggedIn,
  companyController.getEmployeesByCompanyId
);

module.exports = router;

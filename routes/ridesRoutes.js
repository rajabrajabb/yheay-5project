const express = require("express");
const ridesControllers = require("../controllers/ridesControllers");
const authController = require("../controllers/authControllers");

const router = express.Router();

//rides routes
router.get("/lastRides", ridesControllers.get3);
router.post("/rides/find", ridesControllers.findRides);
router.get("/rides/detailes/:rideId", ridesControllers.oneRide);
router.delete("/rides/delete/:rideId", ridesControllers.deleteRide);
router.post(
  "/rides/:rideId/book",
  authController.isLoggedIn,
  ridesControllers.book
);
router.get("/allRides", authController.isLoggedIn, ridesControllers.showRides);
router.get("/allBooks", authController.isLoggedIn, ridesControllers.showBooks);
router.patch(
  "/book/:bookId/:rideId/:numOfSeatsBooked",
  ridesControllers.deleteBook
);

//
router.post("/addRide", authController.isLoggedIn, ridesControllers.addRide);
router.post("/rides", ridesControllers.rides);
router.put("/rides/update/:rideId", ridesControllers.updateRideAndDriverState);

router.post("/rides/rate/:rideId", ridesControllers.rateAride);

module.exports = router;

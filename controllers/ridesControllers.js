const Ride = require("../models/rides");
const Book = require("../models/book");
const TravelLine = require("../models/travelLine");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.get3 = catchAsync(async (req, res, next) => {
  try {
    const rides = await Ride.find().sort({ createdAt: -1 }).limit(3);
    res.status(200).json({
      status: "success",
      results: rides.length,
      data: {
        rides,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.oneRide = catchAsync(async (req, res, next) => {
  try {
    const rideId = req.params.rideId;
    const ride = await Ride.findById(rideId).populate("driverId");

    res.status(200).json({
      status: "success",
      results: ride.length,
      data: {
        ride,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.book = catchAsync(async (req, res, next) => {
  try {
    const { numOfSeatsBooked, identityNumber } = req.body;
    const rideId = req.params.rideId;
    const { _id } = res.locals.currentUser;
    const passengerId = _id.toString();

    let totalPrice;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({
        status: "error",
        message: "Ride not found",
      });
    }

    if (ride.carType == "car") {
      totalPrice = ride.pricePerSeat;
    } else {
      totalPrice = parseInt(numOfSeatsBooked) * parseInt(ride.pricePerSeat);
    }
    const book = await new Book({
      numOfSeatsBooked,
      totalPrice: totalPrice,
      passenger: passengerId,
      ride: rideId,
      identityNumber: identityNumber,
    });

    book.populate("ride").then(() => {
      book
        .save()
        .then(async () => {
          const newAvailableSeats =
            parseInt(ride.availableSeats) - parseInt(numOfSeatsBooked);
          await Ride.findByIdAndUpdate(
            rideId,
            {
              availableSeats: newAvailableSeats,
            },
            { new: true }
          ).then(() => {
            res.status(201).json({
              status: "success",
              data: {
                book,
              },
            });
          });
        })
        .catch((err) => {
          res.status(405).json({
            status: "error",
            message: err.message,
          });
        });
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});
exports.deleteRide = catchAsync(async (req, res, next) => {
  const rideId = req.params.rideId;
  const ride = await Ride.findOneAndDelete({ _id: rideId });
  if (!ride) {
    return next(new AppError("No Ride found with this id"));
  }
  const books = await Book.deleteMany({ ride: rideId });
  if (!books) {
    return next(new AppError("No Books found with this id"));
  }
  res.status(200).json({
    status: "success",
  });
});
exports.showRides = catchAsync(async (req, res, next) => {
  try {
    const { _id } = res.locals.currentUser;
    const driverId = _id.toString();

    const rides = await Ride.find({ driverId: driverId });
    res.status(200).json({
      data: rides,
      status: "success",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

exports.showBooks = catchAsync(async (req, res, next) => {
  try {
    const { _id } = res.locals.currentUser;
    const passengerId = _id.toString();
    console.log(passengerId);

    const books = await Book.find({ passenger: passengerId });
    res.status(200).json({
      data: books,
      status: "success",
    });
  } catch (err) {
    console.error(err);
  }
});
exports.deleteBook = catchAsync(async (req, res, next) => {
  try {
    const { bookId, rideId, numOfSeatsBooked } = req.params;
    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({
        status: "error",
        message: "Ride not found",
      });
    }
    const newSeats = parseInt(ride.availableSeats) + parseInt(numOfSeatsBooked);
    console.log(ride);
    // console.log(newSeats)
    await ride
      .updateOne({ availableSeats: newSeats }, { new: true })
      .then(async () => {
        const book = await Book.findOneAndDelete(bookId);
        if (!book) {
          res.status(404).json({
            status: "error",
            message: "Book not found",
          });
        }
      });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(404).json({
      status: "error",
    });
  }
});

//////

exports.addRide = catchAsync(async (req, res, next) => {
  try {
    const { _id } = res.locals.currentUser;
    const companyId = _id.toString();
    const ride = await Ride.create({
      depatureDate: req.body.depatureDate,
      depatureTime: req.body.depatureTime,
      arrivingTime: req.body.arrivingTime,

      travelLine: req.body.travelLine,

      availableSeats: req.body.seats,
      seats: req.body.seats,
      pricePerSeat: req.body.pricePerSeat,

      carColor: req.body.carColor,
      carType: req.body.carType,

      companyId: companyId,

      driverId: req.body.driverId,
    });

    res.status(201).json({
      status: "success",
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

exports.rides = catchAsync(async (req, res, next) => {
  try {
    let rides;
    if (req.body.driverId) {
      rides = await Ride.find({ driverId: req.body.driverId })
        .populate("driverId")
        .populate("companyId")
        .populate("travelLine");
    } else if (req.body.companyId) {
      rides = await Ride.find({ companyId: req.body.companyId })
        .populate("driverId")
        .populate("companyId")
        .populate("travelLine");
    } else {
      rides = await Ride.find()
        .populate("driverId")
        .populate("companyId")
        .populate("travelLine");
    }

    // const rides = findedRides.map((ride) => {
    //   const { ratings, ...rideWithoutRatings } = ride.toObject();
    //   return rideWithoutRatings;
    // });

    res.status(200).json({
      status: "success",
      results: rides.length,
      data: {
        rides,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.findRides = catchAsync(async (req, res, next) => {
  try {
    const { depatureDate, depatureTime, from, to } = req.body;

    const travelLineQuery = {};

    if (from) travelLineQuery.from = from;
    if (to) travelLineQuery.to = to;

    const travelLines = await TravelLine.find(travelLineQuery);

    const travelLineIds = travelLines.map((travelLine) => travelLine._id);

    const rideQuery = {
      travelLine: { $in: travelLineIds },
    };

    if (depatureTime) {
      rideQuery.depatureTime = depatureTime;
    }

    if (depatureDate) {
      rideQuery.depatureDate = depatureDate;
    }

    const rides = await Ride.find(rideQuery);

    if (rides.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "Rides not found",
      });
    }

    res.status(200).json({
      status: "success",
      results: rides.length,
      data: {
        rides,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
});

exports.updateRideAndDriverState = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rideState, driverState } = req.body;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (rideState) ride.rideState = rideState;
    if (driverState) ride.driverState = driverState;

    if (driverState == "accepted") ride.rideState = "ongoing";

    await ride.save();

    res.status(200).json({ message: "Ride states updated", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

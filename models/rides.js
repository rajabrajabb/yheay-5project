const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  depatureDate: String,
  depatureTime: String,
  arrivingTime: String,
  availableSeats: Number,
  seats: Number,
  pricePerSeat: Number,
  carColor: String,
  carType: {
    type: String,
    required: true,
    enum: ["truck", "car", "bus"],
  },
  driverId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  travelLine: {
    type: mongoose.Schema.ObjectId,
    ref: "TravelLine",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  rideState: {
    type: String,
    enum: ["ongoing", "arrived"],
    default: "ongoing",
  },
  driverState: {
    type: String,
    enum: ["waiting", "accepted", "rejected"],
    default: "waiting",
  },

  rate: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  ratings: {
    type: [Number],
    default: [],
  },
});
// rideSchema.pre("remove", function (next) {
//   bookSchema.remove({ ride: this._id }).exec();
//   next();
// });
rideSchema.pre("find", function (next) {
  this.populate("driverId");
  next();
});
rideSchema.pre("find", function (next) {
  this.populate("travelLine");
  next();
});

module.exports = mongoose.model("Ride", rideSchema);

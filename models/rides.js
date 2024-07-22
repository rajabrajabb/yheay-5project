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
  driverId: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  companyId: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  travelLineId: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "TravelLine",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
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

module.exports = mongoose.model("Ride", rideSchema);

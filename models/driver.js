const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  carBrand: {
    type: String,
    required: true,
  },
  carColor: {
    type: String,
    required: true,
  },
  carNumber: {
    type: String,
    required: true,
  },
  carType: {
    type: String,
    required: true,
    enum: ["truck", "car", "bus"],
  },
  carImage: {
    type: String,
    default: "/images/car.png",
  },
  seats: {
    type: Number,
    default: 4,
  },
});

module.exports = mongoose.model("Driver", driverSchema);

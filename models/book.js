const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  numOfSeatsBooked: {
    type: Number,
    validate: {
      validator: function (seats) {
        // 'this' refers to the current document being validated
        return seats <= this.ride[0].availableSeats;
      },
      message: "Number of seats booked cannot exceed available seats.",
    },
  },
  totalPrice: Number,
  passenger: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  ride: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Ride",
    },
  ],
  identityNumber: String,
});

bookSchema.pre("find", function (next) {
  this.populate("passenger");
  this.populate("ride");
  next();
});

module.exports = mongoose.model("Book", bookSchema);

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please tell us your first name"],
  },
  lastName: {
    type: String,
    required: [true, "Please tell us your last name"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minlength: 8,
    select: false,
  },
  dateOfBirth: Date,
  phoneNumber: {
    type: Number,
    required: true,
    minlength: [10, "Your Phone number should be 10 numbers"],
    maxlength: [10, "Your Phone number should be 10 numbers"],
  },
  image: {
    type: String,
    default: "/images/profile.png",
  },
  bio: String,
  role: {
    type: String,
    enum: ["admin", "employee", "customer", "company"],
    default: "customer",
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
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
  comments: [
    {
      comment: { type: String, required: true },
      username: { type: String, required: true },
    },
  ],
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.methods.correctPassword = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

module.exports = mongoose.model("User", userSchema);

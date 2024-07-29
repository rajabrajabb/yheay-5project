const jwt = require("jsonwebtoken");
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const fs = require("fs");
const { promisify } = require("util");
const uuidv4 = require("uuid").v4;
const path = require("path");

const signToken = (id) => {
  console.log("send");
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  console.log("token");
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("token", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    role: user.role,
    _id: user._id,
    username: user.firstName + " " + user.lastName,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  console.log("helloooo");
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    dateOfBirth: req.body.dateOfBirth,
    phoneNumber: req.body.phoneNumber,
    role: req.body.role,
  });
  try {
    createSendToken(newUser, 201, res);
  } catch (err) {
    next(err);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("jkjhsadjkj");
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("incorrect email or password", 401));
  }
  if (user.isBlocked) {
    return next(
      new AppError(
        "Your account has been blocked. Please contact support.",
        403
      )
    );
  }

  try {
    createSendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "loggedout", {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
});

exports.update = catchAsync(async (req, res, next) => {
  console.log(req.body);
  if (req.body.newPassword) {
    const user = await User.findById(req.params.id).select("+password");
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError("Incorect Password"), 401);
    }
    user.password = req.body.newPassword;
    await user.save();
  }
  if (req.body.image) {
    // Extract the base64 data and MIME type from the incoming data object
    const matches = req.body.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const mimeType = matches[1];
    const base64Data = matches[2];
    // Generate a random filename for the image
    let ext;
    if (mimeType === "image/png") {
      ext = ".png";
    } else if (mimeType === "image/jpeg") {
      ext = ".jpg";
    } else {
      console.error(`Unsupported file type: ${mimeType}`);
      return;
    }
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(__dirname, "../public", "images", fileName);
    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
    // Construct the URL of the uploaded file
    const fileUrl = `/images/${fileName}`;
    const options = { ...req.body, image: fileUrl };
    const user = await User.findByIdAndUpdate(req.params.id, options, {
      new: true,
    });
    if (!user) {
      return next(new AppError("No User found with this id"));
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } else {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) {
      return next(new AppError("No User found with this id"));
    }
    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  }
});

exports.delete = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("No User found with this id"));
  }
  res.status(200).json({
    status: "success",
  });
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.token) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.token,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    res.locals.currentUser = currentUser;
    return next();
  } else {
    return next(new AppError("you must be loged in ", 401));
  }
});

exports.userProfile = catchAsync(async (req, res, next) => {
  const currentUser = await res.locals.currentUser;
  res.status(200).json({
    status: "success",
    data: {
      currentUser,
    },
  });
});

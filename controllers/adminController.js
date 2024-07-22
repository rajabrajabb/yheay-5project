const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");

exports.users = catchAsync(async (req, res, next) => {
  try {
    if (res.locals.currentUser.role != "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const users = await User.find();

    res.status(200).json({
      status: "success",
      results: users.length,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  try {
    if (res.locals.currentUser.role != "admin") {
      return res.status(403).json({
        status: "error",
        message: "You are not authorized to perform this action.",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "successfully delete the user",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

exports.blockUser = catchAsync(async (req, res, next) => {
  if (res.locals.currentUser.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to perform this action.",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User has been blocked.",
    user,
  });
});

exports.unblockUser = catchAsync(async (req, res, next) => {
  if (res.locals.currentUser.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "You are not authorized to perform this action.",
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found.",
    });
  }

  res.status(200).json({
    status: "success",
    message: "User has been unblocked.",
    user,
  });
});

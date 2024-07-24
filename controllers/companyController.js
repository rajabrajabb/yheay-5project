const TravelLine = require("../models/travelLine");
const User = require("../models/user");
const Ride = require("../models/rides");

const mongoose = require("mongoose");

exports.createTravelLine = async (req, res) => {
  try {
    const { _id } = res.locals.currentUser;
    const companyId = _id.toString();
    const { from, to } = req.body;

    const travelLine = new TravelLine({
      from,
      to,
      companyId,
    });

    await travelLine.save();

    res.status(201).json(travelLine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTravelLine = async (req, res) => {
  try {
    const { _id } = res.locals.currentUser;
    const companyId = _id.toString();

    const travelLines = await TravelLine.find({ companyId });

    if (!travelLines || travelLines.length === 0) {
      return res
        .status(404)
        .json({ message: "No travel lines found for the given company" });
    }

    res.status(200).json(travelLines);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.createEmployeeAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    const { _id } = res.locals.currentUser;
    const companyId = _id.toString();
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      dateOfBirth: req.body.dateOfBirth,
      phoneNumber: req.body.phoneNumber,
      companyId: companyId,
      role: "employee",
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getEmployeesByCompanyId = async (req, res) => {
  try {
    const { _id } = res.locals.currentUser;
    const companyId = _id.toString();
    const employees = await User.find({ companyId });

    if (!employees || employees.length === 0) {
      return res
        .status(404)
        .json({ message: "No employee found for the given company" });
    }

    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.setNewDriverToAride = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { driverId } = req.body;

    const ride = await Ride.findById(rideId);

    if (ride.driverState == "accepted" || ride.driverState == "waiting") {
      return res.status(400).json({ error: "Ride already has a driver" });
    }

    ride.driverId = driverId;
    ride.driverState = "waiting";

    await ride.save();

    res.status(200).json({ message: "Ride driver updated", ride });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.rateAcompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { rating } = req.body;

    const user = await User.findById(companyId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    user.ratings.push(rating);
    user.rate =
      user.ratings.reduce((acc, curr) => acc + curr, 0) / user.ratings.length;

    await user.save();

    res.status(200).json({ message: "company rating updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { comment, username } = req.body;

    if (!comment || !username) {
      return res.status(400).json({
        status: "fail",
        message: "Comment and username are required",
      });
    }

    const user = await User.findById(companyId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    user.comments.push({ comment, username });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Comment added successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.rateAcompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { rating } = req.body;

    const user = await User.findById(companyId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    user.ratings.push(rating);
    user.rate =
      user.ratings.reduce((acc, curr) => acc + curr, 0) / user.ratings.length;

    await user.save();

    res.status(200).json({ message: "company rating updated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { comment, username } = req.body;

    if (!comment || !username) {
      return res.status(400).json({
        status: "fail",
        message: "Comment and username are required",
      });
    }

    const user = await User.findById(companyId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    user.comments.push({ comment, username });

    await user.save();

    res.status(201).json({
      status: "success",
      message: "Comment added successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.companies = async (req, res, next) => {
  try {
    const companies = await User.find({ role: "company" }).select(
      "-ratings -comments"
    );

    if (companies.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No companies found",
      });
    }

    res.status(200).json({
      status: "success",
      results: companies.length,
      data: {
        companies,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

exports.companyProfile = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    const user = await User.findById(companyId);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const TravelLine = require("../models/travelLine");
const User = require("../models/user");

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

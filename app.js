const helmet = require("helmet");
const express = require("express");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const rideRoutes = require("./routes/ridesRoutes");
const adminRoutes = require("./routes/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.static("public"));
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
// app.use(helmet);

//app . uses for your routes

app.get("/get", (req, res, next) => {
  res.status(200).json({
    data: "anyany",
  });
});
app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.use("/", userRoutes);
app.use("/api", rideRoutes);
app.use("/api", companyRoutes);
app.use("/admin", adminRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

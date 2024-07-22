const Driver = require("../models/driver");

exports.createDriver = async (req, res) => {
  try {
    const {
      driverId,
      carBrand,
      carColor,
      carNumber,
      carType,
      carImage,
      seats,
    } = req.body;

    if (image) {
      // Extract the base64 data and MIME type from the incoming data object
      const matches = req.body.image.match(
        /^data:([A-Za-z-+\/]+);base64,(.+)$/
      );
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

      const fileUrl = `/images/${fileName}`;

      const newDriver = new Driver({
        driverId,
        carBrand,
        carColor,
        carNumber,
        carType,
        carImage: fileUrl || "/images/car.png",
        seats: seats || 4,
      });

      const savedDriver = await newDriver.save();
      res.status(201).json(savedDriver);
    }
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  if (!file) {
    return cb(new Error("No file uploaded."), false);
  }

  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
  ];
  const allowedPdfTypes = ["application/pdf"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedPdfTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only image (JPG, PNG, WEBP) and PDF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "productImage", maxCount: 1 },
]);

const checkUploadedFiles = (req, res, next) => {
  if (!req.files) {
    return res
      .status(400)
      .json({ success: false, message: "No files uploaded" });
  }
  next();
};

const uploadToCloudinary = async (file, type) => {
  const baseFolder = "CoffeeSpot";
  let folder = `${baseFolder}`;

  if (type === "profilePicture") {
    folder += "/profilePictures";
  } else if (type === "productImage") {
    folder += "/productImages";
  } else {
    throw new Error("Invalid file type");
  }

  try {
    const timestamp = Date.now();
    const globalFileName = `${timestamp}`;

    let resourceType = "image";

    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      public_id: globalFileName,
      resource_type: resourceType,
    });

    return { url: result.secure_url };
  } catch (error) {
    console.error("Error Uploading to Cloudinary:", error);
    throw new Error("Error uploading to Cloudinary");
  }
};

const deleteFromCloudinary = async (fileUrl) => {
  try {
    const matches = fileUrl.match(
      /\/(?:image|raw)\/upload\/(?:v\d+\/)?([^?]+)/
    );

    if (!matches || matches.length < 2) {
      console.error(`Failed to extract public ID from URL: ${fileUrl}`);
      return;
    }

    let publicId = matches[1];

    if (fileUrl.includes("/image/upload/")) {
      publicId = publicId.replace(/\.[^.]+$/, "");
    }

    const resourceType = fileUrl.includes("/image/upload/") ? "image" : "raw";

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok") {
      console.error(`Cloudinary Deletion Failed for: ${fileUrl}`);
    }
  } catch (error) {
    console.error("Error Deleting from Cloudinary:", error);
    throw new Error("Cloudinary Deletion Failed");
  }
};

module.exports = {
  upload,
  checkUploadedFiles,
  uploadToCloudinary,
  deleteFromCloudinary,
};

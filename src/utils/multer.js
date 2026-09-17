const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Multer storage that routes files by :kind
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let targetDir;
    // Check file name and assign corresponding folder from FOLDER_MAP
    if (file.fieldname == "profile_image") {
      targetDir = path.join(path.resolve("uploads"), "profileImages");
    } else if (file.fieldname == "category_image") {
      targetDir = path.join(path.resolve("uploads"), "categoryImages");
    } else if (file.fieldname == "product_image") {
      targetDir = path.join(path.resolve("uploads"), "productImages");
    } else {
      return cb(
        new Error(
          'Invalid file name. File name must include "profile_image", "category_image", or "product_image".'
        )
      );
    }

    // Create folder if it doesn't exist
    fs.mkdir(targetDir, { recursive: true }, (err) => {
      if (err) return cb(err);
      cb(null, targetDir);
    });
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "_")
      .toLowerCase();
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

// File type filter: only allow images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    return cb(null, true); // Accept the file
  }
  // Reject the file with a descriptive error
  const error = new Error(
    `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WebP, and GIF images are allowed.`
  );
  error.code = "INVALID_FILE_TYPE";
  cb(error, false);
};

// Set file size limit and apply filter
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size: 5MB
  fileFilter,
});
module.exports = upload;

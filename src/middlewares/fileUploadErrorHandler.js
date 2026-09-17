const multer = require("multer");
const sendResponse = require("../utils/sendResponse");

const fileUploadErrorHandler =  (error, req, res, next) => {
  // Handle file filter errors
  if (error.code === "INVALID_FILE_TYPE") {
    return sendResponse(res, 400, false, "INVALID_FILE_TYPE", error.message);
  }

  // Handle Multer errors
  if (error instanceof multer.MulterError) {
    let message = "File upload error";
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      message =
        "Unexpected field. Expected field name: profile_img, category_image, or product_image.";
    } else if (error.code === "LIMIT_FILE_SIZE") {
      message = "File size too large. Maximum allowed size is 5MB.";
    } else {
      message = error.message;
    }
    return sendResponse(res, 400, false, message, error.code);
  }

  // Handle other file-related errors
  if (error.message && error.message.includes("Invalid file type")) {
    return sendResponse(res, 400, false, "INVALID_FILE_TYPE", error);
  }
  next(error);
};

module.exports = { fileUploadErrorHandler };

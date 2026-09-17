const User = require("../../models/user");
const sendResponse = require("../../utils/sendResponse");
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const getProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return sendResponse(res, 404, false, "User profile not found");
    }

    // Add full URL for profile image
    const userObj = user.toObject();
    const wordexist = userObj.profile_image?.includes("uploads");

    if (wordexist) {
      if (userObj.profile_image) {
        userObj.profile_image = `${BASE_URL}/${userObj.profile_image.replace(
          /\\/g,
          "/"
        )}`;
      }
    }

    return sendResponse(
      res,
      200,
      true,
      "User profile fetched successfully",
      userObj
    );
  } catch (err) {
    console.error("Error in get profile api", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in get profile API"
    );
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone_no, address } = req.body;

    let updateData = { name, phone_no, address };

    if (req.file) {
      const user = await User.findById(userId);

      // Delete old image if exists and is not default
      if (
        user.profile_image &&
        !user.profile_image.includes("Default_pfp.jpg")
      ) {
        const oldImagePath = path.resolve(user.profile_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("Old profile image deleted:", oldImagePath);
        }
      }

      // Save relative path
      updateData.profile_image = path.join(
        "uploads",
        "profileImages",
        req.file.filename
      );
    }

    let updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    // Add full URL for profile image
    updatedUser = updatedUser.toObject();
    const wordexist = updatedUser.profile_image?.includes("uploads");
    if (wordexist) {
      if (updatedUser.profile_image) {
        updatedUser.profile_image = `${BASE_URL}/${updatedUser.profile_image.replace(
          /\\/g,
          "/"
        )}`;
      }
    }

    return sendResponse(
      res,
      200,
      true,
      "Profile updated successfully",
      updatedUser
    );
  } catch (err) {
    console.error("Error updating profile:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error updating profile"
    );
  }
};

module.exports = { getProfile, updateProfile };

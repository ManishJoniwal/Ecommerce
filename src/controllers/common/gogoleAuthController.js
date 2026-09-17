// routes/googleAuth.js
const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const User = require("../../models/user"); // adjust path if needed
const sendResponse = require("../../utils/sendResponse");
const { encrypt } = require("../../utils/bcrypt");
const { generateToken } = require("../../utils/jwt");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const authGoogle = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return sendResponse(res, 400, false, "Google access token is required");
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: access_token,
      audience: CLIENT_ID,
    });

    const userInfo = ticket.getPayload(); // contains { email, name, picture, given_name, family_name ... }
    console.log(userInfo)

    if (!userInfo || !userInfo.email) {
      return sendResponse(res, 400, false, "Invalid Google access token");
    }

    // Check if user already exists
    let user = await User.findOne({ email: userInfo.email });
    let message = `Welcome back ${userInfo.name}`;

    if (!user) {
      // If new user → create account
      const defaultPassword = await encrypt("default"); // using your bcrypt util

      user = await new User({
        name: userInfo.name,
        email: userInfo.email,
        password: defaultPassword,
        profile_image: userInfo.picture,
      });
      await user.save();

      message = "User signed up successfully with Google";
    }

    // Prepare JWT payload
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    // Generate JWT token using your util
    const token = generateToken(tokenPayload);

    return sendResponse(res, 200, true, message, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_image: user.profile_image,
      },
      token,
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    return sendResponse(res, 500, false, "Internal Server Error");
  }
};

module.exports = {authGoogle}

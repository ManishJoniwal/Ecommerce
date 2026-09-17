const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateToken(payload, expiresIn = process.env.JWT_EXPIRY || "7d") {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    return null; // or throw error if you prefer
  }
}

module.exports = {
  generateToken,
  verifyToken,
};

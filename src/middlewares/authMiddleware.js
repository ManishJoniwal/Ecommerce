const jwt = require("jsonwebtoken");
const sendResponse = require("../utils/sendResponse");

const authnticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return sendResponse(res, 401, false, "Authorization header missing");

  const token = authHeader.split(" ")[1];
  if (!token) return sendResponse(res, 401, false, "Token missing");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return sendResponse(res, 401, false, "Access denied");
  }
  next();
};

module.exports = { authnticate, isAdmin };

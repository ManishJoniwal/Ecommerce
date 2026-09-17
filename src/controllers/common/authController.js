const sendResponse = require("../../utils/sendResponse");
const User = require("../../models/user");
const { generateToken } = require("../../utils/jwt");
const { encrypt, match } = require("../../utils/bcrypt");
const {
  registerValidation,
  loginValidation,
} = require("../../utils/validation");

const loginController = async (req, res) => {
  try {
    const { error } = await loginValidation(req.body);
    const { email, password } = req.body;
    if (error) {
      return sendResponse(
        res,
        400,
        false,
        error.details.map((e) => e.message)
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    // Validate password
    const isPasswordValid = await match(password, user.password);
    if (!isPasswordValid) {
      return sendResponse(res, 401, false, "Invalid email or password");
    }

    // Generate JWT token
    const tokenPayload = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    let token = await generateToken(tokenPayload);


    // Return minimal user info (avoid sending password)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return sendResponse(res, 200, true, "Login successful", {
      user: userInfo,
      token,
    });
  } catch (err) {
    console.error("Error logging in user:", err);
    return sendResponse(res, 500, false, err.message || "error in login api");
  }
};

const registerController = async (req, res) => {
  try {
    // Validate input
    const { error } = registerValidation(req.body);
    if (error) {
      return sendResponse(
        res,
        400,
        false,
        error.details.map((e) => e.message)
      );
    }

    // Check if user already exists
    const isExist = await User.findOne({ email: req.body.email });
    if (isExist) {
      return sendResponse(
        res,
        400,
        false,
        "User Already Registered, please login"
      );
    }

    // Hash password
    const hashedPassword = await encrypt(req.body.password);

    // Create new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone,
      address: req.body.address,
      // role: req.body.role || "User",
    });

    await newUser.save();

    // Generate JWT token
    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const token = await generateToken(tokenPayload);

    sendResponse(res, 200, true, "User Successfully Registered", {
      user: newUser,
      token,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in register API"
    );
  }
};
module.exports = { loginController, registerController };

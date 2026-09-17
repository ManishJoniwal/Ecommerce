const Joi = require("joi");

// Define schema
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).trim().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
    phone_no: Joi.string().min(10),
    address: Joi.string(),
    role: Joi.string().valid("User", "Admin").default("User"),
  });
  return schema.validate(data, { abortEarly: false });
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).required(),
  });
  return schema.validate(data, { abortEarly: false });
};

const categoryValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(20).trim().required(),
    description: Joi.string().min(3).max(50).trim().required(),
    image: Joi.string(),
    status: Joi.default("active"),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { registerValidation, loginValidation, categoryValidation };

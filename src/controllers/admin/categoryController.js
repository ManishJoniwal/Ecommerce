const Category = require("../../models/category");
const sendResponse = require("../../utils/sendResponse");
const { categoryValidation } = require("../../utils/validation");
const path = require("path");
const fs = require("fs");
const { RedisCache } = require("../../utils/redis");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !description) {
      // cleanup uploaded image
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendResponse(
        res,
        400,
        false,
        "Please provide name and description"
      );
    }

    // check for duplicate category name
    const isExist = await Category.findOne({ name });
    if (isExist) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendResponse(res, 400, false, "Category already exists");
    }

    // handle image
    let imagePath = null;
    if (req.file) {
      imagePath = path.join("uploads", "categoryImages", req.file.filename);
    }

    const newCategory = await Category.create({
      name,
      description,
      status: status || "active",
      category_image: imagePath,
    });

    // format response
    let categoryObj = newCategory.toObject();
    if (categoryObj.category_image) {
      categoryObj.category_image = `${BASE_URL}/${categoryObj.category_image.replace(
        /\\/g,
        "/"
      )}`;
    }

    await RedisCache.del("category:*");
    return sendResponse(
      res,
      201,
      true,
      "Category created successfully",
      categoryObj
    );
  } catch (err) {
    console.error("Error in createCategory API:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in create category API"
    );
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    let category = await Category.findById(id);
    if (!category) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return sendResponse(res, 404, false, "Category not found");
    }

    // If new image uploaded, delete old one
    if (req.file) {
      if (category.category_image && fs.existsSync(category.category_image)) {
        fs.unlinkSync(category.category_image);
        console.log("Old category image deleted:", category.category_image);
      }
      category.category_image = path.join(
        "uploads",
        "categoryImages",
        req.file.filename
      );
    }

    // update fields
    if (name) category.name = name;
    if (description) category.description = description;
    if (status) category.status = status;

    await category.save();

    // format response
    let categoryObj = category.toObject();
    if (categoryObj.category_image) {
      categoryObj.category_image = `${BASE_URL}/${categoryObj.category_image.replace(
        /\\/g,
        "/"
      )}`;
    }

    await RedisCache.del("category:*");
    return sendResponse(
      res,
      200,
      true,
      "Category updated successfully",
      categoryObj
    );
  } catch (err) {
    console.error("Error in updateCategory API:", err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in update category API"
    );
  }
};

const deleteCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find category by ID
    const category = await Category.findById(id);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    // Delete image if exists
    if (category.category_image) {
      const imagePath = path.resolve(category.category_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("Category image deleted:", imagePath);
      }
    }

    // Delete category from DB
    await Category.findByIdAndDelete(id);

    // delete from redis cache
    await RedisCache.del("category:*");

    return sendResponse(res, 200, true, "Category deleted successfully");
  } catch (err) {
    console.error("Error in deleteCategory API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error deleting category"
    );
  }
};

module.exports = {
  createCategory,
  updateCategory,
  deleteCategoryById,
};

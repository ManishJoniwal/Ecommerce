const Category = require("../../models/category");
const sendResponse = require("../../utils/sendResponse");
const { categoryValidation } = require("../../utils/validation");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";
const { RedisCache } = require("../../utils/redis");

const getAllCategorys = async (req, res) => {
  try {
    let { name, status = "active", page = 1, limit = 10 } = req.query;

    // convert page/limit to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    const cacheKey = `category:${name || "all"}:${status}:${page}:${limit} `;

    const cached = await RedisCache.get(cacheKey);
    if (cached) {
      console.log("feteched category from Redis cache");
      return sendResponse(res, 200, true, "Category (from cache)", cached);
    }

    // build filter
    let filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // case-insensitive search
    }
    if (status && ["active", "inactive"].includes(status)) {
      filter.status = status;
    }

    // get total count
    const totalCategory = await Category.countDocuments(filter);

    // fetch data with pagination
    const categories = await Category.find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // format image url
    const formattedCategories = categories.map((cat) => {
      const obj = cat.toObject();
      if (obj.category_image) {
        obj.category_image = `${BASE_URL}/${obj.category_image.replace(
          /\\/g,
          "/"
        )}`;
      }
      return obj;
    });

    const response = {
      categorys: formattedCategories,
      pagination: {
        total: totalCategory,
        page,
        limit,
        totalPages: Math.ceil(totalCategory / limit),
      },
    };

    await RedisCache.set(cacheKey, response);
    return sendResponse(
      res,
      200,
      true,
      "Categories fetched successfully",
      response
    );
  } catch (err) {
    console.error("Error in getAllCategory API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error in get all categories API"
    );
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const cachedCategory = await RedisCache.get(`category:${id}`);
    if (cachedCategory) {
      console.log("fetched category from Redis cache");
      return sendResponse(
        res,
        200,
        true,
        "category fetched from cache",
        cachedCategory
      );
    }

    let category = await Category.findById(id);
    if (!category) {
      return sendResponse(res, 404, false, "Category not found");
    }

    category = category.toObject();
    if (category.category_image) {
      category.category_image = `${BASE_URL}/${category.category_image.replace(
        /\\/g,
        "/"
      )}`;
    }
    await RedisCache.set(`category:${id}`, category);

    return sendResponse(
      res,
      200,
      true,
      "Category fetched successfully",
      category
    );
  } catch (err) {
    console.error("Error in getCategoryById API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching category"
    );
  }
};

module.exports = {
  getAllCategorys,
  getCategoryById,
};

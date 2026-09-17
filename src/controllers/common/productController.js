const Category = require("../../models/category");
const sendResponse = require("../../utils/sendResponse");
const Product = require("../../models/product");
const { RedisCache } = require("../../utils/redis");
// const client = require("../../utils/redis");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const getAllProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      sortBy = "created_at",
      order = "desc",
      category,
      minPrice,
      maxPrice,
      is_featured,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const cacheKey = `product:${page}:${limit}:${sortBy}:${order}:${
      category || "all"
    }:${minPrice || 0}:${maxPrice || 0}:${is_featured || "all"}`;

    // Check Redis cache
    const cached = await RedisCache.get(cacheKey);
    if (cached) {
      console.log("feteched products from Redis cache");
      return sendResponse(res, 200, true, "Products (from cache)", cached);
    }

    // filters
    let filters = {};

    if (category) {
      filters.category = category; // category id
    }

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    if (is_featured !== undefined) {
      filters.is_featured = is_featured === "true";
    }

    // Sorting
    let sortOption = {};
    sortOption[sortBy] = order === "asc" ? 1 : -1;

    // Get products
    const products = await Product.find(filters)
      .populate("category", "name status") // populate category name/status
      // .populate("reviews") // optional
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit);

    // Total count
    const totalProducts = await Product.countDocuments(filters);

    // Add full image URL in response
    const productsWithImage = products.map((p) => {
      const obj = p.toObject();
      if (obj.product_image) {
        obj.product_image = `${BASE_URL}/${obj.product_image.replace(
          /\\/g,
          "/"
        )}`;
      }
      return obj;
    });

    const response = {
      products: productsWithImage,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
    };

    await RedisCache.set(cacheKey, response);
    return sendResponse(
      res,
      200,
      true,
      "Products fetched successfully",
      response
    );
  } catch (err) {
    console.error("Error in getAllProducts API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error fetching products"
    );
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      sendResponse(res, 404, false, "please provide id for this product");
    }
    const cachedProduct = await RedisCache.get(`product:${id}`);
    if (cachedProduct) {
      console.log("fetched product from Redis cache");
      return sendResponse(
        res,
        200,
        true,
        "Product fetched from cache",
        cachedProduct
      );
    }

    let product = await Product.findById(id);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found");
    }

    product = product.toObject();
    if (product.product_image) {
      product.product_image = `${BASE_URL}/${product.product_image.replace(
        /\\/g,
        "/"
      )}`;
    }

    // console.log(product);
    // stor product
    await RedisCache.set(`product:${id}`, product);
    return sendResponse(
      res,
      200,
      true,
      "product fetched successfully",
      product
    );
  } catch (err) {
    console.error("Error getProductByid api", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error getProductByid api"
    );
  }
};

module.exports = { getProductById, getAllProducts };

const Category = require("../../models/category");
const sendResponse = require("../../utils/sendResponse");
const path = require("path");
const fs = require("fs");
const Product = require("../../models/product");
const { RedisCache } = require("../../utils/redis");
const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

const createProduct = async (req, res) => {
  try {
    const { name, price, category, is_featured, video_url, quantity } =
      req.body;

    // Validation
    if (!name || !price || !category) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide all required fields: name, price, category"
      );
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return sendResponse(res, 404, false, "Category not found");
    }

    // Check if product with same name already exists (case-insensitive)
    const existingProduct = await Product.findOne({ name });
    if (existingProduct) {
      return sendResponse(
        res,
        400,
        false,
        "Product with this name already exists"
      );
    }

    // Handle image
    let imagePath = null;
    if (req.file) {
      imagePath = path.join("uploads", "productImages", req.file.filename);
    }

    // Create product
    let newProduct = await Product.create({
      name,
      price,
      category,
      is_featured: is_featured || false,
      video_url: video_url || null,
      quantity: quantity || 0,
      product_image: imagePath,
    });

    // Convert to object and add full image URL for response
    let productObj = newProduct.toObject();
    if (productObj.product_image) {
      productObj.product_image = `${BASE_URL}/${productObj.product_image.replace(
        /\\/g,
        "/"
      )}`;
    }
    const keys = await RedisCache.del("product:*");
    return sendResponse(
      res,
      201,
      true,
      "Product created successfully",
      productObj
    );
  } catch (err) {
    console.error("Error in createProduct API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error creating product"
    );
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, category, is_featured, video_url, quantity } =
      req.body;

    // Find product
    let product = await Product.findById(req.params.id);
    if (!product) {
      return sendResponse(res, 404, false, "Product not found for this ID");
    }

    // Check if category exists
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return sendResponse(res, 404, false, "Category not found");
      }
    }

    // Check for duplicate product name (case-insensitive, excluding current product)
    if (name) {
      const existingProduct = await Product.findOne({
        name: { $regex: new RegExp("^" + name + "$", "i") },
        _id: { $ne: req.params.id },
      });
      if (existingProduct) {
        return sendResponse(
          res,
          400,
          false,
          "Another product with this name already exists"
        );
      }
      product.name = name;
    }

    // Update other fields if provided
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (is_featured !== undefined) product.is_featured = is_featured;
    if (video_url !== undefined) product.video_url = video_url;
    if (quantity !== undefined) product.quantity = quantity;

    // Handle image update
    if (req.file) {
      // delete old image if exists
      if (product.product_image) {
        const oldImagePath = path.resolve(product.product_image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Save new image path
      product.product_image = path.join(
        "uploads",
        "productImages",
        req.file.filename
      );
    }

    await product.save();
    const keys = await RedisCache.del("product:*");

    // Format response with full URL
    let productObj = product.toObject();
    if (productObj.product_image) {
      productObj.product_image = `${BASE_URL}/${productObj.product_image.replace(
        /\\/g,
        "/"
      )}`;
    }

    return sendResponse(
      res,
      200,
      true,
      "Product updated successfully",
      productObj
    );
  } catch (err) {
    console.error("Error in updateProduct API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error updating product"
    );
  }
};

const deleteProductById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return sendResponse(res, 400, false, "please provide product id");
    }
    const product = await Product.findById(id);
    if (!product) {
      return sendResponse(res, 404, false, "product for this id not found");
    }

    // Delete image if exists
    if (product.product_image) {
      const imagePath = path.resolve(product.product_image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log("product image deleted:", imagePath);
      }
    }

    await Product.findByIdAndDelete(id);

    const keys = await RedisCache.del("product:*");

    return sendResponse(res, 200, true, "prdocut delted successfully");
  } catch (err) {
    console.error("Error in updateProduct API:", err);
    return sendResponse(
      res,
      500,
      false,
      err.message || "Error updating product"
    );
  }
};

module.exports = { createProduct, updateProduct, deleteProductById };

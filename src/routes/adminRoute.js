const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategoryById,
} = require("../controllers/admin/categoryController");
const router = express.Router();
const { authnticate, isAdmin } = require("../middlewares/authMiddleware");
const upload = require("../utils/multer");
const {
  fileUploadErrorHandler,
} = require("../middlewares/fileUploadErrorHandler");
const {
  createProduct,
  updateProduct,
  deleteProductById,
} = require("../controllers/admin/productController");

const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/admin/orderController");
const { getStats } = require("../controllers/admin/statsController");
const { checkImageQuality } = require("../utils/image");

// category route
router.post(
  "/create-category",
  authnticate,
  isAdmin,
  upload.single("category_image"),
  fileUploadErrorHandler,
  createCategory
);
router.put(
  "/update-category/:id",
  authnticate,
  isAdmin,
  upload.single("category_image"),
  fileUploadErrorHandler,
  updateCategory
);
router.delete("/delete-category/:id", authnticate, deleteCategoryById);

// product route
router.post(
  "/create-product",
  authnticate,
  isAdmin,
  upload.single("product_image"),
  checkImageQuality,
  fileUploadErrorHandler,
  createProduct
);
router.put(
  "/update-product/:id",
  authnticate,
  isAdmin,
  upload.single("product_image"),
  fileUploadErrorHandler,
  updateProduct
);
router.delete("/delete-product/:id", authnticate, isAdmin, deleteProductById);

//orders
router.get("/fetch-orders", authnticate, isAdmin, getAllOrders);
router.put("/order-status/:id", authnticate, isAdmin, updateOrderStatus);
router.delete("/delete-order/:id", authnticate, isAdmin, deleteOrder);

router.get("/stats", authnticate, isAdmin, getStats);

module.exports = router;

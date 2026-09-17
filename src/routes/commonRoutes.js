// =================== Auth Routes ===================

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: manish@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Successfully logged in
 *
 *       401:
 *         description: Invalid credentials
 */

/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phone_no
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Manish Joniwal
 *               email:
 *                 type: string
 *                 example: manish@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               phone_no:
 *                  type: string
 *                  example: 88248484848
 *               address:
 *                   type: string
 *                   example: kalyan nagar
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */

// =================== Profile Routes ===================

/**
 * @openapi
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *
 *       401:
 *         description: Unauthorized
 *
 */

/**
 * @openapi
 * /update-profile:
 *   put:
 *     summary: Update user profile
 *     description: update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name of the user
 *                 example: "manish"
 *               phone_no:
 *                 type: string
 *                 description: User phone number
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 description: User address
 *                 example: "123 Main Street, City"
 *               profile_image:
 *                 type: string
 *                 format: binary
 *                 description: Profile image file
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *        
 *       400:
 *         description: Bad Request — invalid data or file
 *       401:
 *         description: Unauthorized — missing or invalid JWT
 *       500:
 *         description: Internal Server Error
 */

// =================== category Routes ===================

/**
 * @openapi
 * /get-all-categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter categories by name (case-insensitive)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *         description: Filter categories by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *
 *       500:
 *         description: Server error
 *
 */

/**
 * @openapi
 * /get-category/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Category]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to fetch
 *     responses:
 *       200:
 *         description: Category fetched successfully
 *
 *       404:
 *         description: Category not found
 *
 *       500:
 *         description: Server error
 *
 */

// =================== Product Routes ===================

/**
 * @openapi
 * /get-all-products:
 *   get:
 *     summary: Get all products
 *     tags: [Product]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: is_featured
 *         schema:
 *           type: boolean
 *         description: Filter featured products
 *     responses:
 *       200:
 *         description: Products fetched successfully
 *
 *       500:
 *         description: Server error
 *
 */

/**
 * @openapi
 * /get-product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Product]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to fetch
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *
 *       404:
 *         description: Product not found
 *
 *       500:
 *         description: Server error
 *
 */

// =================== Order Routes ===================
/**
 * @openapi
 * /fetch-orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     description: Fetch details of order
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to fetch
 *     responses:
 *       200:
 *         description: Order fetched successfully
 *
 *       401:
 *         description: Unauthorized (JWT token missing or invalid)
 *
 *       404:
 *         description: Order not found
 *
 *       500:
 *         description: Server error
 *
 */

const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
} = require("../controllers/common/authController");
const {
  getProfile,
  updateProfile,
} = require("../controllers/common/profileController");

const { authnticate } = require("../middlewares/authMiddleware");
const upload = require("../utils/multer");
const {
  fileUploadErrorHandler,
} = require("../middlewares/fileUploadErrorHandler");
const {
  getAllCategorys,
  getCategoryById,
} = require("../controllers/common/categoryController");
const {
  getProductById,
  getAllProducts,
} = require("../controllers/common/productController");
const { getOrderById } = require("../controllers/common/orderController");
const {
  createChat,
  getallChats,
  getMessagesByChatId,
} = require("../controllers/common/chatController");
const { authGoogle } = require("../controllers/common/gogoleAuthController");
// const { sendMessage } = require("../controllers/common/messageController");

//common routes
// auth
router.post("/login", loginController);
router.post("/register", registerController);
router.post("/auth/google", authGoogle);

//profile
router.get("/profile", authnticate, getProfile);
router.put(
  "/update-profile",
  authnticate,
  upload.single("profile_image"),
  fileUploadErrorHandler,
  updateProfile
);

//categoris
router.get("/get-all-categories", getAllCategorys);
router.get("/get-category/:id", getCategoryById);

//products
router.get("/get-product/:id", getProductById);
router.get("/get-all-products", getAllProducts);

//orders
router.get("/fetch-orders/:id", authnticate, getOrderById);

//chats
router.post("/order/create-chat", authnticate, createChat);
router.get("order/get-all-chats", authnticate, getallChats);
router.get("order/get-all-message/:chatid", authnticate, getMessagesByChatId);

module.exports = router;

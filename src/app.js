const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const path = require("path");
const logger = require("./middlewares/logger");
const { rateLimit } = require("express-rate-limit");
require("dotenv").config();

app.use(helmet());
app.use(cors());
app.use("/uploads", express.static("uploads")); // server static files
app.use(express.static(path.join(__dirname, "public"))); // server static files
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }));

//Stripe webhook
const { handleStripeWebhook } = require("./controllers/common/webhookControll");
app.use(
  "/api/v1/stripe/webhooks",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const userRoutes = require("./routes/userRoutes");
const adminRoute = require("./routes/adminRoute");
const commonRoute = require("./routes/commonRoutes");
const sendResponse = require("./utils/sendResponse");
app.use("/api/v1", commonRoute);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoute);

// Import swagger
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
//  Mount Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(logger);
app.use((err, req, res, next) => {
  console.error("error", err.message);
  sendResponse(res, 500, false, err.message);
});
module.exports = app;

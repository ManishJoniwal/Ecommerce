const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce API",
      version: "1.0.0",
      description: "API documentation for Ecommerce app",
    },
    servers: [
      {
        url: "http://localhost:5000/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  // This tells swagger-jsdoc where to look for route documentation
  apis: [path.join(__dirname, "../routes/**/*.js")],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
module.exports = swaggerSpec;

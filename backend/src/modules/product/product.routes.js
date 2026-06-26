const express = require("express");
const router = express.Router();
const controller = require("./product.controller");
const upload = require("../../middlewares/upload");

// Admin routes
router.post("/", upload.array("images", 5), controller.createProduct);
router.get("/", controller.getAllProducts);
router.get("/active", controller.getActiveProducts);
router.get("/:id", controller.getProductById);
router.put("/:id", upload.array("images", 5), controller.updateProduct);
router.patch("/:id/toggle", controller.toggleProductStatus);
router.delete("/:id", controller.deleteProduct);

// Public routes (optional)
const publicRouter = express.Router();
publicRouter.get("/", controller.getActiveProducts);
publicRouter.get("/:id", controller.getProductById);

module.exports = { admin: router, public: publicRouter };

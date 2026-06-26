const express = require("express");
const router = express.Router();
const controller = require("./category.controller");

// Admin routes
router.post("/", controller.createCategory);
router.get("/", controller.getAllCategories);
router.get("/active", controller.getActiveCategories);
router.get("/:id", controller.getCategoryById);
router.put("/:id", controller.updateCategory);
router.patch("/:id/toggle", controller.toggleCategoryStatus);
router.delete("/:id", controller.deleteCategory);

// Public routes (optional, for storefront)
const publicRouter = express.Router();
publicRouter.get("/", controller.getActiveCategories);
publicRouter.get("/:id", controller.getCategoryById);

module.exports = { admin: router, public: publicRouter };

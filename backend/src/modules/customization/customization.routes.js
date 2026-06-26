const express = require("express");
const router = express.Router();
const controller = require("./customization.controller");

// All routes are admin-only (will be protected by ensureAdmin in server.js)

// Get all customizations
router.get("/", controller.getAllCustomizations);

// Get a single customization by ID
router.get("/:id", controller.getCustomizationById);

// Get customization by quotation ID
router.get("/quotation/:quotationId", controller.getByQuotation);

// Create a new customization (usually auto-created when quotation accepted)
router.post("/", controller.createCustomization);

// Update customization status (start, complete, cancel)
router.patch("/:id/status", controller.updateStatus);

// Update customization details
router.put("/:id", controller.updateCustomization);

// Delete customization (admin only, maybe soft delete)
router.delete("/:id", controller.deleteCustomization);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./invoice.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// All invoice routes require authentication
router.use(ensureAuth);

// ✅ PDF download (accessible by customer & admin) – this endpoint is now protected by payment check in controller
router.get("/order/:orderId/pdf", controller.generateInvoicePDF);

// Generate invoice record (admin only)
router.post("/generate/:orderId", ensureAdmin, controller.generateInvoice);

// CRUD operations (admin only)
router.get("/", ensureAdmin, controller.getAllInvoices);
router.get("/:id", ensureAdmin, controller.getInvoice);
router.put("/:id", ensureAdmin, controller.updateInvoice);
router.delete("/:id", ensureAdmin, controller.deleteInvoice);
router.patch("/:id/sent", ensureAdmin, controller.markAsSent);
router.patch("/:id/paid", ensureAdmin, controller.markAsPaid);

module.exports = router;

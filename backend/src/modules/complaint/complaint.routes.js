const express = require("express");
const router = express.Router();
const controller = require("./complaint.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// All routes require authentication
router.use(ensureAuth);

// Customer routes
router.post("/", controller.createComplaint);
router.get("/my-complaints", controller.getMyComplaints);
router.get("/:id", controller.getComplaint); // customer can view own

// Admin routes
router.get("/", ensureAdmin, controller.getAllComplaints);
router.get("/:id", ensureAdmin, controller.getComplaint); // ✅ added for admin
router.put("/:id", ensureAdmin, controller.updateComplaint);
router.patch("/:id/status", ensureAdmin, controller.updateStatus);
router.delete("/:id", ensureAdmin, controller.deleteComplaint);

module.exports = router;
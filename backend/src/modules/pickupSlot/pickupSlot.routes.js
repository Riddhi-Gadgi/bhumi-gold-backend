const express = require("express");
const router = express.Router();
const controller = require("./pickupSlot.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// Admin routes
router.post("/", ensureAuth, ensureAdmin, controller.createSlot);
router.get("/", ensureAuth, ensureAdmin, controller.getAllSlots);
router.get("/:id", ensureAuth, ensureAdmin, controller.getSlotById);
router.put("/:id", ensureAuth, ensureAdmin, controller.updateSlot);
router.patch(
  "/:id/toggle",
  ensureAuth,
  ensureAdmin,
  controller.toggleSlotStatus,
);
router.delete("/:id", ensureAuth, ensureAdmin, controller.deleteSlot);

// Public/customer routes (no admin required for available slots)
router.get("/available", ensureAuth, controller.getAvailableSlots);

module.exports = router;

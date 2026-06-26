const express = require("express");
const router = express.Router();
const controller = require("./pickup.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// All pickup routes require authentication
router.use(ensureAuth);

// Customer routes
router.post("/", controller.createPickup);
router.get("/order/:order_id", controller.getPickupByOrder);
router.patch("/:id/reschedule", controller.reschedule);

// Admin routes (additional)
router.get("/", ensureAdmin, controller.getAllPickups);
router.get("/:id", controller.getPickup); // both admin and own customer can view
router.patch("/:id/status", ensureAdmin, controller.updateStatus);
router.patch("/:id/confirm", ensureAdmin, controller.confirmPickup);

module.exports = router;

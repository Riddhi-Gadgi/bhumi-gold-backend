const express = require("express");
const router = express.Router();
const controller = require("./feedback.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// Customer
router.post("/", ensureAuth, controller.createFeedback);

// Admin
router.get("/", ensureAdmin, controller.getAllFeedback);
router.get("/:id", ensureAdmin, controller.getFeedbackById);
router.delete("/:id", ensureAdmin, controller.deleteFeedback);

module.exports = router;

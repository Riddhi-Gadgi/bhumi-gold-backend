const express = require("express");
const router = express.Router();
const controller = require("./metalRate.controller");
const ensureAuth = require("../../middlewares/ensureAuth");
const ensureAdmin = require("../../middlewares/ensureAdmin");

// All admin routes require authentication and admin role
router.use(ensureAuth, ensureAdmin);

router.get("/history/:metal_id", controller.getRateHistory);
router.get("/latest/:metal_id", controller.getLatestRate); // if you want admin version
router.post("/", controller.createRate);
// Add any other admin‑only routes

module.exports = router;

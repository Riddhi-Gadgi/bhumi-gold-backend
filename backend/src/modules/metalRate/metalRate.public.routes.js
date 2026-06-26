const express = require("express");
const router = express.Router();
const controller = require("./metalRate.controller");

// Public route – no authentication
router.get("/latest", controller.getLatestRatesForAll);

// Add any other public routes here (e.g., if you want to expose a single metal's latest rate publicly)
router.get("/latest/:metal_id", controller.getLatestRate);

module.exports = router;

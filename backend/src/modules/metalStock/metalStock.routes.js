const express = require("express");
const router = express.Router();
const controller = require("./metalStock.controller");

router.get("/", controller.getStock);
router.put("/:metal_id", controller.updateStock);

module.exports = router; // admin only

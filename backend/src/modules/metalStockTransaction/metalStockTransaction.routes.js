const express = require("express");
const router = express.Router();
const controller = require("./metalStockTransaction.controller");

router.post("/", controller.createTransaction);
router.get("/:metal_id", controller.getTransactions);

module.exports = router;

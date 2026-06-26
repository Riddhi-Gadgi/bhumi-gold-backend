const express = require("express");
const router = express.Router();
const controller = require("./productStockTransaction.controller");

router.post("/", controller.createTransaction);
router.get("/:product_id", controller.getTransactions);

module.exports = router;

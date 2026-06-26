const express = require("express");
const router = express.Router();
const controller = require("./productStock.controller");

router.get("/", controller.getStock);
router.get("/:product_id", controller.getStockByProduct);
router.put("/:product_id", controller.updateStock);
router.post("/:product_id/reserve", controller.reserveStock); // for internal use

module.exports = router;

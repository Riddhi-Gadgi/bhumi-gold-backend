const express = require("express");
const router = express.Router();
const controller = require("./cart.controller");
const ensureAuth = require("../../middlewares/ensureAuth");

router.use(ensureAuth); // All cart routes require authentication

router.get("/", controller.getCart);
router.post("/items", controller.addItem);
router.put("/items/:product_id", controller.updateQuantity);
router.delete("/items/:product_id", controller.removeItem);
router.delete("/", controller.clearCart);

module.exports = router;

const express = require("express");
const router = express.Router();
const controller = require("./payment.controller");
const ensureAuth = require("../../middlewares/ensureAuth");

router.use(ensureAuth);

router.post("/create-order", controller.createOrder);
router.post("/verify", controller.verifyPayment);

module.exports = router;

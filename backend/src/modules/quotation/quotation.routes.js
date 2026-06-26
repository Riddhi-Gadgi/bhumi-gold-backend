const express = require("express");
const router = express.Router();
const controller = require("./quotation.controller");

router.post("/", controller.createQuotation);
router.get("/:id", controller.getQuotationById);
router.get("/inquiry/:inquiry_id", controller.getQuotationByInquiry);
router.patch("/:id/status", controller.updateStatus);
router.post("/:id/accept", controller.acceptQuotation);
module.exports = router;

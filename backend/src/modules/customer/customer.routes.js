const express = require("express");
const router = express.Router();
const controller = require("./customer.controller");

router.get("/", controller.getAllCustomers);
router.get("/:id", controller.getCustomerById);
router.post("/", controller.createCustomer);
router.put("/:id", controller.updateCustomer);
router.delete("/:id", controller.deleteCustomer);
router.patch("/:id/toggle", controller.toggleCustomerStatus);
router.get("/me/inquiries", controller.getMyInquiries);
module.exports = router;

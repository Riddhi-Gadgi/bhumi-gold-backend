const express = require("express");
const router = express.Router();
const controller = require("./inquiry.controller");
const upload = require("../../middlewares/upload");
const auth = require("../../routes/auth"); // adjust path as needed

// ✅ Add auth middleware here
router.post("/", auth, upload.array("images", 3), controller.createInquiry);

// Other routes (consider protecting them too)
router.get("/", controller.getAllInquiries);
router.get("/:id", controller.getInquiryById);
router.put("/:id", controller.updateInquiry);
router.patch("/:id/status", controller.updateStatus);
router.post(
  "/:id/attachments",
  upload.single("image"),
  controller.uploadAttachment,
);

module.exports = router;

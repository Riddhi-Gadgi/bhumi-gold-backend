const mongoose = require("mongoose");

const inquiryAttachmentSchema = new mongoose.Schema(
  {
    inquiry_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inquiry",
      required: true,
    },
    image_path: { type: String, required: true, maxlength: 255 },
  },
  { timestamps: { createdAt: "uploaded_at", updatedAt: false } },
);

module.exports = mongoose.model("InquiryAttachment", inquiryAttachmentSchema);

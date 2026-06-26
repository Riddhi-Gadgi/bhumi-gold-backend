const Inquiry = require("./inquiry.model");
const Attachment = require("../inquiryAttachment/inquiryAttachment.model");

exports.createInquiry = async (data) => {
  const inquiry = await Inquiry.create(data);
  return inquiry;
};

exports.getAllInquiries = async (filter = {}) => {
  return await Inquiry.find(filter)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email phone" },
    })
    .sort({ created_at: -1 })
    .lean();
};

exports.getInquiryById = async (id) => {
  const inquiry = await Inquiry.findById(id)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email phone" },
    })
    .lean();
  if (inquiry) {
    const attachments = await Attachment.find({ inquiry_id: id }).lean();
    inquiry.attachments = attachments;
  }
  return inquiry;
};

exports.updateInquiry = async (id, data) => {
  return await Inquiry.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.updateStatus = async (id, status) => {
  const inquiry = await Inquiry.findById(id);
  if (!inquiry) throw new Error("Inquiry not found");
  inquiry.status = status;
  await inquiry.save();
  return inquiry;
};

// Attachment methods
exports.addAttachment = async (inquiry_id, image_path) => {
  return await Attachment.create({ inquiry_id, image_path });
};

exports.getAttachments = async (inquiry_id) => {
  return await Attachment.find({ inquiry_id }).lean();
};

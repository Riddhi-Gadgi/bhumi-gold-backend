const Complaint = require("./complaint.model");

exports.createComplaint = async (data) => {
  return await Complaint.create(data);
};

exports.getComplaintById = async (id) => {
  return await Complaint.findById(id)
    .populate("customer_id")
    .populate("order_id")
    .lean();
};

exports.getAllComplaints = async (filter = {}) => {
  return await Complaint.find(filter)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email" },
    })
    .populate("order_id")
    .sort({ created_at: -1 })
    .lean();
};

exports.getComplaintById = async (id) => {
  return await Complaint.findById(id)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email" },
    })
    .populate("order_id")
    .lean();
};

exports.updateComplaint = async (id, data) => {
  return await Complaint.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.updateStatus = async (id, status) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) throw new Error("Complaint not found");
  complaint.status = status;
  await complaint.save();
  return complaint;
};

exports.deleteComplaint = async (id) => {
  await Complaint.findByIdAndDelete(id);
  return { message: "Complaint deleted" };
};

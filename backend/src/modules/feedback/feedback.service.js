const Feedback = require("./feedback.model");

exports.createFeedback = async (data) => {
  return await Feedback.create(data);
};

exports.getAllFeedback = async (filter = {}) => {
  return await Feedback.find(filter)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email" },
    })
    .populate("order_id")
    .sort({ created_at: -1 })
    .lean();
};

// Similarly for getFeedbackById

exports.getFeedbackById = async (id) => {
  return await Feedback.findById(id)
    .populate("customer_id")
    .populate("order_id")
    .lean();
};

exports.deleteFeedback = async (id) => {
  await Feedback.findByIdAndDelete(id);
  return { message: "Feedback deleted" };
};

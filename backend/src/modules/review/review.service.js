const Review = require("./review.model");
const Order = require("../order/order.model");

exports.createReview = async (data) => {
  const order = await Order.findById(data.order_id);
  if (!order) throw new Error("Order not found");

  // Allow review only if the order is fully paid
  if (order.payment_status !== "paid") {
    throw new Error("Reviews are only allowed for fully paid orders");
  }

  const reviewData = {
    ...data,
    is_verified: true,
  };

  return await Review.create(reviewData);
};

exports.getReviewsByProduct = async (product_id) => {
  return await Review.find({ product_id })
    .populate("customer_id", "user_id")
    .sort({ created_at: -1 })
    .lean();
};

exports.getReviewsByCustomer = async (customer_id) => {
  return await Review.find({ customer_id })
    .populate("product_id", "name")
    .sort({ created_at: -1 })
    .lean();
};

exports.getAllReviews = async (filter = {}) => {
  return await Review.find(filter)
    .populate("product_id", "name")
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email" },
    })
    .sort({ created_at: -1 })
    .lean();
};

exports.updateReview = async (id, data) => {
  return await Review.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.deleteReview = async (id) => {
  await Review.findByIdAndDelete(id);
  return { message: "Review deleted" };
};

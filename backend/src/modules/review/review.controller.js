const service = require("./review.service");

exports.createReview = async (req, res) => {
  try {
    const reviewData = {
      ...req.body,
      customer_id: req.user.customer_id,
    };
    const review = await service.createReview(reviewData);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const reviews = await service.getReviewsByCustomer(req.user.customer_id);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const filter = req.query;
    const reviews = await service.getAllReviews(filter);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReviewById = async (req, res) => {
  try {
    const review = await service.getAllReviews({ _id: req.params.id });
    if (!review || review.length === 0)
      return res.status(404).json({ message: "Review not found" });
    res.json(review[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    await service.deleteReview(req.params.id);
    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const service = require("./feedback.service");

exports.createFeedback = async (req, res) => {
  try {
    const data = { ...req.body, customer_id: req.user.customer_id };
    const feedback = await service.createFeedback(data);
    res.status(201).json(feedback);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await service.getAllFeedback();
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await service.getFeedbackById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });
    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteFeedback = async (req, res) => {
  try {
    const result = await service.deleteFeedback(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

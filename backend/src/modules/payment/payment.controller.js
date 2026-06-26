const service = require("./payment.service");

exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const razorpayOrder = await service.createRazorpayOrder(amount);
    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const payment = await service.verifyPayment(req.body);
    res.json({ success: true, payment });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

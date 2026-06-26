const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("./payment.model");
const Order = require("../order/order.model");
const Quotation = require("../quotation/quotation.model");

// Check if real Razorpay keys are present
const useMockPayment =
  !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET;

let razorpay;
if (!useMockPayment) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn(
    "⚠️  Using MOCK payment. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for real payments.",
  );
}

// Mock implementation for development
const mockCreateOrder = async (amount, currency = "INR") => {
  return {
    id: "mock_order_" + Date.now(),
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`,
    status: "created",
  };
};

const mockVerifyPayment = (paymentData) => {
  return true;
};

exports.createRazorpayOrder = async (amount, currency = "INR") => {
  if (useMockPayment) {
    return await mockCreateOrder(amount, currency);
  }
  const options = {
    amount: amount * 100,
    currency,
    receipt: `receipt_${Date.now()}`,
  };
  return await razorpay.orders.create(options);
};

exports.verifyPayment = async (paymentData) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    order_id,
    quotation_id,
    payment_type,
    amount,
  } = paymentData;

  // Verify signature (mock or real)
  if (!useMockPayment) {
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    if (expectedSignature !== razorpay_signature) {
      throw new Error("Invalid signature");
    }
  }

  // Save payment to database
  const payment = await Payment.create({
    quotation_id,
    order_id,
    payment_type,
    amount,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature: razorpay_signature || "mock_signature",
    status: "paid",
  });

  // ✅ Update order if this payment is linked to an order
  if (order_id) {
    const order = await Order.findById(order_id);
    if (!order) throw new Error("Order not found");

    // Add the paid amount to advance_paid (accumulate all payments)
    order.advance_paid = (order.advance_paid || 0) + amount;

    // Calculate remaining and payment status
    const total = order.total_amount || 0;
    const remaining = total - order.advance_paid;

    order.remaining_amount = remaining >= 0 ? remaining : 0; // safety

    if (remaining <= 0) {
      order.payment_status = "paid";
    } else if (order.advance_paid > 0) {
      order.payment_status = "partial";
    } else {
      order.payment_status = "pending";
    }

    await order.save();
  }

  // Update quotation status if advance payment for a quotation
  if (quotation_id) {
    await Quotation.findByIdAndUpdate(quotation_id, { status: "accepted" });
  }

  return payment;
};

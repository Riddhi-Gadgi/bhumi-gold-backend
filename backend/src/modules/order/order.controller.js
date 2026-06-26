const service = require("./order.service");
const Order = require("./order.model");
const OrderItem = require("../orderItem/orderItem.model");
exports.createOrder = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const paymentDetails = req.body; // could contain advance amount, etc.
    const order = await service.createOrderFromCart(
      customer_id,
      paymentDetails,
    );
    res.status(201).json(order);
  } catch (err) {
    // 🔥 Log the full stack trace to identify the source of the error
    console.error("🔥 Order creation error:", err.stack);
    res.status(400).json({ message: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await service.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("🔥 Get order error:", err.stack);
    res.status(500).json({ message: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const orders = await service.getOrdersByCustomer(customer_id);
    res.json(orders);
  } catch (err) {
    console.error("🔥 Get my orders error:", err.stack);
    res.status(500).json({ message: err.message });
  }
};
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "customer_id",
        populate: { path: "user_id", select: "name email" }, // populate customer → user
      })
      .sort({ created_at: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({ message: err.message });
  }
};
const stockService = require("../productStock/productStock.service");

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // If cancelling an order that was not yet completed, release stock
    if (status === "cancelled" && order.order_status !== "cancelled") {
      // Fetch order items with product details
      const items = await OrderItem.find({ order_id: id }).populate(
        "product_id",
      );
      for (const item of items) {
        if (!item.product_id.is_custom) {
          await stockService.releaseStock(item.product_id._id, item.quantity, {
            reference_id: order._id,
            reference_model: "Order",
            notes: `Stock released due to order cancellation #${order.order_number}`,
          });
        }
      }
    }

    order.order_status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

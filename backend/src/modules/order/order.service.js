const Order = require("./order.model");
const OrderItem = require("../orderItem/orderItem.model");
const Cart = require("../cart/cart.model");
const CartItem = require("../cartItem/cartItem.model");
const Product = require("../product/product.model");
const ProductStock = require("../productStock/productStock.model");
const ProductStockTransaction = require("../productStockTransaction/productStockTransaction.model");
const { generateOrderNumber } = require("../../../utils/orderHelpers");

exports.createOrderFromCart = async (customer_id, paymentDetails = {}) => {
  // Get cart with items
  const cart = await Cart.findOne({ customer_id });
  if (!cart) throw new Error("Cart not found");
  const cartItems = await CartItem.find({ cart_id: cart._id }).populate(
    "product_id",
  );
  if (cartItems.length === 0) throw new Error("Cart is empty");

  let totalAmount = 0;
  const orderItemsData = [];

  // Validate stock for readymade products and calculate total
  for (const item of cartItems) {
    const product = item.product_id;
    if (!product.is_custom) {
      const stock = await ProductStock.findOne({ product_id: product._id });
      if (
        !stock ||
        stock.available_quantity - stock.reserved_quantity < item.quantity
      ) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }
    }
    const price = parseFloat(item.price.toString());
    totalAmount += price * item.quantity;
    orderItemsData.push({
      product_id: product._id,
      quantity: item.quantity,
      price_at_purchase: price,
    });
  }

  // Determine advance payment
  const advancePaid = paymentDetails.advance || 0;
  const remaining = totalAmount - advancePaid;

  // Create order
  const orderNumber = generateOrderNumber();
  console.log("Attempting to create order with number:", orderNumber);
  const order = await Order.create({
    customer_id,
    order_number: orderNumber,
    total_amount: totalAmount,
    advance_paid: advancePaid,
    remaining_amount: remaining,
    payment_status:
      advancePaid >= totalAmount
        ? "paid"
        : advancePaid > 0
          ? "partial"
          : "pending",
  });

  console.log("Order created successfully, ID:", order._id); // Check if undefined

  // Create order items
  for (const itemData of orderItemsData) {
    await OrderItem.create({
      order_id: order._id,
      ...itemData,
    });
  }

  // Reserve stock for readymade products
  for (const item of cartItems) {
    const product = item.product_id;
    if (!product.is_custom) {
      const stock = await ProductStock.findOne({ product_id: product._id });
      stock.reserved_quantity += item.quantity;
      await stock.save();

      // Log before creating transaction
      console.log(
        "Creating transaction for product:",
        product._id,
        "with order ID:",
        order._id,
      );
      await ProductStockTransaction.create({
        product_id: product._id,
        transaction_type: "reserved",
        quantity: item.quantity,
        reference_id: order._id,
        reference_model: "Order",
        notes: `Reserved for order ${orderNumber}`,
      });
    }
  }

  return order;
};

exports.getOrderById = async (orderId) => {
  if (!orderId) throw new Error("Order ID is required");
  const order = await Order.findById(orderId)
    .populate({
      path: "customer_id",
      populate: { path: "user_id", select: "name email phone" },
    })
    .lean();
  if (order) {
    const items = await OrderItem.find({ order_id: orderId })
      .populate("product_id")
      .lean();
    order.items = items;
  }
  return order;
};
exports.getOrdersByCustomer = async (customer_id) => {
  return await Order.find({ customer_id })
    .sort({ created_at: -1 })
    .populate({
      path: 'customer_id',
      populate: { path: 'user_id', select: 'name email phone' }
    })
    .lean();
};
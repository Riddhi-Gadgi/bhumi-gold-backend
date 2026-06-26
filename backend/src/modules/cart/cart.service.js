const Cart = require("./cart.model");
const CartItem = require("../cartItem/cartItem.model");
const Product = require("../product/product.model");
const ProductStock = require("../productStock/productStock.model");
// Accept session in all functions
exports.getOrCreateCart = async (customer_id, session = null) => {
  let query = Cart.findOne({ customer_id });
  if (session) query = query.session(session);
  let cart = await query;
  if (!cart) {
    const cartData = { customer_id };
    if (session) {
      const [newCart] = await Cart.create([cartData], { session });
      cart = newCart;
    } else {
      cart = await Cart.create(cartData);
    }
  }
  return cart;
};

// In modules/cart/cart.service.js
// add this import

exports.getCart = async (customer_id, session = null) => {
  const cart = await this.getOrCreateCart(customer_id, session);

  let query = CartItem.find({ cart_id: cart._id }).populate({
    path: "product_id",
    select:
      "name images is_custom weight_grams metal_id display_price total_price", // removed stock_qty
  });
  if (session) query = query.session(session);
  const items = await query.lean();

  // 🔁 Attach real‑time current_stock from ProductStock
  for (let item of items) {
    const product = item.product_id;
    if (product && !product.is_custom) {
      let stockQuery = ProductStock.findOne({ product_id: product._id });
      if (session) stockQuery = stockQuery.session(session);
      const stock = await stockQuery.lean();
      product.current_stock = stock
        ? stock.available_quantity - stock.reserved_quantity
        : 0; // fallback (should not happen after migration)
    } else if (product) {
      product.current_stock = Infinity; // custom products
    }
  }

  let subtotal = 0;
  items.forEach((item) => {
    item.price = Number(item.price);
    subtotal += item.price * item.quantity;
  });

  return {
    _id: cart._id,
    total_items: cart.total_items,
    items,
    subtotal,
  };
};

exports.addItem = async (
  customer_id,
  product_id,
  quantity = 1,
  session = null,
) => {
  console.log("📦 addItem called with product_id:", product_id);
  console.log("   session provided?", !!session);
  let productQuery = Product.findById(product_id);
  if (session) {
    console.log("   attaching session to query");
    productQuery = productQuery.session(session);
  }
  const product = await productQuery;
  console.log("   product found?", !!product);
  if (!product) throw new Error("Product not found");
  if (!product.is_active) throw new Error("Product is inactive");
  if (!product.is_custom && product.stock_qty < quantity)
    throw new Error("Insufficient stock");

  const cart = await this.getOrCreateCart(customer_id, session);

  // Find or create cart item with session
  let itemQuery = CartItem.findOne({ cart_id: cart._id, product_id });
  if (session) itemQuery = itemQuery.session(session);
  let item = await itemQuery;
  if (item) {
    item.quantity += quantity;
    if (session) await item.save({ session });
    else await item.save();
  } else {
    const itemData = {
      cart_id: cart._id,
      product_id,
      quantity,
      price: product.total_price,
    };
    if (session) {
      const [newItem] = await CartItem.create([itemData], { session });
      item = newItem;
    } else {
      item = await CartItem.create(itemData);
    }
  }
  // Update total items count with session
  let countQuery = CartItem.countDocuments({ cart_id: cart._id });
  if (session) countQuery = countQuery.session(session);
  const itemsCount = await countQuery;
  cart.total_items = itemsCount;
  if (session) await cart.save({ session });
  else await cart.save();
  return item;
};

exports.updateQuantity = async (
  customer_id,
  product_id,
  quantity,
  session = null,
) => {
  if (quantity < 1) throw new Error("Quantity must be at least 1");
  let cartQuery = Cart.findOne({ customer_id });
  if (session) cartQuery = cartQuery.session(session);
  const cart = await cartQuery;
  if (!cart) throw new Error("Cart not found");
  let itemQuery = CartItem.findOne({ cart_id: cart._id, product_id });
  if (session) itemQuery = itemQuery.session(session);
  const item = await itemQuery;
  if (!item) throw new Error("Item not in cart");
  item.quantity = quantity;
  if (session) await item.save({ session });
  else await item.save();
  return item;
};

exports.removeItem = async (customer_id, product_id, session = null) => {
  let cartQuery = Cart.findOne({ customer_id });
  if (session) cartQuery = cartQuery.session(session);
  const cart = await cartQuery;
  if (!cart) throw new Error("Cart not found");
  let deleteQuery = CartItem.deleteOne({ cart_id: cart._id, product_id });
  if (session) deleteQuery = deleteQuery.session(session);
  await deleteQuery;
  let countQuery = CartItem.countDocuments({ cart_id: cart._id });
  if (session) countQuery = countQuery.session(session);
  const itemsCount = await countQuery;
  cart.total_items = itemsCount;
  if (session) await cart.save({ session });
  else await cart.save();
  return { success: true };
};

exports.clearCart = async (customer_id, session = null) => {
  let cartQuery = Cart.findOne({ customer_id });
  if (session) cartQuery = cartQuery.session(session);
  const cart = await cartQuery;
  if (!cart) return;
  let deleteQuery = CartItem.deleteMany({ cart_id: cart._id });
  if (session) deleteQuery = deleteQuery.session(session);
  await deleteQuery;
  cart.total_items = 0;
  if (session) await cart.save({ session });
  else await cart.save();
  return cart;
};

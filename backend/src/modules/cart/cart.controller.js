const service = require("./cart.service");
const Product = require("../product/product.model");
const ProductStock = require("../productStock/productStock.model");
const stockService = require("../productStock/productStock.service"); // 👈 import stock service for reservation

// Helper to get current available stock
async function getAvailableStock(productId) {
  const stock = await ProductStock.findOne({ product_id: productId }).lean();
  return stock ? stock.available_quantity - stock.reserved_quantity : 0;
}

// ✅ Route handler for GET /cart
exports.getCart = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const cart = await service.getCart(customer_id);
    res.json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const { product_id, quantity } = req.body;

    // 1. Fetch product
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Stock check for readymade products
    if (!product.is_custom) {
      const available = await getAvailableStock(product_id);
      if (available < quantity) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      // 3. Reserve the stock
      await stockService.reserveStock(product_id, quantity, {
        reference_id: customer_id, // or cart id, whichever you prefer
        reference_model: "Cart",
        notes: "Reserved via add to cart",
      });
    }

    // 4. Add item to cart (your existing service call)
    const item = await service.addItem(customer_id, product_id, quantity);
    res.status(201).json(item);
  } catch (err) {
    // If anything fails, you may want to release the reserved stock here (optional)
    console.error("Add item error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const { product_id } = req.params;
    const { quantity } = req.body;

    // 1. Fetch product
    const product = await Product.findById(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Get current cart item to know the old quantity
    const cart = await service.getCart(customer_id); // or write a specific function to get item quantity
    const existingItem = cart.items.find(
      (i) => i.product_id._id.toString() === product_id,
    );
    const oldQty = existingItem ? existingItem.quantity : 0;

    // 3. Stock check (only if increasing quantity)
    if (!product.is_custom && quantity > oldQty) {
      const available = await getAvailableStock(product_id);
      const additional = quantity - oldQty;
      if (available < additional) {
        return res
          .status(400)
          .json({ message: "Insufficient stock to increase quantity" });
      }
      // Reserve additional stock
      await stockService.reserveStock(product_id, additional, {
        reference_id: customer_id,
        reference_model: "Cart",
        notes: "Reserved via quantity update",
      });
    } else if (!product.is_custom && quantity < oldQty) {
      // Release excess reservation
      const released = oldQty - quantity;
      await stockService.releaseStock(product_id, released, {
        reference_id: customer_id,
        reference_model: "Cart",
        notes: "Released via quantity update",
      });
    }

    // 4. Update cart item
    const item = await service.updateQuantity(
      customer_id,
      product_id,
      quantity,
    );
    res.json(item);
  } catch (err) {
    console.error("Update quantity error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;
    const { product_id } = req.params;

    // 1. Get current cart item to know the quantity to release
    const cart = await service.getCart(customer_id);
    const existingItem = cart.items.find(
      (i) => i.product_id._id.toString() === product_id,
    );
    if (existingItem && !existingItem.product_id.is_custom) {
      // Release the reserved stock
      await stockService.releaseStock(product_id, existingItem.quantity, {
        reference_id: customer_id,
        reference_model: "Cart",
        notes: "Released via remove from cart",
      });
    }

    // 2. Remove item from cart
    await service.removeItem(customer_id, product_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const customer_id = req.user.customer_id;

    // 1. Get cart to release all reserved stocks
    const cart = await service.getCart(customer_id);
    for (const item of cart.items) {
      if (!item.product_id.is_custom) {
        await stockService.releaseStock(item.product_id._id, item.quantity, {
          reference_id: customer_id,
          reference_model: "Cart",
          notes: "Released via clear cart",
        });
      }
    }

    // 2. Clear cart
    await service.clearCart(customer_id);
    res.json({ success: true });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ message: err.message });
  }
};

const ProductStock = require("./productStock.model");

exports.getStock = async () => {
  return await ProductStock.find().populate("product_id", "name").lean();
};

exports.getStockByProduct = async (product_id) => {
  return await ProductStock.findOne({ product_id }).lean();
};

exports.updateStock = async (product_id, data) => {
  const stock = await ProductStock.findOneAndUpdate(
    { product_id },
    { $set: data },
    { new: true, upsert: true },
  ).lean();
  return stock;
};

exports.reserveStock = async (product_id, quantity) => {
  const stock = await ProductStock.findOne({ product_id });
  if (!stock) throw new Error("Stock record not found");
  if (stock.available_quantity - stock.reserved_quantity < quantity) {
    throw new Error("Insufficient stock");
  }
  stock.reserved_quantity += quantity;
  await stock.save();
  return stock;
};

// In productStock.service.js
exports.consumeStock = async (product_id, quantity, reference = {}) => {
  const stock = await ProductStock.findOne({ product_id });
  if (!stock) throw new Error("Stock record not found");
  if (stock.available_quantity < quantity) {
    throw new Error("Insufficient available stock");
  }
  stock.available_quantity -= quantity;
  // Also reduce reserved quantity if it was reserved (depends on your flow)
  stock.reserved_quantity = Math.max(0, stock.reserved_quantity - quantity);
  await stock.save();

  await Transaction.create({
    product_id,
    transaction_type: "sold",
    quantity,
    reference_id: reference.reference_id,
    reference_model: reference.reference_model,
    notes: reference.notes,
  });
  return stock;
};

exports.releaseStock = async (product_id, quantity, reference = {}) => {
  const stock = await ProductStock.findOne({ product_id });
  if (!stock) throw new Error("Stock record not found");
  stock.reserved_quantity = Math.max(0, stock.reserved_quantity - quantity);
  await stock.save();

  await Transaction.create({
    product_id,
    transaction_type: "released",
    quantity,
    reference_id: reference.reference_id,
    reference_model: reference.reference_model,
    notes: reference.notes,
  });
  return stock;
};

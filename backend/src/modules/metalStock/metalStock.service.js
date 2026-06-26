const mongoose = require("mongoose");
const MetalStock = require("../metalStock/metalStock.model");
const Metal = require("../metal/metal.model");

exports.getStock = async () => {
  const stock = await MetalStock.find().populate("metal_id").lean();
  console.log("Stock with populate:", JSON.stringify(stock, null, 2));
  return stock;
};

exports.updateStock = async (metal_id, data) => {
  // 1️⃣ Check if metal exists
  const metalExists = await Metal.findById(metal_id);
  if (!metalExists) throw new Error("Invalid metal_id: Metal not found");

  // 2️⃣ Convert numbers to Decimal128
  const updateData = {
    available_quantity:
      data.available_quantity != null
        ? mongoose.Types.Decimal128.fromString(
            data.available_quantity.toString(),
          )
        : undefined,
    reserved_quantity:
      data.reserved_quantity != null
        ? mongoose.Types.Decimal128.fromString(
            data.reserved_quantity.toString(),
          )
        : undefined,
  };

  // 3️⃣ Update or create stock
  return await MetalStock.findOneAndUpdate({ metal_id }, updateData, {
    new: true,
    upsert: true,
  });
};

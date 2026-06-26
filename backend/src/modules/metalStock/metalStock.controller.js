const mongoose = require("mongoose");
const Metal = require("../metal/metal.model");
const MetalStock = require("../metalStock/metalStock.model");

// GET /admin/metal-stock
exports.getStock = async (req, res) => {
  try {
    const stock = await MetalStock.find().populate("metal_id").lean();
    console.log("Stock with populate:", JSON.stringify(stock, null, 2));
    res.json(stock);
  } catch (err) {
    console.error("Error fetching stock:", err);
    res.status(500).json({ message: err.message });
  }
};
// PUT /admin/metal-stock/:metal_id
exports.updateStock = async (req, res) => {
  try {
    const { metal_id } = req.params;
    const data = req.body;

    console.log("updateStock called with metal_id:", metal_id);
    console.log("Request body:", data);

    if (!mongoose.Types.ObjectId.isValid(metal_id)) {
      return res.status(400).json({ message: "Invalid metal_id format" });
    }

    const metalExists = await Metal.findById(metal_id);
    if (!metalExists) {
      return res
        .status(400)
        .json({ message: "Invalid metal_id: Metal not found" });
    }

    // Prepare update data with Decimal128 conversion AND last_updated
    const updateData = {
      last_updated: new Date(), // 👈 manually set here
    };
    if (data.available_quantity != null) {
      updateData.available_quantity = mongoose.Types.Decimal128.fromString(
        data.available_quantity.toString(),
      );
    }
    if (data.reserved_quantity != null) {
      updateData.reserved_quantity = mongoose.Types.Decimal128.fromString(
        data.reserved_quantity.toString(),
      );
    }

    const updatedStock = await MetalStock.findOneAndUpdate(
      { metal_id },
      updateData,
      { new: true, upsert: true },
    ).populate("metal_id");

    res.json(updatedStock);
  } catch (err) {
    console.error("Error updating stock:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    res.status(400).json({ message: err.message });
  }
};

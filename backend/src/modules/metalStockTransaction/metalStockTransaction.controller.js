const mongoose = require("mongoose");
const MetalStock = require("../metalStock/metalStock.model");
const MetalStockTransaction = require("./metalStockTransaction.model");

// ===========================
// Create a stock transaction
// ===========================
exports.createTransaction = async (data) => {
  const { metal_id, transaction_type, quantity, notes } = data;

  if (!metal_id || !transaction_type || quantity == null) {
    throw new Error("metal_id, transaction_type, and quantity are required");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ObjectId = mongoose.Types.ObjectId;
    let stock = await MetalStock.findOne({
      metal_id: ObjectId(metal_id),
    }).session(session);

    if (!stock) {
      // If stock record doesn't exist, create it
      const created = await MetalStock.create(
        [
          {
            metal_id: ObjectId(metal_id),
            available_quantity: mongoose.Types.Decimal128.fromString("0"),
            reserved_quantity: mongoose.Types.Decimal128.fromString("0"),
          },
        ],
        { session },
      );
      stock = created[0];
    }

    const currentAvailable = parseFloat(
      stock.available_quantity.toString() || "0",
    );
    const currentReserved = parseFloat(
      stock.reserved_quantity.toString() || "0",
    );
    const qtyFloat = parseFloat(quantity);

    // Update stock based on transaction type
    switch (transaction_type) {
      case "purchase":
        stock.available_quantity = mongoose.Types.Decimal128.fromString(
          (currentAvailable + qtyFloat).toString(),
        );
        break;
      case "reserved":
        stock.reserved_quantity = mongoose.Types.Decimal128.fromString(
          (currentReserved + qtyFloat).toString(),
        );
        break;
      case "used_for_product":
        stock.available_quantity = mongoose.Types.Decimal128.fromString(
          (currentAvailable - qtyFloat).toString(),
        );
        stock.reserved_quantity = mongoose.Types.Decimal128.fromString(
          (currentReserved - qtyFloat).toString(),
        );
        break;
      case "released":
        stock.reserved_quantity = mongoose.Types.Decimal128.fromString(
          (currentReserved - qtyFloat).toString(),
        );
        break;
      default:
        throw new Error("Invalid transaction type");
    }

    await stock.save({ session });

    const tx = await MetalStockTransaction.create(
      [
        {
          metal_id: ObjectId(metal_id),
          transaction_type,
          quantity: mongoose.Types.Decimal128.fromString(qtyFloat.toString()),
          notes: notes || "",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return tx[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

// ===========================
// Get transactions for a metal
// ===========================
exports.getTransactions = async (metal_id) => {
  if (!metal_id) throw new Error("metal_id is required");

  const ObjectId = mongoose.Types.ObjectId;
  return await MetalStockTransaction.find({
    metal_id: ObjectId(metal_id),
  }).sort({
    created_at: -1,
  });
};

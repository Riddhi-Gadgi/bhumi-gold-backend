const mongoose = require("mongoose");
const MetalStock = require("../metalStock/metalStock.model");
const MetalStockTransaction = require("./metalStockTransaction.model");

exports.createTransaction = async (data) => {
  const { metal_id, transaction_type, quantity, notes } = data;

  // 1️⃣ Validate input
  if (!metal_id || !transaction_type || quantity == null) {
    throw new Error("metal_id, transaction_type, and quantity are required");
  }
  if (quantity <= 0) {
    throw new Error("quantity must be greater than 0");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ObjectId = mongoose.Types.ObjectId;

    // 2️⃣ Find or create stock
    let stock = await MetalStock.findOne({
      metal_id: ObjectId(metal_id),
    }).session(session);
    if (!stock) {
      stock = (
        await MetalStock.create(
          [
            {
              metal_id: ObjectId(metal_id),
              available_quantity: mongoose.Types.Decimal128.fromString("0"),
              reserved_quantity: mongoose.Types.Decimal128.fromString("0"),
            },
          ],
          { session },
        )
      )[0];
    }

    // 3️⃣ Convert current quantities
    const currentAvailable = parseFloat(
      stock.available_quantity.toString() || "0",
    );
    const currentReserved = parseFloat(
      stock.reserved_quantity.toString() || "0",
    );
    const qtyFloat = parseFloat(quantity);

    // 4️⃣ Update stock safely
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
        if (qtyFloat > currentAvailable) {
          throw new Error("Not enough available stock");
        }
        stock.available_quantity = mongoose.Types.Decimal128.fromString(
          (currentAvailable - qtyFloat).toString(),
        );
        stock.reserved_quantity = mongoose.Types.Decimal128.fromString(
          (currentReserved - qtyFloat).toString(),
        );
        break;
      case "released":
        if (qtyFloat > currentReserved) {
          throw new Error("Cannot release more than reserved");
        }
        stock.reserved_quantity = mongoose.Types.Decimal128.fromString(
          (currentReserved - qtyFloat).toString(),
        );
        break;
      default:
        throw new Error("Invalid transaction type");
    }

    // 5️⃣ Save stock
    await stock.save({ session });

    // 6️⃣ Create transaction record
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

exports.getTransactions = async (metal_id) => {
  if (!metal_id) throw new Error("metal_id is required");

  const ObjectId = mongoose.Types.ObjectId;
  return await MetalStockTransaction.find({
    metal_id: ObjectId(metal_id),
  }).sort({ created_at: -1 });
};

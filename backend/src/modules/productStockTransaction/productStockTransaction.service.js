const Transaction = require("./productStockTransaction.model");

exports.createTransaction = async (data) => {
  return await Transaction.create(data);
};

exports.getTransactionsByProduct = async (product_id) => {
  return await Transaction.find({ product_id }).sort({ created_at: -1 }).lean();
};

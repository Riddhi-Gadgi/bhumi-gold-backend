const service = require("./productStockTransaction.service");

exports.createTransaction = async (req, res) => {
  try {
    const tx = await service.createTransaction(req.body);
    res.status(201).json(tx);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const txs = await service.getTransactionsByProduct(req.params.product_id);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

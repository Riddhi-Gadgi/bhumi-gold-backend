const service = require("./productStock.service");

exports.getStock = async (req, res) => {
  try {
    const stock = await service.getStock();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStockByProduct = async (req, res) => {
  try {
    const stock = await service.getStockByProduct(req.params.product_id);
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStock = async (req, res) => {
  try {
    const updated = await service.updateStock(req.params.product_id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reserveStock = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;
    const stock = await service.reserveStock(product_id, quantity);
    res.json(stock);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

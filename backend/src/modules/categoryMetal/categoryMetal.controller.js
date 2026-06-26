const service = require("./categorymetalService");

exports.addMetal = async (req, res) => {
  try {
    const { category_id, metal_id } = req.body;
    const result = await service.addMetalToCategory(category_id, metal_id);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeMetal = async (req, res) => {
  try {
    const { category_id, metal_id } = req.params;
    const result = await service.removeMetalFromCategory(category_id, metal_id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMetals = async (req, res) => {
  try {
    const metals = await service.getMetalsByCategory(req.params.category_id);
    res.json(metals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

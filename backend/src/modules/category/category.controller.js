const service = require("./category.service");

exports.createCategory = async (req, res) => {
  try {
    const category = await service.createCategory(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await service.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await service.getAllCategories({ is_active: true });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await service.getCategoryById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const updated = await service.updateCategory(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await service.toggleCategoryStatus(req.params.id);
    res.json(category);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const result = await service.deleteCategory(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

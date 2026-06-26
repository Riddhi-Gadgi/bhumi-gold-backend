const metalService = require("./metal.service");

exports.createMetal = async (req, res) => {
  try {
    const metal = await metalService.createMetal(req.body);
    res.status(201).json(metal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllMetals = async (req, res) => {
  try {
    const metals = await metalService.getAllMetals();
    res.json(metals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActiveMetals = async (req, res) => {
  try {
    const metals = await metalService.getAllMetals({ is_active: true });
    res.json(metals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMetal = async (req, res) => {
  try {
    const updated = await metalService.updateMetal(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleMetalStatus = async (req, res) => {
  try {
    const metal = await metalService.toggleMetalStatus(req.params.id);
    res.json(metal);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

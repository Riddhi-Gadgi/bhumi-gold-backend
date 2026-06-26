// modules/metalRate/metalRate.controller.js
const service = require("./metalRate.service");

exports.getRateHistory = async (req, res) => {
  try {
    const { metal_id } = req.params;
    console.log("Fetching rates for metal_id:", metal_id); // Debug

    const rates = await service.getRateHistory(metal_id);
    res.json(rates);
  } catch (err) {
    console.error("Error in getRateHistory:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getLatestRate = async (req, res) => {
  try {
    const { metal_id } = req.params;
    const rate = await service.getLatestRate(metal_id);
    res.json(rate);
  } catch (err) {
    console.error("Error in getLatestRate:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.createRate = async (req, res) => {
  try {
    const rate = await service.createRate(req.body);
    res.status(201).json(rate);
  } catch (err) {
    console.error("Error in createRate:", err);
    res.status(400).json({ message: err.message });
  }
};
// Add at the end of the file
exports.getLatestRatesForAll = async (req, res) => {
  try {
    const rates = await service.getLatestRatesForAll();
    res.json(rates);
  } catch (err) {
    console.error("Error in getLatestRatesForAll:", err);
    res.status(500).json({ message: err.message });
  }
};

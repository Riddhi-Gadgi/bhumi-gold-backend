const service = require("./customization.service");

exports.getAllCustomizations = async (req, res) => {
  try {
    const customizations = await service.getAllCustomizations();
    res.json(customizations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCustomizationById = async (req, res) => {
  try {
    const customization = await service.getCustomizationById(req.params.id);
    if (!customization)
      return res.status(404).json({ message: "Customization not found" });
    res.json(customization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getByQuotation = async (req, res) => {
  try {
    const customization = await service.getCustomizationByQuotation(
      req.params.quotationId,
    );
    if (!customization)
      return res
        .status(404)
        .json({ message: "Customization not found for this quotation" });
    res.json(customization);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCustomization = async (req, res) => {
  try {
    const customization = await service.createCustomization(req.body);
    res.status(201).json(customization);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const customization = await service.updateStatus(req.params.id, status);
    res.json(customization);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCustomization = async (req, res) => {
  try {
    const updated = await service.updateCustomization(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteCustomization = async (req, res) => {
  try {
    const result = await service.deleteCustomization(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

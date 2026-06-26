const service = require("./quotation.service");

exports.createQuotation = async (req, res) => {
  try {
    const { items, ...quotationData } = req.body;
    const quotation = await service.createQuotation(quotationData, items);
    res.status(201).json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await service.getQuotationById(req.params.id);
    if (!quotation)
      return res.status(404).json({ message: "Quotation not found" });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuotationByInquiry = async (req, res) => {
  try {
    const quotation = await service.getQuotationByInquiry(
      req.params.inquiry_id,
    );
    if (!quotation)
      return res.status(404).json({ message: "No quotation for this inquiry" });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const quotation = await service.updateQuotationStatus(
      req.params.id,
      status,
    );
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.acceptQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    // customerId from authenticated user (req.user)
    const customerId = req.user.customer_id; // assuming req.user has customer_id
    const result = await service.acceptQuotation(id, customerId);
    res.json({ message: "Quotation accepted", product: result.product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

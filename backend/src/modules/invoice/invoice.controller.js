const service = require("./invoice.service");
const Order = require("../order/order.model"); // 👈 ADD this import

exports.generateInvoicePDF = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1. Fetch the order to check payment status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Only allow download if order is fully paid or completed
    if (order.payment_status !== "paid" && order.order_status !== "completed") {
      return res.status(403).json({
        message:
          "Invoice is available only after full payment or order completion",
      });
    }

    // 3. Generate PDF
    const pdfBuffer = await service.generateInvoicePDF(orderId);

    if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
      console.error("PDF buffer not generated or not a buffer:", pdfBuffer);
      return res.status(500).json({ message: "PDF buffer not generated" });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `inline; filename=invoice-${orderId}.pdf`,
    });

    return res.end(pdfBuffer);
  } catch (err) {
    console.error("PDF generation error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Generate invoice record (store in DB)
exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const invoice = await service.generateInvoiceFromOrder(orderId);
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await service.getAllInvoices();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInvoice = async (req, res) => {
  try {
    const invoice = await service.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const updated = await service.updateInvoice(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const result = await service.deleteInvoice(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAsSent = async (req, res) => {
  try {
    const invoice = await service.markAsSent(req.params.id);
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const invoice = await service.markAsPaid(req.params.id);
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

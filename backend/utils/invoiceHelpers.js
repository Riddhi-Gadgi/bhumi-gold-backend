const crypto = require("crypto");

exports.generateInvoiceNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `INV-${timestamp}-${random}`;
};

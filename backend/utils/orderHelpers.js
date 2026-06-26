const crypto = require("crypto");

exports.generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

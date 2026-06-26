const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const Customer = require("../modules/customer/customer.model"); // adjust path

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Find the associated Customer document
    const customer = await Customer.findOne({ user_id: user._id });
    if (!customer) {
      return res.status(403).json({ error: "Customer profile not found" });
    }

    // Attach user and customer_id to req.user
    req.user = {
      ...user.toObject(),
      customer_id: customer._id, // 👈 this is what the cart controller needs
    };
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(403).json({ error: "Invalid token" });
  }
};

// middlewares/authenticateJWT.js
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user)
      return res.status(401).json({ ok: false, message: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ ok: false, message: "Invalid token" });
  }
};

const { verifyToken } = require("./jwt.utils");
const User = require("../../../modules/user/user.model"); // adjust path if needed

/**
 * Middleware to authenticate requests using JWT (Bearer token)
 * Attaches user to req.user if token is valid
 */
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res
      .status(403)
      .json({ ok: false, message: "Invalid or expired token" });
  }

  try {
    // Fetch full user from DB (optional but useful for role checks)
    const user = await User.findById(decoded.id).select("-password"); // exclude password
    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT auth error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = authenticateJWT;

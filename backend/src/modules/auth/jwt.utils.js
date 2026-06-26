const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for a user
 * @param {Object} user - Mongoose user document
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };
  // Token expires in 7 days
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * Verify a JWT token
 * @param {String} token
 * @returns {Object|null} Decoded payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };

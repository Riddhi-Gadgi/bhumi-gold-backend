// Middleware to validate signup data
const validateSignup = (req, res, next) => {
  const { name, email, password, role, address, pincode, adminSecret } =
    req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Name, email, and password are required",
    });
  }

  if (password.length < 6 || password.length > 15) {
    return res.status(400).json({
      ok: false,
      message: "Password must be 6–15 characters",
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email" });
  }

  // Role validation
  if (role === "admin" && adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      ok: false,
      message: "Unauthorized admin creation",
    });
  }

  // Customer-specific validation
  if (role === "customer") {
    if (!address || !pincode) {
      return res.status(400).json({
        ok: false,
        message: "Address and pincode required for customers",
      });
    }
  }

  // If all validations pass
  next();
};

module.exports = validateSignup;

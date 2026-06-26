const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../modules/user/user.model");
const ensureAuth = require("../middlewares/ensureAuth");

const router = express.Router();

// Signup (FIXED to also create customer)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, role = "customer" } = req.body;

    // Basic validation
    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ ok: false, message: "All fields required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ ok: false, message: "Password must be at least 6 characters" });
    }
    // Phone validation (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ ok: false, message: "Phone must be 10 digits" });
    }

    // Check existing user
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res
        .status(409)
        .json({ ok: false, message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with correct field names
    const user = new User({
      full_name: name,
      email: email.toLowerCase(),
      phone, // stored as Number – ensure no leading zero
      password_hash: hashedPassword,
      role,
    });
    await user.save();

    // ✅ Create corresponding customer document
    const Customer = require("../modules/customer/customer.model"); // adjust path as needed
    await Customer.create({
      user_id: user._id,
      gender: null,
      date_of_birth: null,
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const safeUser = {
      id: user._id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    };
    res.status(201).json({ ok: true, user: safeUser, token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});
// Login (FIXED debug log)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("=== LOGIN DEBUG ===");
    console.log("Raw email from request:", email);
    console.log("Raw password length:", password?.length);

    const searchEmail = email?.toLowerCase().trim();
    console.log("Searching for email:", searchEmail);

    const allUsers = await User.find({}).select("email");
    console.log(
      "All emails in DB:",
      allUsers.map((u) => u.email),
    );

    const user = await User.findOne({ email: searchEmail });
    console.log("User found:", user ? "Yes" : "No");

    if (!user) {
      console.log("User not found for email:", searchEmail);
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password" });
    }

    console.log("Stored hash:", user.password_hash);
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ ok: false, message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // ✅ Use full_name instead of name
    const safeUser = {
      id: user._id,
      name: user.full_name, // ✅ use full_name
      email: user.email,
      role: user.role,
    };

    console.log("Login successful for:", email);
    res.json({ ok: true, user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
});

// Get current user (protected)
router.get("/me", ensureAuth, (req, res) => {
  const safeUser = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  };
  res.json({ user: safeUser });
});

// Logout (optional – just client-side)
router.post("/logout", (req, res) => {
  res.json({ ok: true, message: "Logged out (client should discard token)" });
});

module.exports = router;

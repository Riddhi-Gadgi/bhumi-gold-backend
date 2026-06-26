module.exports = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      ok: false,
      message: "Email and password are required",
    });
  }

  // simple email format check
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, message: "Invalid email" });
  }

  // password length check
  if (password.length < 6 || password.length > 15) {
    return res
      .status(400)
      .json({ ok: false, message: "Password must be 6–15 characters" });
  }

  next();
};

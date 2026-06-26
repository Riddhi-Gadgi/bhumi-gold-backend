const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Simple User model for testing
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
});
const User = mongoose.model("User", userSchema, "users");

async function debugLogin() {
  try {
    await mongoose.connect(
      "mongodb+srv://gadgiriddhi_db_user:Bhumi2205@bhumigold.kyqigbs.mongodb.net/BhumiGold?retryWrites=true&w=majority&appName=BhumiGold",
    );
    console.log("✅ Connected to MongoDB");

    const testEmail = "admin@bhumigold.com";
    const testPassword = "admin123";

    // Find user
    const user = await User.findOne({ email: testEmail });
    console.log("📧 Looking for email:", testEmail);
    console.log("👤 User found:", user ? "YES" : "NO");

    if (user) {
      console.log("📊 User data:", {
        id: user._id,
        email: user.email,
        role: user.role,
        passwordLength: user.password?.length,
      });

      // Test password
      const isMatch = await bcrypt.compare(testPassword, user.password);
      console.log("🔐 Password match:", isMatch ? "YES ✅" : "NO ❌");

      if (!isMatch) {
        // Generate new hash to see what works
        const newHash = await bcrypt.hash(testPassword, 10);
        console.log("🆕 New hash for same password:", newHash);
        console.log("📝 Compare new vs old:");
        console.log("Old:", user.password);
        console.log("New:", newHash);
      }
    } else {
      // List all users to see what emails exist
      const allUsers = await User.find({}).select("email");
      console.log(
        "📋 All emails in DB:",
        allUsers.map((u) => u.email),
      );
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

debugLogin();

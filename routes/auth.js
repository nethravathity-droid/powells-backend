const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

       // ✅ Check all fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Please login.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful!",
    });

  } catch (error) {
  console.error("REGISTER ERROR:", error); // 👈 VERY IMPORTANT
  res.status(500).json({ message: error.message }); // 👈 show real error
}
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Account does not exist. Please register.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Email or password is incorrect.",
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

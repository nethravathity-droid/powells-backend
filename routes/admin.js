const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Submission = require("../models/Submission");
const LoginLog = require("../models/LoginLog");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const { recordLogin } = require("../utils/loginLog");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || user.role !== "admin") {
      await recordLogin({
        email: normalizedEmail,
        success: false,
        source: "admin",
        req,
      });
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await recordLogin({
        user,
        email: normalizedEmail,
        success: false,
        source: "admin",
        req,
      });
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    await recordLogin({
      user,
      email: normalizedEmail,
      success: true,
      source: "admin",
      req,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/me", authMiddleware, adminMiddleware, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

router.get("/stats", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [contact, inquiry, subscribe, channelPartner, logins, users] =
      await Promise.all([
        Submission.countDocuments({ type: "contact" }),
        Submission.countDocuments({ type: "inquiry" }),
        Submission.countDocuments({ type: "subscribe" }),
        Submission.countDocuments({ type: "channel-partner" }),
        LoginLog.countDocuments({ success: true }),
        User.countDocuments({ role: "user" }),
      ]);

    res.json({
      success: true,
      stats: {
        contact,
        inquiry,
        subscribe,
        channelPartner,
        totalSubmissions: contact + inquiry + subscribe + channelPartner,
        logins,
        users,
      },
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load stats" });
  }
});

router.get("/submissions", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.type && req.query.type !== "all") {
      filter.type = req.query.type;
    }

    const [items, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Submission.countDocuments(filter),
    ]);

    res.json({
      success: true,
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("ADMIN SUBMISSIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load submissions" });
  }
});

router.get("/logins", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LoginLog.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      LoginLog.countDocuments(),
    ]);

    res.json({
      success: true,
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("ADMIN LOGINS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load login history" });
  }
});

router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, items: users });
  } catch (error) {
    console.error("ADMIN USERS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to load users" });
  }
});

module.exports = router;

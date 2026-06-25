const LoginLog = require("../models/LoginLog");

async function recordLogin({ user, email, success, source, req }) {
  try {
    await LoginLog.create({
      userId: user?._id || null,
      email: email?.toLowerCase?.() || email || "",
      name: user?.name || "",
      role: user?.role || "user",
      success,
      source,
      ip: req.ip || req.headers["x-forwarded-for"] || "",
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (err) {
    console.error("LOGIN LOG ERROR:", err.message);
  }
}

module.exports = { recordLogin };

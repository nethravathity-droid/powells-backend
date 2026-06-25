const mongoose = require("mongoose");

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    email: { type: String, required: true },
    name: { type: String, default: "" },
    role: { type: String, default: "user" },
    success: { type: Boolean, required: true },
    source: {
      type: String,
      enum: ["auth", "admin"],
      default: "auth",
    },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true }
);

loginLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("LoginLog", loginLogSchema);

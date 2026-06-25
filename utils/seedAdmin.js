const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Powells Admin";

  if (!email || !password) {
    console.log("Admin seed skipped — set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log("Existing user promoted to admin:", email);
    }
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  await User.create({
    name,
    email,
    phone: "0000000000",
    password: hashedPassword,
    role: "admin",
  });

  console.log("Admin account created:", email);
}

module.exports = seedAdmin;

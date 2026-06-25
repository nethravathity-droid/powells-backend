const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");

router.post("/channel-partner", async (req, res) => {
  const { email, phone, companyName } = req.body;

  if (!email?.trim() || !phone?.trim() || !companyName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits.",
    });
  }

  try {
    await saveSubmission("channel-partner", {
      companyName: companyName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });

    await sendPowellsEmail({
      replyTo: email.trim(),
      subject: `Channel Partner Application: ${companyName.trim()}`,
      html: emailLayout("New Channel Partner Application", [
        ["Company", companyName.trim()],
        ["Email", email.trim()],
        ["Phone", phone.trim()],
      ]),
    });

    return res.status(200).json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    console.error("CHANNEL PARTNER EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application. Please try again.",
    });
  }
});

module.exports = router;

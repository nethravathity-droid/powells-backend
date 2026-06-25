const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  try {
    await sendPowellsEmail({
      replyTo: email.trim(),
      subject: `New Newsletter Subscriber: ${email.trim()}`,
      html: emailLayout("New Newsletter Subscription", [
        ["Email", email.trim()],
        ["Source", "Powells Website — Subscribe Form"],
      ]),
    });

    return res.status(200).json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch (error) {
    console.error("SUBSCRIBE EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again.",
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");

router.post("/inquiry", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name?.trim() || !email?.trim() || !phone?.trim() || !message?.trim()) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits.",
    });
  }

  try {
    await saveSubmission("inquiry", {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    });

    await sendPowellsEmail({
      replyTo: email,
      subject: `Home Page Inquiry: ${name.trim()}`,
      html: emailLayout("New Home Page Inquiry", [
        ["Name", name.trim()],
        ["Email", email.trim()],
        ["Phone", phone.trim()],
        ["Message", message.trim()],
      ]),
    });

    return res.status(200).json({
      success: true,
      message: "Message sent successfully!",
    });
  } catch (error) {
    console.error("INQUIRY EMAIL ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message. Please try again.",
    });
  }
});

module.exports = router;

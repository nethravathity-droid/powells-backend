const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");

router.post("/callback", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    await sendPowellsEmail({
      replyTo: email,
      subject: `New Quotation Request: ${firstName} ${lastName}`,
      html: emailLayout("New Quotation Request", [
        ["Name", `${firstName} ${lastName}`],
        ["Email", email],
        ["Phone", phone],
        ["Message", message],
      ]),
    });

    return res.status(200).json({
      success: true,
      message: "Request sent successfully!",
    });
  } catch (error) {
    console.error("RESEND ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

module.exports = router;
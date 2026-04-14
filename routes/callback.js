const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/callback", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !phone || !message) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  try {
    // Send email using Resend
    await resend.emails.send({
      from: "Powells <onboarding@resend.dev>", // default testing sender
      to: process.env.EMAIL_USER, // your email
      reply_to: email, // so you can reply to customer
      subject: `New Quotation Request: ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>New Inquiry Received</h2>
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `,
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

// Debug logs (optional)
console.log("RESEND KEY:", process.env.RESEND_API_KEY ? "Loaded ✅" : "Missing ❌");
console.log("EMAIL TARGET:", process.env.EMAIL_USER);

module.exports = router;
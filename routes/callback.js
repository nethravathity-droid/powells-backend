const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");
const { normalizePhone, isValidEmail, isValidPhone } = require("../utils/validators");

const REQUEST_TYPES = {
  demo: "Requesting for Demo",
  general: "General Inquiry",
  support: "Technical Support",
  quotation: "Requesting for a Quotation",
};

router.post("/callback", async (req, res) => {
  const { firstName, lastName, email, phone, message, inquiryType } = req.body;

  if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({
      success: false,
      message: "First name, last name, email and mobile number are required.",
    });
  }

  if (!inquiryType || !REQUEST_TYPES[inquiryType]) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid request type.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid email address.",
    });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!isValidPhone(normalizedPhone)) {
    return res.status(400).json({
      success: false,
      message: "Mobile number must be a valid 10-digit number.",
    });
  }

  const requestLabel = REQUEST_TYPES[inquiryType];
  const payload = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: normalizedPhone,
    message: message?.trim() || "—",
    inquiryType,
    requestType: requestLabel,
  };

  try {
    await saveSubmission("contact", payload);
  } catch (error) {
    console.error("CONTACT SAVE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save your request. Please try again.",
    });
  }

  try {
    await sendPowellsEmail({
      replyTo: payload.email,
      subject: `${requestLabel} — ${payload.firstName} ${payload.lastName}`,
      html: emailLayout(requestLabel, [
        ["Request Type", requestLabel],
        ["First Name", payload.firstName],
        ["Last Name", payload.lastName],
        ["Email ID", payload.email],
        ["Mobile Number", payload.phone],
        ["Message", payload.message],
      ]),
    });
  } catch (error) {
    console.error("CONTACT EMAIL ERROR:", error);
    return res.status(200).json({
      success: true,
      message: `${requestLabel} received. Our team will contact you shortly.`,
      inquiryType,
      requestType: requestLabel,
    });
  }

  return res.status(200).json({
    success: true,
    message: `${requestLabel} submitted successfully!`,
    inquiryType,
    requestType: requestLabel,
  });
});

module.exports = router;

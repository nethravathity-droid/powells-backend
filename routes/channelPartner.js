const express = require("express");
const router = express.Router();
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");
const { normalizePhone, isValidEmail, isValidPhone } = require("../utils/validators");

const PARTNER_TYPES = {
  dealer: "Dealer",
  distributor: "Distributor",
  contractor: "Contractor",
  integrator: "System Integrator",
  other: "Other",
};

router.post("/channel-partner", async (req, res) => {
  const {
    contactName,
    email,
    phone,
    companyName,
    city,
    state,
    partnerType,
    gstNumber,
    message,
  } = req.body;

  if (
    !contactName?.trim() ||
    !email?.trim() ||
    !phone?.trim() ||
    !companyName?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !partnerType?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields.",
    });
  }

  if (!PARTNER_TYPES[partnerType]) {
    return res.status(400).json({
      success: false,
      message: "Please select a valid partner type.",
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
      message: "Phone number must be a valid 10-digit mobile number.",
    });
  }

  const payload = {
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    phone: normalizedPhone,
    companyName: companyName.trim(),
    city: city.trim(),
    state: state.trim(),
    partnerType,
    partnerTypeLabel: PARTNER_TYPES[partnerType],
    gstNumber: gstNumber?.trim() || "",
    message: message?.trim() || "",
  };

  try {
    await saveSubmission("channel-partner", payload);
  } catch (error) {
    console.error("CHANNEL PARTNER SAVE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not save your application. Please try again.",
    });
  }

  const emailRows = [
    ["Contact Person", payload.contactName],
    ["Company", payload.companyName],
    ["Partner Type", payload.partnerTypeLabel],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["City", payload.city],
    ["State", payload.state],
    ["GST Number", payload.gstNumber || "—"],
    ["Message", payload.message || "—"],
  ];

  try {
    await sendPowellsEmail({
      replyTo: payload.email,
      subject: `Channel Partner Application: ${payload.companyName}`,
      html: emailLayout("New Channel Partner Application", emailRows),
    });

    await sendPowellsEmail({
      to: payload.email,
      subject: "Powells India — Channel Partner Application Received",
      html: emailLayout("Thank You for Your Application", [
        ["Dear", payload.contactName],
        [
          "Status",
          "We have received your channel partner application and our team will contact you within 48 hours.",
        ],
        ["Company", payload.companyName],
        ["Partner Type", payload.partnerTypeLabel],
      ]),
    });
  } catch (error) {
    console.error("CHANNEL PARTNER EMAIL ERROR:", error);
    return res.status(200).json({
      success: true,
      message:
        "Application saved successfully. Our team will contact you shortly.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Application submitted successfully! We will contact you within 48 hours.",
  });
});

module.exports = router;

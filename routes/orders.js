const express = require("express");
const Order = require("../models/Order");
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");

const router = express.Router();
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER || "919148243088";

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PIC-${ts}-${rand}`;
}

function formatItemList(items) {
  return items.map((item) => `${item.name} × ${item.quantity}`).join("<br/>");
}

function buildWhatsAppText(orderId, customer, items) {
  const lines = items.map((i) => `• ${i.name} × ${i.quantity}`).join("\n");
  return encodeURIComponent(
    `New Powells Order ${orderId}\n\nCustomer: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email}\n\nProducts:\n${lines}\n\nAddress: ${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`
  );
}

router.post("/orders", async (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: "Customer details are required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const orderId = generateOrderId();
    const itemList = formatItemList(items);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${buildWhatsAppText(orderId, customer, items)}`;

    await Order.create({
      orderId,
      customer,
      items,
      paymentMethod: "quotation",
      status: "pending",
    });

    await saveSubmission("order", {
      orderId,
      customer,
      items,
    });

    try {
      await sendPowellsEmail({
        replyTo: customer.email,
        subject: `New Order ${orderId} — ${customer.name}`,
        html: emailLayout("New Product Order", [
          ["Order ID", orderId],
          ["Customer", customer.name],
          ["Email", customer.email],
          ["Phone", customer.phone],
          ["Address", `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`],
          ["Products", itemList],
          ["Notes", customer.notes || "—"],
          [
            "WhatsApp",
            `<a href="${whatsappUrl}">Open order in WhatsApp</a>`,
          ],
        ]),
      });

      await sendPowellsEmail({
        to: customer.email,
        replyTo: process.env.EMAIL_USER,
        subject: `Powells Order Received — ${orderId}`,
        html: emailLayout("Thank You for Your Order", [
          ["Order ID", orderId],
          ["Status", "Received — our team will contact you with pricing"],
          ["Products", itemList],
          ["Contact", "080 28016867 | sales@powellsindiacorporation.com"],
        ]),
      });
    } catch (emailErr) {
      console.error("ORDER EMAIL ERROR:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId,
      whatsappUrl,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

module.exports = router;

const express = require("express");
const Order = require("../models/Order");
const { sendPowellsEmail, emailLayout } = require("../utils/mailer");
const { saveSubmission } = require("../utils/saveSubmission");

const router = express.Router();

function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PIC-${ts}-${rand}`;
}

router.post("/orders", async (req, res) => {
  try {
    const { customer, items, subtotal, deliveryFee, total, paymentMethod } = req.body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address) {
      return res.status(400).json({ success: false, message: "Customer details are required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      customer,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
    });

    const itemRows = items
      .map(
        (item) =>
          `${item.name} × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString("en-IN")}`
      )
      .join("<br/>");

    await saveSubmission("order", {
      orderId,
      customer,
      items,
      subtotal,
      deliveryFee,
      total,
      paymentMethod: "cod",
    });

    try {
      await sendPowellsEmail({
        replyTo: customer.email,
        subject: `New COD Order ${orderId} — ${customer.name}`,
        html: emailLayout(`New Cash on Delivery Order`, [
          ["Order ID", orderId],
          ["Customer", customer.name],
          ["Email", customer.email],
          ["Phone", customer.phone],
          ["Address", `${customer.address}, ${customer.city}, ${customer.state} - ${customer.pincode}`],
          ["Payment", "Cash on Delivery"],
          ["Items", itemRows],
          ["Subtotal", `₹${subtotal?.toLocaleString("en-IN")}`],
          ["Delivery", deliveryFee ? `₹${deliveryFee.toLocaleString("en-IN")}` : "FREE"],
          ["Total", `₹${total?.toLocaleString("en-IN")}`],
          ["Notes", customer.notes || "—"],
        ]),
      });
    } catch (emailErr) {
      console.error("ORDER EMAIL ERROR:", emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
    });
  } catch (error) {
    console.error("ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

module.exports = router;

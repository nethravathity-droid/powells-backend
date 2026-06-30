const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    price: { type: Number, required: false },
    quantity: Number,
    image: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      notes: String,
    },
    items: [orderItemSchema],
    subtotal: Number,
    deliveryFee: Number,
    total: Number,
    paymentMethod: {
      type: String,
      default: "quotation",
      enum: ["cod", "quotation"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model("Order", orderSchema);

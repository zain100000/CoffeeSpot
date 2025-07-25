const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema(
  {
    profilePicture: {
      type: String,
    },

    userName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
    },

    cart: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },

        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },

        quantity: {
          type: Number,
          default: 1,
        },

        price: {
          type: Number,
          required: true,
        },

        unitPrice: {
          type: Number,
          required: true,
        },
      },
    ],

    orders: [
      {
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Order",
        },

        status: {
          type: String,
          enum: [
            "ORDER_RECEIVED", // Order placed but payment not confirmed yet
            "PAYMENT_CONFIRMED", // Payment successfully processed
            "PREPARING", // Barista is making the drinks
            "READY_FOR_PICKUP", // Order is ready at counter
            "PICKED_UP", // Customer has received order
            "COMPLETED", // Order fulfilled (for records)
            "CANCELLED", // Order cancelled before preparation
            "REFUNDED", // Order cancelled and refunded
          ],
          default: "ORDER_RECEIVED",
        },

        placedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create and export the User model
module.exports = mongoose.model("User", userSchema);

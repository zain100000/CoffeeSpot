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
          enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PENDING",
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

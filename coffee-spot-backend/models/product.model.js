const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productImage: {
      type: String,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: [String],
      required: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    // Admin who added the product
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

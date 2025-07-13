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

    // Admin who added the product
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);

const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    // User reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // SuperAdmin reference
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SuperAdmin",
      required: true,
    },

    // Text messages only
    messages: [
      {
        sender: {
          type: String,
          enum: ["USER", "SUPERADMIN"],
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        sentAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Active/inactive status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
chatSchema.index({ user: 1 });
chatSchema.index({ superAdmin: 1 });
chatSchema.index({ isActive: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);

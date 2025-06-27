const mongoose = require("mongoose");
const Review = require("../models/review.model");
const User = require("../models/user.model");

// Add a new review
exports.addReview = async (req, res) => {
  try {
    const { userId, comment, rating } = req.body;

    if (!userId || !comment || rating == null) {
      return res.status(400).json({
        success: false,
        message: "userId, comment, and rating are required.",
      });
    }

    // Validate user existence
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Use 'new' with ObjectId constructor
    const review = await Review.create({
      userId: new mongoose.Types.ObjectId(userId),
      comment,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get all reviews with full user data
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate(
      "userId",
      "userName email profilePicture"
    );

    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No reviews found.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Reviews fetched successfully!",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

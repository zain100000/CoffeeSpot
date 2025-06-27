const express = require("express");
const router = express.Router();
const protect = require("../middlewares/authMiddleware/auth.middleware");
const reviewController = require("../controllers/review.controller");

// Route to add review
router.post("/add-review", protect, reviewController.addReview);

// Route to get all reviews
router.get("/get-all-reviews", reviewController.getAllReviews);

module.exports = router;

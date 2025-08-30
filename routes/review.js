const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");

//requiring the models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

//requiring the Review controllers
const reviewController = require("../Controllers/review.js");

//post review route
router.post("/", validateReview, isLoggedIn , wrapAsync(reviewController.postReview));

//delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview))

module.exports = router ;
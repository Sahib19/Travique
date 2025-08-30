const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn , isReviewAuthor} = require("../middleware.js");

//requiring the models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");




//post review route
router.post("/", validateReview,isLoggedIn, wrapAsync(async (req, res) => {
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    let listing = await Listing.findById(req.params.id);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success" , "New Review Created!");
    res.redirect(`/listing/${listing.id}`)
}));

//delete review route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(`${reviewId}`);
    req.flash("error" , "Review Deleted!");
    res.redirect(`/listing/${id}`)
}))

module.exports = router ;
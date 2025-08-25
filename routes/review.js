const express = require("express");
const router = express.Router({mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const {  reviewSchema} = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js") ;

//requiring the models
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");


//creating a middleware to handle the validation of reviews
const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg)
    } else {
        next();
    }
}

//post review route
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let newReview = new Review(req.body.review);
    let listing = await Listing.findById(req.params.id);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success" , "New Review Created!");
    res.redirect(`/listing/${listing.id}`)
}));

//delete review route
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(`${reviewId}`);
    req.flash("error" , "Review Deleted!");
    res.redirect(`/listing/${id}`)
}))

module.exports = router ;
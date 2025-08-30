const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.postReview = async (req, res) => {
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    let listing = await Listing.findById(req.params.id);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success" , "New Review Created!");
    res.redirect(`/listing/${listing.id}`)
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(`${reviewId}`);
    req.flash("error" , "Review Deleted!");
    res.redirect(`/listing/${id}`)
}
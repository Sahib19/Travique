const Review = require("../models/review");
const Listing = require("../models/listing");
const User = require("../models/user");

module.exports.postReview = async (req, res) => {
    try {
        console.log("Creating review for user:", req.user._id);

        let newReview = new Review(req.body.review);
        newReview.author = req.user._id;
        let listing = await Listing.findById(req.params.id);
        listing.reviews.push(newReview);

        // Save the review first
        await newReview.save();
        console.log("Review saved with ID:", newReview._id);

        // Increment user's review count after review is saved
        const updateResult = await User.findByIdAndUpdate(req.user._id, {
            $inc: { 'stats.totalReviews': 1 }
        });
        console.log("User review count updated:", updateResult);

        // Then save the listing
        await listing.save();
        console.log("Listing updated with new review");

        req.flash("success" , "New Review Created!");
        res.redirect(`/listing/${listing.id}`)
    } catch (error) {
        console.error("Error creating review:", error);
        req.flash("error", "Failed to create review. Please try again.");
        res.redirect(`/listing/${req.params.id}`);
    }
}

module.exports.destroyReview = async (req, res) => {
    try {
        let { id, reviewId } = req.params;

        // Get the review to find the author before deleting
        const review = await Review.findById(reviewId);
        if (!review) {
            console.log("Review not found:", reviewId);
            req.flash("error", "Review not found!");
            return res.redirect(`/listing/${id}`);
        }

        console.log("Deleting review:", reviewId, "by user:", review.author);

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

        // Decrement the correct user's review count
        const updateResult = await User.findByIdAndUpdate(review.author, {
            $inc: { 'stats.totalReviews': -1 }
        });
        console.log("User review count decremented:", updateResult);

        await Review.findByIdAndDelete(`${reviewId}`);
        console.log("Review deleted from database");

        req.flash("error" , "Review Deleted!");
        res.redirect(`/listing/${id}`)
    } catch (error) {
        console.error("Error deleting review:", error);
        req.flash("error", "Failed to delete review. Please try again.");
        res.redirect(`/listing/${req.params.id}`);
    }
}
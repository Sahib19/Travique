const Listing = require("./models/listing");
const Review = require("./models//review.js");
const { listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js") ;

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged In First !!");
        return res.redirect("/user/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!(res.locals.currentUser && res.locals.currentUser._id.equals(listing.owner._id))) {
        req.flash("error", "You don't have the Permission !!!!")
        return res.redirect(`/listing/${id}`);
    }
    next();

}

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId  } = req.params;
    let review = await Review.findById(reviewId);
    if (!(review.author.equals(res.locals.currentUser._id))) {
        req.flash("error", "You don't have the Permission !!!!")
        return res.redirect(`/listing/${id}`);
    }
    next();

}

//creating a middleware to handle the validation
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg)
    } else {
        next();
    }
}

//creating a middleware to handle the validation of reviews
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg)
    } else {
        next();
    }
}

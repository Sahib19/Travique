const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
//requiring the models
const Listing = require("../models/listing.js");

//requiring the middle to check user doing somehting is authenticated ot not
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");


//show route
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}))

//render form to create the new route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/form.ejs");
})

// showing a particular Listing in big page
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Oops ! Listing Not Found :( ");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs", { listing });
}))

//create route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    let newlisting = Listing(req.body);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
}))

//Rendering the form to edit the existing listing
router.get("/edit/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Oops ! Listing Not Found :( ");
        return res.redirect("/listing");
    }
    res.render("listings/editForm.ejs", { listing });
}))

//changing the update in the database
router.put("/update/:id", isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params
    if (!req.body) {
        throw new ExpressError(400, "Send valid Data"); // bad request due to client mistake
    }
    await Listing.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash("success", "Exiting Listing Updated!");
    res.redirect("/listing");

}))

//delete roooute
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listing");

}))

module.exports = router;
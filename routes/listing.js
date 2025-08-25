const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js") ;
//requiring the models
const Listing = require("../models/listing.js");

//creating a middleware to handle the validation
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(404, errMsg)
    } else {
        next();
    }
}


//show route
router.get("/", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}))

//render form to create the new route
router.get("/new", (req, res) => {
    res.render("listings/form.ejs");
})

// showing a particular Listing in big page
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    // console.log(listing);
    res.render("listings/show.ejs", { listing });
}))

//create route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    let newlisting = Listing(req.body);
    await newlisting.save();
    res.redirect("/listing");
}))

//Rendering the form to edit the existing listing
router.get("/edit/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/editForm.ejs", { listing });
}))

//changing the update in the database
router.put("/update/:id", wrapAsync(async (req, res) => {
    let { id } = req.params
    if (!req.body) {
        throw new ExpressError(400, "Send valid Data"); // bad request due to client mistake
    }
    await Listing.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect("/listing");

}))

//delete roooute
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");

}))

module.exports = router ;
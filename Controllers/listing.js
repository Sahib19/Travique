const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

module.exports.index = async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/form.ejs");
}

module.exports.showRoute = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" }, }).populate("owner");
    if (!listing) {
        req.flash("error", "Oops ! Listing Not Found :( ");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs", { listing });
}

module.exports.createNewListing = async (req, res) => {
    let newlisting = Listing(req.body);
    newlisting.owner = req.user._id;
    await newlisting.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listing");
}

module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Oops ! Listing Not Found :( ");
        return res.redirect("/listing");
    }
    res.render("listings/editForm.ejs", { listing })
};

module.exports.updateListingInDb = async (req, res) => {
    let { id } = req.params
    if (!req.body) {
        throw new ExpressError(400, "Send valid Data"); // bad request due to client mistake
    }
    console.log(req.body);
    await Listing.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    req.flash("success", "Exiting Listing Updated!");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listing");

}
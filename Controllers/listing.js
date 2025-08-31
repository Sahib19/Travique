const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

const {getResizedImageUrl} = require("../utils/resizeImages.js");

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
    let url = req.file.path;
    let filename = req.file.filename;
    let newlisting = Listing(req.body);
    newlisting.owner = req.user._id;
    newlisting.image = { url, filename };
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
    let originalImageUrl = listing.image.url;
    let resizeImageUrl =  getResizedImageUrl(originalImageUrl);

    // originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

    res.render("listings/editForm.ejs", { listing , resizeImageUrl})
};

module.exports.updateListingInDb = async (req, res) => {
    let { id } = req.params
    if (!req.body) {
        throw new ExpressError(400, "Send valid Data"); // bad request due to client mistake
    }
    let listing = await Listing.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });

    //Changing the New images uploaded through editForm
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Exiting Listing Updated!");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("error", "Listing Deleted!");
    res.redirect("/listing");

}
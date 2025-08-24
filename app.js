const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")

//allowing  hoppscotch
const cors = require("cors");
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

//// joi walla validation
const { listingSchema } = require("./schema.js");
const { reviewSchema } = require("./schema.js");

//ejs mate -> help to create templates like includes and partials
const ejsMate = require("ejs-mate");


const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

// connecting with mongo
async function main() {
    // below line will return a promise
    await mongoose.connect('mongodb://127.0.0.1:27017/Wonderlust');
}

main()
    .then(() => {
        console.log("Connection Built Sucessfully");
    })
    .catch(err => console.log(err));

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

app.get("/listing", wrapAsync(async (req, res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", { allListing });
}))

app.get("/listing/new", (req, res) => {
    res.render("listings/form.ejs");
})

app.get("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}))

//create route
app.post("/listing", validateListing, wrapAsync(async (req, res) => {
    let newlisting = Listing(req.body);
    await newlisting.save();
    res.redirect("/listing");
}))

app.get("/listing/edit/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    res.render("listings/editForm.ejs", { listing });
}))

//changing the update in the database
app.put("/listing/update/:id", wrapAsync(async (req, res) => {
    let { id } = req.params
    if (!req.body) {
        throw new ExpressError(400, "Send valid Data"); // bad request due to client mistake
    }
    await Listing.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
    res.redirect("/listing");

}))

//delete roooute
app.delete("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listing");

}))

//Review Routes
//post review route
app.post("/listing/:id/review", validateReview, wrapAsync(async (req, res) => {
    let newReview = new Review(req.body.review);
    let listing = await Listing.findById(req.params.id);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listing/${listing.id}`)
}));

app.all("/", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

//delete review route
app.delete("/listing/:id/review/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(`${reviewId}`);
    res.redirect(`/listing/${id}`)
}))

//middleware to handle the error ocured in the backend
app.use((err, req, res, next) => {
    let { status = 505, message = "Some Error Ocurred" } = err;
    res.status(status).render("error.ejs", { message });
})

app.listen(8080, () => {
    console.log("Server is listening at port 8080");
})
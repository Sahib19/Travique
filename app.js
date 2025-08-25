const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const path = require("path");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")

//allowing  hoppscotch
const cors = require("cors");
app.use(cors());

app.use(express.static(path.join(__dirname, "public")));

// joi walla validation
// const { listingSchema , reviewSchema} = require("./schema.js");

//ejs mate -> help to create templates like includes and partials
const ejsMate = require("ejs-mate");

//requiring the models
// const Listing = require("./models/listing.js");
// const Review = require("./models/review.js");

//Requiring the Router Object
const listing = require("./routes/listing.js"); 
const review = require("./routes/review.js"); 

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

//--------------------------------------------------------------------------------------------------------------


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

// listing routers
app.use("/listing", listing );
// review routers
app.use("/listing/:id/review" , review)

app.all("/", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

//middleware to handle the error ocured in the backend
app.use((err, req, res, next) => {
    let { status = 505, message = "Some Error Ocurred" } = err;
    res.status(status).render("error.ejs", { message });
})

app.listen(8080, () => {
    console.log("Server is listening at port 8080");
})
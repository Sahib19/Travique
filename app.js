if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const path = require("path");
// const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

//allowing  hoppscotch
const cors = require("cors");
app.use(cors());

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
const userRouter = require("./routes/user.js");

//Requiring things related to authentication and authorization
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);

//--------------------------------------------------------------------------------------------------------------

const dbURL = process.env.ATLAS_MONGO_DB ;
// connecting with mongo
async function main() {
    // below line will return a promise
    await mongoose.connect(dbURL);
}

main()
    .then(() => {
        console.log("Connection Built Sucessfully");
    })
    .catch(err => console.log(err));
//============================================================================================================

//session related things
const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto:{
        secret : "mysupersecretkey",
    },
    touchAfter : 24 * 3600,
}) 

const sessionOptions = {
    store,
    secret: "mysupersecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    
    next();
})

app.get("/", (req, res) => {
  res.redirect("/listing");  // or render your home.ejs
});

// listing routers
app.use("/listing", listing);
// review routers;
app.use("/listing/:id/review", review);

// User routers
app.use("/user", userRouter);

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
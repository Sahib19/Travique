const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Listing = require("../models/listing");
const wrapasync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../middleware");

const userController = require("../Controllers/user")

router.route("/signup")
    .get(userController.showSignupPage)
    .post(wrapasync(userController.signup))

router.route("/login")
    .get(userController.showLoginForm)
    .post(saveRedirectUrl,
        passport.authenticate("local",
            { failureRedirect: "/user/login", failureFlash: true }), userController.login)

router.get("/logout", userController.logout)

// Profile Routes
router.get("/profile", isLoggedIn, wrapasync(userController.showProfile));
router.get("/profile/edit", isLoggedIn, wrapasync(userController.editProfile));
router.post("/profile/update", isLoggedIn, wrapasync(userController.updateProfile));

// Wishlist Routes
router.get("/wishlist", isLoggedIn, wrapasync(userController.showWishlist));
router.post("/wishlist/toggle", isLoggedIn, wrapasync(userController.toggleWishlist));
router.post("/wishlist/clear", isLoggedIn, wrapasync(userController.clearWishlist));
// User's Listings
router.get("/my-listings", isLoggedIn, wrapasync(userController.showMyListings));

// Settings
router.get("/settings", isLoggedIn, wrapasync(userController.showSettings));

module.exports = router;
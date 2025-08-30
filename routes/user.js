const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapasync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");

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


module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapasync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapasync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email })
        let registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err)
            }
            req.flash("success", "Welcome to WanderLust")
            res.redirect("/listing")
        });


    } catch (e) {
        req.flash("error", e.message);
        res.redirect("signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
})

router.post("/login", saveRedirectUrl ,
    passport.authenticate("local",
        { failureRedirect: "/user/login", failureFlash: true }),
    async (req, res) => {
        req.flash("success", "Welcome back to Wonderlust");
        let redirectUrl = res.locals.redirectUrl || "/listing"
        res.redirect(redirectUrl);
    })

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully logged out !!");
        res.redirect("/listing");
    });
});


module.exports = router;
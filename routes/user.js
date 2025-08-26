const express = require("express");
const router = express.Router();
const User = require("../models/user");
const wrapasync = require("../utils/wrapAsync");
const passport = require("passport");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
})

router.post("/signup", wrapasync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ username, email })
        let result = await User.register(newUser, password);
        console.log(result);
        req.flash("success", "Welcome to WanderLust");
        res.redirect("/listing");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("signup");
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs");
})

router.post("/login",
    passport.authenticate("local",
        { failureRedirect: "/user/login", failureFlash: true }),
    (req,res) => {
        req.flash("success", "Welcome back to Wonderlust");
        res.redirect("/listing")
    })
module.exports = router;
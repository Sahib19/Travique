const User = require("../models/user");


module.exports.showSignupPage = (req, res) => {
    res.render("users/signup.ejs");
}


module.exports.signup = async (req, res) => {
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
}

module.exports.showLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async (req, res) => {
        req.flash("success", "Welcome back to Wonderlust");
        let redirectUrl = res.locals.redirectUrl || "/listing"
        res.redirect(redirectUrl);
    }

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully logged out !!");
        res.redirect("/listing");
    });
}
const User = require("../models/user");
const Listing = require("../models/listing");
const Booking = require("../models/booking");

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
            req.flash("success", "Welcome to Travique!")
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
    req.flash("success", "Welcome back to Travique!");
    let redirectUrl = res.locals.redirectUrl || "/listing"
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Successfully logged out!");
        res.redirect("/listing");
    });
}

// Profile Controllers
module.exports.showProfile = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    const listingsCount = await Listing.countDocuments({ owner: req.user._id });
    user._listingsCount = listingsCount; // Set for virtual
    res.render("users/profile.ejs", { user });
}

module.exports.editProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    res.render("users/editProfile.ejs", { user });
}

module.exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, phone, location, favoriteCategories, travelStyle, priceMin, priceMax } = req.body;

        // Handle favoriteCategories - it might be a string if only one is selected
        let categoriesArray = [];
        if (favoriteCategories) {
            categoriesArray = Array.isArray(favoriteCategories) ? favoriteCategories : [favoriteCategories];
        }

        const updateData = {
            'profile.firstName': firstName || '',
            'profile.lastName': lastName || '',
            'profile.bio': bio || '',
            'profile.phone': phone || '',
            'profile.location': location || '',
            'profile.preferences.favoriteCategories': categoriesArray,
            'profile.preferences.travelStyle': travelStyle || 'Mid-range',
            'profile.preferences.priceRange.min': priceMin || 0,
            'profile.preferences.priceRange.max': priceMax || 100000
        };

        await User.findByIdAndUpdate(req.user._id, updateData, { runValidators: true });
        req.flash("success", "Profile updated successfully!");
        res.redirect("/user/profile");
    } catch (error) {
        console.error('Error updating profile:', error);
        req.flash("error", "Failed to update profile. Please try again.");
        res.redirect("/user/profile/edit");
    }
}

// Wishlist Controllers
module.exports.showWishlist = async (req, res) => {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.render("users/wishlist.ejs", { wishlist: user.wishlist });
}

module.exports.toggleWishlist = async (req, res) => {
    try {
        const { listingId } = req.body;
        
        if (!listingId) {
            return res.status(400).json({
                success: false,
                message: 'Listing ID is required'
            });
        }
        
        const user = await User.findById(req.user._id);
        
        const isInWishlist = user.wishlist.includes(listingId);
        
        if (isInWishlist) {
            user.wishlist.pull(listingId);
        } else {
            user.wishlist.push(listingId);
        }
        
        await user.save();
        
        res.json({
            success: true,
            isInWishlist: !isInWishlist,
            wishlistCount: user.wishlist.length
        });
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating wishlist'
        });
    }
}

// Clear Wishlist Controller
module.exports.clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.wishlist = [];
        await user.save();
        
        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({
            success: false,
            message: 'Error clearing wishlist'
        });
    }
}

module.exports.showMyListings = async (req, res) => {
    const listings = await Listing.find({ owner: req.user._id });
    res.render("users/myListings.ejs", { listings });
}

// Settings Controller
module.exports.showSettings = async (req, res) => {
    try {
        console.log("Fetching settings for user:", req.user._id);

        const user = await User.findById(req.user._id);
        console.log("User stats:", user.stats);

        const listingsCount = await Listing.countDocuments({ owner: req.user._id });
        user._listingsCount = listingsCount; // Set for virtual

        // Calculate booking statistics
        const guestBookingsCount = await Booking.countDocuments({ guest: req.user._id });
        const hostBookingsCount = await Booking.countDocuments({ host: req.user._id });

        user._guestBookingsCount = guestBookingsCount;
        user._hostBookingsCount = hostBookingsCount;

        console.log("Rendering settings page with totalReviews:", user.stats?.totalReviews || 0);

        res.render("users/settings.ejs", { user });
    } catch (error) {
        console.error("Error fetching settings:", error);
        req.flash("error", "Failed to load settings. Please try again.");
        res.redirect("/listing");
    }
}
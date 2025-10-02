const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    // Enhanced Profile Fields
    profile: {
        firstName: {
            type: String,
            default: ""
        },
        lastName: {
            type: String,
            default: ""
        },
        bio: {
            type: String,
            default: "",
            maxlength: 500
        },
        avatar: {
            url: {
                type: String,
                default: "https://res.cloudinary.com/dqzho5qhz/image/upload/v1703123456/default-avatar.png"
            },
            filename: {
                type: String,
                default: ""
            }
        },
        phone: {
            type: String,
            default: ""
        },
        location: {
            type: String,
            default: ""
        },
        dateOfBirth: {
            type: Date
        },
        preferences: {
            favoriteCategories: [{
                type: String,
                enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Forest", "Heritage Sites", "Castles", "Beaches", "Camping", "Farms", "Artic"]
            }],
            priceRange: {
                min: {
                    type: Number,
                    default: 0
                },
                max: {
                    type: Number,
                    default: 100000
                }
            },
            travelStyle: {
                type: String,
                enum: ["Budget", "Mid-range", "Luxury", "Adventure", "Relaxation"],
                default: "Mid-range"
            }
        }
    },
    // Wishlist/Favorites
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: "Listing"
    }],
    // User Statistics
    stats: {
        joinedDate: {
            type: Date,
            default: Date.now
        },
        totalBookings: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
    return `${this.profile.firstName} ${this.profile.lastName}`.trim() || this.username;
});

// Virtual for wishlist count
userSchema.virtual('wishlistCount').get(function() {
    return this.wishlist ? this.wishlist.length : 0;
});

// Virtual for listings count
userSchema.virtual('listingsCount').get(function() {
    return this._listingsCount || 0;
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);
module.exports = User;
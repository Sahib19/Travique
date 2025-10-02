const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    guest: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    nights: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled", "completed"],
        default: "pending"
    },
    specialRequests: {
        type: String,
        maxlength: 500
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    // Payment information (for future payment integration)
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "refunded", "failed"],
        default: "pending"
    },
    // Booking management
    cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    cancellationReason: {
        type: String,
        maxlength: 300
    },
    cancellationDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Virtual for calculating total nights
bookingSchema.virtual('totalNights').get(function() {
    return Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
});

// Index for efficient queries
bookingSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ guest: 1, status: 1 });
bookingSchema.index({ host: 1, status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

// Import booking controller
const bookingController = require("../Controllers/booking.js");

// Booking routes

// Create a new booking for a listing
router.post("/listing/:listingId", isLoggedIn, wrapAsync(bookingController.createBooking));

// Check availability for dates
router.get("/availability/:listingId", wrapAsync(bookingController.checkAvailability));

// User bookings dashboard
router.get("/user/bookings", isLoggedIn, wrapAsync(bookingController.showMyBookings));

// Show specific booking details
router.get("/:bookingId", isLoggedIn, wrapAsync(bookingController.showBooking));

// Confirm a booking (host action)
router.post("/:bookingId/confirm", isLoggedIn, wrapAsync(bookingController.confirmBooking));

// Cancel a booking
router.post("/:bookingId/cancel", isLoggedIn, wrapAsync(bookingController.cancelBooking));

module.exports = router;

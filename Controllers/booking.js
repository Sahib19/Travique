const Booking = require("../models/booking");
const Listing = require("../models/listing");
const User = require("../models/user");

// Create a new booking
module.exports.createBooking = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { checkIn, checkOut, guests, specialRequests } = req.body;

        // Validate dates
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        if (checkInDate >= checkOutDate) {
            req.flash("error", "Check-out date must be after check-in date");
            return res.redirect(`/listing/${listingId}`);
        }

        // Get listing details
        const listing = await Listing.findById(listingId);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listing");
        }

        // Check if listing is available for these dates
        const existingBookings = await Booking.find({
            listing: listingId,
            status: { $in: ["confirmed", "pending"] },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate }
                }
            ]
        });

        if (existingBookings.length > 0) {
            req.flash("error", "This listing is not available for the selected dates");
            return res.redirect(`/listing/${listingId}`);
        }

        // Calculate total price
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const totalPrice = listing.price * nights;

        // Get host information
        const host = await User.findById(listing.owner);

        // Create booking
        const booking = new Booking({
            listing: listingId,
            guest: req.user._id,
            host: listing.owner,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests,
            totalPrice: totalPrice,
            nights: nights,
            specialRequests: specialRequests,
            status: "pending" // Will be confirmed by host or auto-confirmed
        });

        await booking.save();

        // Add booking reference to listing (optional - for quick lookup)
        listing.bookings = listing.bookings || [];
        listing.bookings.push(booking._id);
        await listing.save();

        req.flash("success", "Booking request sent! Waiting for host confirmation.");
        res.redirect(`/listing/${listingId}`);

    } catch (error) {
        console.error("Error creating booking:", error);
        req.flash("error", "Failed to create booking. Please try again.");
        res.redirect(`/listing/${listingId}`);
    }
};

// Show user's bookings
module.exports.showMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            $or: [
                { guest: req.user._id },
                { host: req.user._id }
            ]
        })
        .populate('listing')
        .populate('guest', 'username email')
        .populate('host', 'username email')
        .sort({ createdAt: -1 });

        res.render("bookings/index.ejs", { bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        req.flash("error", "Failed to load bookings");
        res.redirect("/listing");
    }
};

// Show booking details
module.exports.showBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findById(bookingId)
            .populate('listing')
            .populate('guest', 'username email profile')
            .populate('host', 'username email profile');

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/user/bookings");
        }

        // Check if user has permission to view this booking
        if (booking.guest._id.toString() !== req.user._id.toString() &&
            booking.host._id.toString() !== req.user._id.toString()) {
            req.flash("error", "You don't have permission to view this booking");
            return res.redirect("/user/bookings");
        }

        res.render("bookings/show.ejs", { booking });
    } catch (error) {
        console.error("Error fetching booking:", error);
        req.flash("error", "Failed to load booking details");
        res.redirect("/user/bookings");
    }
};

// Cancel a booking
module.exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { reason } = req.body;

        const booking = await Booking.findById(bookingId)
            .populate('listing')
            .populate('guest')
            .populate('host');

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/user/bookings");
        }

        // Check permissions
        const isGuest = booking.guest._id.toString() === req.user._id.toString();
        const isHost = booking.host._id.toString() === req.user._id.toString();

        if (!isGuest && !isHost) {
            req.flash("error", "You don't have permission to cancel this booking");
            return res.redirect("/user/bookings");
        }

        // Check if booking can be cancelled (e.g., not too close to check-in date)
        const now = new Date();
        const hoursUntilCheckIn = (booking.checkIn - now) / (1000 * 60 * 60);

        if (hoursUntilCheckIn < 24 && isGuest) {
            req.flash("error", "Bookings cannot be cancelled within 24 hours of check-in");
            return res.redirect(`/booking/${bookingId}`);
        }

        // Update booking status
        booking.status = "cancelled";
        booking.cancelledBy = req.user._id;
        booking.cancellationReason = reason;
        booking.cancellationDate = now;

        await booking.save();

        const cancelledBy = isGuest ? "guest" : "host";
        req.flash("success", `Booking cancelled by ${cancelledBy}`);

        res.redirect(`/booking/${bookingId}`);
    } catch (error) {
        console.error("Error cancelling booking:", error);
        req.flash("error", "Failed to cancel booking. Please try again.");
        res.redirect(`/booking/${req.params.bookingId}`);
    }
};

// Confirm a booking (host action)
module.exports.confirmBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate('listing')
            .populate('guest')
            .populate('host');

        if (!booking) {
            req.flash("error", "Booking not found");
            return res.redirect("/user/bookings");
        }

        // Check if user is the host
        if (booking.host._id.toString() !== req.user._id.toString()) {
            req.flash("error", "Only the host can confirm bookings");
            return res.redirect("/user/bookings");
        }

        // Update booking status
        booking.status = "confirmed";
        await booking.save();

        req.flash("success", "Booking confirmed!");
        res.redirect(`/booking/${bookingId}`);
    } catch (error) {
        console.error("Error confirming booking:", error);
        req.flash("error", "Failed to confirm booking. Please try again.");
        res.redirect(`/booking/${req.params.bookingId}`);
    }
};

// Check availability for dates
module.exports.checkAvailability = async (req, res) => {
    try {
        const { listingId } = req.params;
        const { checkIn, checkOut } = req.query;

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Find conflicting bookings
        const conflictingBookings = await Booking.find({
            listing: listingId,
            status: { $in: ["confirmed", "pending"] },
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate }
                }
            ]
        });

        const isAvailable = conflictingBookings.length === 0;

        res.json({
            available: isAvailable,
            conflicts: conflictingBookings.length
        });
    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({
            error: "Failed to check availability"
        });
    }
};

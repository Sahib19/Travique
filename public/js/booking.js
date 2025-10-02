// Booking functionality
document.addEventListener('DOMContentLoaded', function() {
    // Calculate total price when dates or guests change
    window.calculateTotalPrice = function() {
        const checkIn = document.getElementById('checkIn');
        const checkOut = document.getElementById('checkOut');
        const guests = document.getElementById('guests');
        const bookBtn = document.getElementById('bookBtn');

        if (!checkIn || !checkOut || !guests) return;

        const checkInDate = new Date(checkIn.value);
        const checkOutDate = new Date(checkOut.value);

        // Validate dates
        if (checkInDate >= checkOutDate) {
            document.getElementById('nightsCount').textContent = '0';
            document.getElementById('subtotal').textContent = '₹0';
            document.getElementById('serviceFee').textContent = '₹0';
            document.getElementById('totalPrice').textContent = '₹0';
            bookBtn.disabled = true;
            return;
        }

        // Calculate nights
        const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        const basePrice = parseInt(listingPrice);
        const subtotal = basePrice * nights;
        const serviceFee = Math.round(subtotal * 0.1); // 10% service fee
        const total = subtotal + serviceFee;

        // Update display
        document.getElementById('nightsCount').textContent = nights;
        document.getElementById('subtotal').textContent = '₹' + subtotal.toLocaleString('en-IN');
        document.getElementById('serviceFee').textContent = '₹' + serviceFee.toLocaleString('en-IN');
        document.getElementById('totalPrice').textContent = '₹' + total.toLocaleString('en-IN');

        // Enable/disable book button
        bookBtn.disabled = !guests.value || nights <= 0;
    };

    // Set minimum check-out date when check-in changes
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');

    if (checkInInput && checkOutInput) {
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            checkInDate.setDate(checkInDate.getDate() + 1);
            checkOutInput.min = checkInDate.toISOString().split('T')[0];

            // Reset check-out if it's before new minimum
            if (new Date(checkOutInput.value) <= checkInDate) {
                checkOutInput.value = checkInDate.toISOString().split('T')[0];
            }

            calculateTotalPrice();
        });

        checkOutInput.addEventListener('change', calculateTotalPrice);
    }

    // Form validation
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            const checkIn = document.getElementById('checkIn').value;
            const checkOut = document.getElementById('checkOut').value;
            const guests = document.getElementById('guests').value;

            if (!checkIn || !checkOut || !guests) {
                e.preventDefault();
                alert('Please fill in all required fields');
                return;
            }

            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (checkInDate >= checkOutDate) {
                e.preventDefault();
                alert('Check-out date must be after check-in date');
                return;
            }
        });
    }

    // Auto-calculate on page load if dates are pre-filled
    if (checkInInput && checkInInput.value && checkOutInput && checkOutInput.value) {
        calculateTotalPrice();
    }
});

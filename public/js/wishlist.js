// Wishlist functionality
window.toggleWishlist = async function(listingId, button) {
    try {
        console.log('Toggling wishlist for listing:', listingId);
        
        const response = await fetch('/user/wishlist/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ listingId: listingId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Wishlist response:', data);

        if (data.success) {
            // Toggle the active class
            button.classList.toggle('active');
            
            // Update the heart icon animation
            const icon = button.querySelector('i');
            if (button.classList.contains('active')) {
                icon.style.animation = 'heartBeat 0.6s ease';
                showNotification('Added to wishlist!', 'success');
            } else {
                icon.style.animation = '';
                showNotification('Removed from wishlist!', 'info');
            }

            // Update wishlist count in navbar if exists
            updateWishlistCount(data.wishlistCount);
            
        } else {
            showNotification(data.message || 'Something went wrong!', 'error');
        }
    } catch (error) {
        console.error('Error toggling wishlist:', error);
        showNotification('Please login to add items to wishlist', 'error');
    }
}

// Update wishlist count in navbar
function updateWishlistCount(count) {
    const wishlistBadge = document.querySelector('.dropdown-menu .badge');
    const wishlistLink = document.querySelector('a[href="/user/wishlist"]');
    
    if (wishlistLink) {
        // Remove existing badge
        const existingBadge = wishlistLink.querySelector('.badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge if count > 0
        if (count > 0) {
            const badge = document.createElement('span');
            badge.className = 'badge bg-danger ms-2';
            badge.textContent = count;
            wishlistLink.appendChild(badge);
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.wishlist-notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `wishlist-notification alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border: none;
        border-radius: 10px;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fa-solid fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
            ${message}
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Initialize wishlist functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing wishlist functionality...');
    
    // Add event listeners to all wishlist buttons
    const wishlistButtons = document.querySelectorAll('.wishlist-btn');
    console.log('Found wishlist buttons:', wishlistButtons.length);
    
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const listingId = this.getAttribute('data-listing-id');
            console.log('Wishlist button clicked for listing:', listingId);
            window.toggleWishlist(listingId, this);
        });
    });
    
    // Also handle clicks on heart icons directly
    const heartIcons = document.querySelectorAll('.wishlist-btn i');
    heartIcons.forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const button = this.closest('.wishlist-btn');
            if (button) {
                const listingId = button.getAttribute('data-listing-id');
                console.log('Heart icon clicked for listing:', listingId);
                window.toggleWishlist(listingId, button);
            }
        });
    });
});

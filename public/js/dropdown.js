// Simple dropdown functionality to ensure it works everywhere
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up dropdown functionality...');

    // Find all dropdown toggles
    const dropdownToggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');

    dropdownToggles.forEach(toggle => {
        // Ensure Bootstrap dropdown is properly initialized
        if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
            new bootstrap.Dropdown(toggle);
        }

        // Add additional click handler for reliability
        toggle.addEventListener('click', function(e) {
            const target = toggle.getAttribute('data-bs-target') || toggle.nextElementSibling;
            const dropdown = document.querySelector(target);

            if (dropdown) {
                // Toggle visibility
                const isShown = dropdown.classList.contains('show');
                if (isShown) {
                    dropdown.classList.remove('show');
                    toggle.setAttribute('aria-expanded', 'false');
                } else {
                    // Close other dropdowns first
                    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                        menu.classList.remove('show');
                        const btn = menu.previousElementSibling;
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    });

                    dropdown.classList.add('show');
                    toggle.setAttribute('aria-expanded', 'true');
                }
            }
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
                const btn = menu.previousElementSibling;
                if (btn && btn.hasAttribute('data-bs-toggle')) {
                    btn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });

    console.log('Dropdown functionality initialized');
});

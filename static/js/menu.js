// Hamburger Menu JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - try multiple selectors to be more flexible
    const menuButton = document.getElementById('menuToggle') || document.querySelector('button.md\\:hidden');
    let mobileMenu = document.getElementById('mobileMenu');
    
    // If no mobile menu exists, check if we need to create one
    if (!mobileMenu) {
        // Look for hamburger-menu class
        mobileMenu = document.querySelector('.hamburger-menu');
        
        // If still no menu found, create one
        if (!mobileMenu) {
            createMobileMenu();
            mobileMenu = document.querySelector('.hamburger-menu');
        }
    }
    
    // Set up event listeners
    if (menuButton && mobileMenu) {
        // Toggle menu on button click
        menuButton.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Handle different menu styles
            if (mobileMenu.classList.contains('hidden')) {
                // For hidden class style
                mobileMenu.classList.toggle('hidden');
            } else {
                // For display:none style with active class
                mobileMenu.classList.toggle('active');
            }
            
            // Prevent the click from propagating to the document
            event.stopPropagation();
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (mobileMenu && 
                !mobileMenu.contains(event.target) && 
                !menuButton.contains(event.target)) {
                
                // Handle different menu styles
                if (mobileMenu.classList.contains('hidden') === false) {
                    mobileMenu.classList.add('hidden');
                } else if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                }
            }
        });
    }
    
    function createMobileMenu() {
        // Create the mobile menu container
        const menuContainer = document.createElement('div');
        menuContainer.className = 'hamburger-menu';
        
        // Add contact link only
        const contactLink = document.createElement('a');
        contactLink.href = '/contact';
        contactLink.textContent = 'Contacts';
        
        // Append elements
        menuContainer.appendChild(contactLink);
        document.body.appendChild(menuContainer);
    }
});

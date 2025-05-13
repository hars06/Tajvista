// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const contactForm = document.getElementById('contactForm');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    
    // Initialize the page
    initPage();
    
    // Initialize the contact page
    function initPage() {
        // Set up event listeners
        setupEventListeners();
        
        // Initialize smooth scroll
        initSmoothScroll();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Form submission
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);
        }
        
        // Input validation
        if (nameInput) {
            nameInput.addEventListener('blur', validateName);
        }
        
        if (emailInput) {
            emailInput.addEventListener('blur', validateEmail);
        }
        
        if (messageInput) {
            messageInput.addEventListener('blur', validateMessage);
        }
        
        // Mobile menu toggle
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', toggleMobileMenu);
        }
    }
    
    // Handle form submission
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const isNameValid = validateName();
        const isEmailValid = validateEmail();
        const isMessageValid = validateMessage();
        
        // If all fields are valid, submit the form
        if (isNameValid && isEmailValid && isMessageValid) {
            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Send form data to server
            fetch('/contact', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                
                if (data.success) {
                    // Show success message
                    showSuccessMessage();
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(data.error || 'There was a problem sending your message. Please try again.');
                }
            })
            .catch(error => {
                // Reset button state
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
                
                // Show error message
                showErrorMessage('Network error. Please check your connection and try again.');
                console.error('Error:', error);
            });
        }
    }
    
    // Validate name field
    function validateName() {
        const name = nameInput.value.trim();
        
        if (name === '') {
            showError(nameInput, nameError, 'Please enter your name');
            return false;
        }
        
        if (name.length < 2) {
            showError(nameInput, nameError, 'Name must be at least 2 characters');
            return false;
        }
        
        hideError(nameInput, nameError);
        return true;
    }
    
    // Validate email field
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            showError(emailInput, emailError, 'Please enter your email');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            showError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        }
        
        hideError(emailInput, emailError);
        return true;
    }
    
    // Validate message field
    function validateMessage() {
        const message = messageInput.value.trim();
        
        if (message === '') {
            showError(messageInput, messageError, 'Please enter your message');
            return false;
        }
        
        if (message.length < 10) {
            showError(messageInput, messageError, 'Message must be at least 10 characters');
            return false;
        }
        
        hideError(messageInput, messageError);
        return true;
    }
    
    // Show error message for a field
    function showError(input, errorElement, message) {
        input.classList.add('border-red-500');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
    }
    
    // Hide error message for a field
    function hideError(input, errorElement) {
        input.classList.remove('border-red-500');
        errorElement.textContent = '';
        errorElement.classList.add('hidden');
    }
    
    // Show success message
    function showSuccessMessage() {
        // Hide the form
        contactForm.classList.add('hidden');
        
        // Show success message
        successMessage.classList.remove('hidden');
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Show error message
    function showErrorMessage(message) {
        // Show error message
        errorMessage.classList.remove('hidden');
        errorMessage.querySelector('p').textContent = message;
        
        // Scroll to error message
        errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorMessage.classList.add('hidden');
        }, 5000);
    }
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        mobileMenu.classList.toggle('hidden');
        
        // Update aria-expanded attribute
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    }
    
    // Initialize smooth scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if user prefers reduced motion
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                const targetId = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    if (!mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                    
                    if (prefersReducedMotion) {
                        // Jump directly to the element if user prefers reduced motion
                        window.scrollTo(0, targetElement.offsetTop - 80);
                    } else {
                        // Smooth scroll to the element
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }
});
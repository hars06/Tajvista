// Booking.js - Handles the booking form functionality

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const step1Form = document.getElementById('step1Form');
    const step2Form = document.getElementById('step2Form');
    const travellerForm = document.getElementById('travellerForm');
    const continueToPayment = document.getElementById('continueToPayment');
    const backToInfo = document.getElementById('backToInfo');
    const completeBooking = document.getElementById('completeBooking');
    const paymentTabs = document.querySelectorAll('.payment-tab');
    const paymentPanels = document.querySelectorAll('.payment-panel');
    const termsCheckbox = document.getElementById('terms');
    
    // Progress indicators
    const step1Indicator = document.querySelector('.step-indicator:nth-child(1)');
    const step2Indicator = document.querySelector('.step-indicator:nth-child(3)');
    const stepConnector = document.querySelector('.step-connector');
    
    // Initialize Stripe Elements
    let stripe, elements, card;
    
    // CSRF token
    let csrfToken = '';
    
    // Booking data
    let bookingData = {};
    
    // Initialize the page
    initPage();
    
    // Initialize the booking page
    function initPage() {
        // Fetch CSRF token
        fetchCsrfToken();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize Stripe if it exists
        if (typeof Stripe !== 'undefined') {
            initializeStripe();
        }
        
        // Initialize country dropdown
        populateCountries();
        
        // Initialize phone input mask
        initPhoneInputMask();
        
        // Start countdown timer
        startCountdown();
        
        // Track page view for analytics
        trackEvent('page_view', { page: 'booking' });
    }
    
    // Fetch CSRF token from the server
    function fetchCsrfToken() {
        fetch('/api/csrf-token')
            .then(response => response.json())
            .then(data => {
                csrfToken = data.csrf_token;
            })
            .catch(error => {
                console.error('Error fetching CSRF token:', error);
            });
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Form submission
        travellerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateStep1Form()) {
                // Store form data
                const formData = new FormData(travellerForm);
                bookingData = Object.fromEntries(formData.entries());
                
                goToStep2();
                trackEvent('booking_step1_complete', { 
                    tour_type: document.getElementById('tourType').textContent
                });
            }
        });
        
        // Back button
        backToInfo.addEventListener('click', function() {
            goToStep1();
        });
        
        // Complete booking button
        completeBooking.addEventListener('click', function() {
            if (validateStep2Form()) {
                processBooking();
            }
        });
        
        // Payment method tabs
        paymentTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                switchPaymentTab(tabId);
                // Store payment method
                bookingData.paymentMethod = tabId;
                trackEvent('payment_method_change', { method: tabId });
            });
        });
        
        // CTA button tracking
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', function() {
                if (this.id === 'continueToPayment' || this.id === 'completeBooking') {
                    trackEvent('cta_click', { button_id: this.id });
                }
            });
        });
    }
    
    // Process the booking
    function processBooking() {
        // Show loading state
        completeBooking.disabled = true;
        completeBooking.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        
        // Submit booking data to server
        fetch('/api/submit-booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(bookingData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Store booking ID
                bookingData.bookingId = data.bookingId;
                
                // If card payment selected, process payment
                const activePanel = document.querySelector('.payment-panel.active');
                if (activePanel.id === 'cardPayment') {
                    processCardPayment();
                } else {
                    // For other payment methods, show confirmation
                    showBookingConfirmation();
                }
            } else {
                // Show error
                showError(data.error || 'Error submitting booking. Please try again.');
                completeBooking.disabled = false;
                completeBooking.innerHTML = 'Complete Booking';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Network error. Please check your connection and try again.');
            completeBooking.disabled = false;
            completeBooking.innerHTML = 'Complete Booking';
        });
    }
    
    // Process card payment
    function processCardPayment() {
        // Create payment intent
        fetch('/api/payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                bookingId: bookingData.bookingId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Confirm card payment
                stripe.confirmCardPayment(data.clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: bookingData.fullName,
                            email: bookingData.email
                        }
                    }
                }).then(function(result) {
                    if (result.error) {
                        // Show error
                        showError(result.error.message);
                        completeBooking.disabled = false;
                        completeBooking.innerHTML = 'Pay $100 Deposit';
                    } else {
                        // Payment succeeded
                        showBookingConfirmation();
                    }
                });
            } else {
                showError(data.error || 'Error processing payment. Please try again.');
                completeBooking.disabled = false;
                completeBooking.innerHTML = 'Pay $100 Deposit';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Network error. Please check your connection and try again.');
            completeBooking.disabled = false;
            completeBooking.innerHTML = 'Pay $100 Deposit';
        });
    }
    
    // Show booking confirmation
    function showBookingConfirmation() {
        // Hide form
        document.querySelector('.bg-white.rounded-xl.shadow-md').innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <i class="fas fa-check text-green-500 text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-blue-600 mb-4">Booking Confirmed!</h2>
                <p class="text-gray-600 mb-6">Thank you for booking with TajikTours. Your booking reference is: <strong>${bookingData.bookingId}</strong></p>
                <p class="text-gray-600 mb-8">We've sent a confirmation email to <strong>${bookingData.email}</strong> with all the details.</p>
                <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
                    Return to Homepage
                </a>
            </div>
        `;
    }
    
    // Show error message
    function showError(message) {
        const errorDiv = document.getElementById('card-errors');
        errorDiv.textContent = message;
        errorDiv.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Validate Step 1 Form
    function validateStep1Form() {
        let isValid = true;
        const requiredFields = travellerForm.querySelectorAll('[required]');
        
        // Remove existing error messages
        document.querySelectorAll('.form-error').forEach(el => el.remove());
        
        // Check each required field
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                showFieldError(field, 'This field is required');
            } else if (field.type === 'email' && !isValidEmail(field.value)) {
                isValid = false;
                showFieldError(field, 'Please enter a valid email address');
            } else if (field.id === 'phone' && !isValidPhone(field.value)) {
                isValid = false;
                showFieldError(field, 'Please enter a valid phone number');
            } else if (field.id === 'dateOfBirth' && !isValidAge(field.value)) {
                isValid = false;
                showFieldError(field, 'You must be at least 18 years old');
            }
        });
        
        return isValid;
    }
    
    // Validate Step 2 Form
    function validateStep2Form() {
        if (!termsCheckbox.checked) {
            alert('Please agree to the Terms & Conditions to continue');
            return false;
        }
        
        // If card payment is selected, validate card details
        const activePanel = document.querySelector('.payment-panel.active');
        if (activePanel.id === 'cardPayment') {
            // Stripe validation happens in the processBooking function
        }
        
        return true;
    }
    
    // Show field error message
    function showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.classList.add('border-red-500');
    }
    
    // Email validation
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Phone validation
    function isValidPhone(phone) {
        // Basic validation - can be enhanced based on requirements
        return phone.replace(/\D/g, '').length >= 10;
    }
    
    // Age validation (18+)
    function isValidAge(dateString) {
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age >= 18;
    }
    
    // Go to step 2
    function goToStep2() {
        step1Form.classList.remove('active');
        step2Form.classList.add('active');
        step1Indicator.classList.add('completed');
        step2Indicator.classList.add('active');
        stepConnector.classList.add('active');
        
        // Scroll to top of form
        step2Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Go back to step 1
    function goToStep1() {
        step2Form.classList.remove('active');
        step1Form.classList.add('active');
        step2Indicator.classList.remove('active');
        stepConnector.classList.remove('active');
        
        // Scroll to top of form
        step1Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Switch between payment tabs
    function switchPaymentTab(tabId) {
        // Update tab active states
        paymentTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tabId) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        // Update panel active states
        paymentPanels.forEach(panel => {
            if (panel.id === tabId + 'Payment') {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        // Update button text based on payment method
        if (tabId === 'card') {
            completeBooking.textContent = 'Pay $100 Deposit';
        } else if (tabId === 'bank') {
            completeBooking.textContent = 'Confirm Booking';
        } else if (tabId === 'arrival') {
            completeBooking.textContent = 'Reserve Your Spot';
        }
    }
    
    // Initialize Stripe Elements
    function initializeStripe() {
        stripe = Stripe('pk_test_sample_key'); // Replace with your actual publishable key
        elements = stripe.elements();
        
        // Create card element
        card = elements.create('card', {
            style: {
                base: {
                    color: '#32325d',
                    fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                    fontSmoothing: 'antialiased',
                    fontSize: '16px',
                    '::placeholder': {
                        color: '#aab7c4'
                    }
                },
                invalid: {
                    color: '#ef4444',
                    iconColor: '#ef4444'
                }
            }
        });
        
        // Mount the card element
        card.mount('#card-element');
        
        // Handle real-time validation errors
        card.addEventListener('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }
    
    // Process the booking
    function processBooking() {
        // Show loading state
        completeBooking.disabled = true;
        completeBooking.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        
        // Get active payment method
        const activePanel = document.querySelector('.payment-panel.active');
        const paymentMethod = activePanel.id.replace('Payment', '');
        
        // Collect form data
        const bookingData = collectFormData();
        
        if (paymentMethod === 'card') {
            // Process card payment with Stripe
            processCardPayment(bookingData);
        } else {
            // Process other payment methods
            submitBooking(bookingData, paymentMethod);
        }
    }
    
    // Process card payment with Stripe
    function processCardPayment(bookingData) {
        stripe.createToken(card).then(function(result) {
            if (result.error) {
                // Show error in the form
                const errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error.message;
                
                // Reset button state
                completeBooking.disabled = false;
                completeBooking.innerHTML = 'Pay $100 Deposit';
            } else {
                // Send token to your server
                bookingData.paymentToken = result.token.id;
                submitBooking(bookingData, 'card');
            }
        });
    }
    
    // Submit booking to server
    function submitBooking(bookingData, paymentMethod) {
        // In a real application, this would be an AJAX call to your server
        console.log('Submitting booking with payment method:', paymentMethod);
        console.log('Booking data:', bookingData);
        
        // Simulate server response
        setTimeout(function() {
            // Show success message
            showBookingConfirmation(paymentMethod);
            
            // Track conversion
            trackEvent('booking_complete', { 
                payment_method: paymentMethod,
                booking_value: 1200
            });
        }, 2000);
    }
    
    // Collect form data
    function collectFormData() {
        return {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            passportNumber: document.getElementById('passportNumber').value,
            nationality: document.getElementById('nationality').value,
            dateOfBirth: document.getElementById('dateOfBirth').value,
            specialRequests: document.getElementById('specialRequests').value,
            tourType: document.getElementById('tourType').textContent,
            departureDate: document.getElementById('departureDate').textContent
        };
    }
    
    // Show booking confirmation
    function showBookingConfirmation(paymentMethod) {
        // Hide the form
        step2Form.innerHTML = `
            <div class="text-center py-8">
                <div class="inline-block p-4 rounded-full bg-green-100 text-green-600 mb-4">
                    <i class="fas fa-check-circle text-4xl"></i>
                </div>
                <h2 class="text-2xl font-bold text-blue-600 mb-4">Booking Confirmed!</h2>
                <p class="text-gray-600 mb-6">Thank you for booking your Tajikistan adventure with us.</p>
                ${getPaymentMethodMessage(paymentMethod)}
                <p class="text-gray-600 mt-6">A confirmation email has been sent to your email address.</p>
                <div class="mt-8">
                    <a href="/" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">
                        Return to Homepage
                    </a>
                </div>
            </div>
        `;
    }
    
    // Get payment method specific message
    function getPaymentMethodMessage(paymentMethod) {
        if (paymentMethod === 'card') {
            return `<p class="text-gray-600">Your payment of $100 has been processed successfully.</p>`;
        } else if (paymentMethod === 'bank') {
            return `<p class="text-gray-600">Please complete your bank transfer within 48 hours to secure your booking.</p>`;
        } else if (paymentMethod === 'arrival') {
            return `<p class="text-gray-600">Your spot has been reserved. Full payment will be collected upon arrival.</p>`;
        }
        return '';
    }
    
    // Populate countries dropdown
    function populateCountries() {
        const countrySelect = document.getElementById('nationality');
        const countries = [
            "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
            "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
            "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
            "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
            "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
            "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
            "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
            "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
            "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kosovo",
            "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
            "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
            "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
            "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Macedonia", "Norway", "Oman",
            "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
            "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
            "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
            "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
            "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
            "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City",
            "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
        ];
        
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }
    
    // Initialize phone input mask
    function initPhoneInputMask() {
        const phoneInput = document.getElementById('phone');
        
        phoneInput.addEventListener('input', function(e) {
            // Get only digits from the input
            let digits = this.value.replace(/\D/g, '');
            
            // Format the phone number
            if (digits.length > 0) {
                // Add + at the beginning
                let formatted = '+';
                
                // Format the rest based on length
                if (digits.length <= 3) {
                    formatted += digits;
                } else if (digits.length <= 6) {
                    formatted += digits.substring(0, 3) + ' ' + digits.substring(3);
                } else if (digits.length <= 10) {
                    formatted += digits.substring(0, 3) + ' ' + digits.substring(3, 6) + ' ' + digits.substring(6);
                } else {
                    formatted += digits.substring(0, 3) + ' ' + digits.substring(3, 6) + ' ' + digits.substring(6, 10) + ' ' + digits.substring(10);
                }
                
                this.value = formatted;
            }
        });
    }
    
    // Start countdown timer
    function startCountdown() {
        // Initialize and update every minute
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }

    function updateCountdown() {
        // Set the departure date (next month's 15th)
        const now = new Date();
        let departureDate = new Date();
        
        // If today is after the 15th, set to next month's 15th
        if (now.getDate() > 15) {
            departureDate.setMonth(now.getMonth() + 1);
        }
        departureDate.setDate(15);
        departureDate.setHours(0, 0, 0, 0);
        
        // Format date for display
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('departureDate').textContent = departureDate.toLocaleDateString('en-US', options);
        
        // Calculate time remaining
        const diff = departureDate - now;
        
        if (diff <= 0) {
            // If departure date has passed, set to following month
            departureDate.setMonth(departureDate.getMonth() + 1);
            document.getElementById('departureDate').textContent = departureDate.toLocaleDateString('en-US', options);
            const newDiff = departureDate - now;
            updateCountdownDisplay(newDiff);
        } else {
            updateCountdownDisplay(diff);
        }
    }

    function updateCountdownDisplay(diff) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
        document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        
        // If you have seconds in your UI
        if (document.getElementById('countdown-secs')) {
            document.getElementById('countdown-secs').textContent = seconds.toString().padStart(2, '0');
        }
    }
    
    // Analytics tracking function
    function trackEvent(eventName, eventData) {
        // In a real application, this would send data to your analytics platform
        console.log('TRACKING EVENT:', eventName, eventData);
        
        // Example implementation for Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventData);
        }
    }
});
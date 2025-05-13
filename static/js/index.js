// KPI Analytics Hook
        document.getElementById('ctaButton').addEventListener('click', function() {
            // Dispatch analytics event
            console.log('CTA click event fired - cta_click');
            // In a real implementation, this would be your analytics tracking code
            // Example: dataLayer.push({'event': 'cta_click'});
            
            // Redirect to booking page
            window.location.href = '/booking';
        });

        // Carousel Functionality
        const carouselTrack = document.querySelector('.carousel-track');
        const carouselSlides = document.querySelectorAll('.carousel-slide');
        const carouselIndicators = document.querySelectorAll('.carousel-indicator');
        const prevButton = document.querySelector('.carousel-prev');
        const nextButton = document.querySelector('.carousel-next');
        
        let currentIndex = 0;
        const slideCount = carouselSlides.length;
        
        function updateCarousel() {
            carouselTrack.style.transform = `translateX(-${currentIndex * 100}%)`;
            
            // Update indicators
            carouselIndicators.forEach((indicator, index) => {
                if (index === currentIndex) {
                    indicator.classList.add('bg-blue-600');
                    indicator.classList.remove('bg-blue-200');
                } else {
                    indicator.classList.add('bg-blue-200');
                    indicator.classList.remove('bg-blue-600');
                }
            });
        }
        
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }
        
        function nextSlide() {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarousel();
        }
        
        function prevSlide() {
            currentIndex = (currentIndex - 1 + slideCount) % slideCount;
            updateCarousel();
        }
        
        // Set up event listeners
        nextButton.addEventListener('click', nextSlide);
        prevButton.addEventListener('click', prevSlide);
        
        carouselIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Auto-advance carousel (optional)
        let carouselInterval = setInterval(nextSlide, 5000);
        
        // Pause auto-advance on hover
        const carouselContainer = document.querySelector('.carousel-container');
        carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
        carouselContainer.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(nextSlide, 5000);
        });

        // Testimonial Slider Functionality
        const testimonialTrack = document.querySelector('.testimonial-track');
        const testimonialSlides = document.querySelectorAll('.testimonial-slide');
        const testimonialIndicators = document.querySelectorAll('.testimonial-indicator');
        
        let testimonialIndex = 0;
        const testimonialCount = testimonialSlides.length;
        
        function updateTestimonialSlider() {
            testimonialTrack.style.transform = `translateX(-${testimonialIndex * 100}%)`;
            
            // Update indicators
            testimonialIndicators.forEach((indicator, index) => {
                if (index === testimonialIndex) {
                    indicator.classList.add('bg-blue-600');
                    indicator.classList.remove('bg-blue-200');
                } else {
                    indicator.classList.add('bg-blue-200');
                    indicator.classList.remove('bg-blue-600');
                }
            });
        }
        
        function goToTestimonial(index) {
            testimonialIndex = index;
            updateTestimonialSlider();
        }
        
        function nextTestimonial() {
            testimonialIndex = (testimonialIndex + 1) % testimonialCount;
            updateTestimonialSlider();
        }
        
        // Auto-advance testimonials
        setInterval(nextTestimonial, 7000);
        
        // Set up event listeners for testimonial indicators
        testimonialIndicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToTestimonial(index));
        });

        // Countdown Timer
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
            
            document.getElementById('countdown-days').textContent = days.toString().padStart(2, '0');
            document.getElementById('countdown-hours').textContent = hours.toString().padStart(2, '0');
            document.getElementById('countdown-minutes').textContent = minutes.toString().padStart(2, '0');
        }
        
        // Initialize and update every minute
        updateCountdown();
        setInterval(updateCountdown, 60000);

        // Tour Option Selection
        const tourOptions = document.querySelectorAll('.tour-option');
        tourOptions.forEach(option => {
            option.addEventListener('click', function() {
                tourOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Mobile Menu Toggle (would need additional CSS for the menu)
        const mobileMenuButton = document.querySelector('button.md\\:hidden');
        mobileMenuButton.addEventListener('click', function() {
            // In a full implementation, this would toggle a mobile menu
            console.log('Mobile menu clicked');
        });
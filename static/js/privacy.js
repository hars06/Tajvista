// Privacy Policy Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
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
                
                // Update URL hash without scrolling
                history.pushState(null, null, targetId);
            }
        });
    });
    
    // Mobile menu toggle
    const menuButton = document.querySelector('button.md\\:hidden');
    const mobileMenu = document.querySelector('.md\\:flex.space-x-8');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function() {
            // Toggle mobile menu visibility
            if (mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.remove('hidden');
                mobileMenu.classList.add('flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-white', 'shadow-md', 'p-4', 'space-y-4', 'space-x-0');
                menuButton.setAttribute('aria-expanded', 'true');
            } else {
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('flex', 'flex-col', 'absolute', 'top-16', 'left-0', 'right-0', 'bg-white', 'shadow-md', 'p-4', 'space-y-4', 'space-x-0');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Highlight current section in table of contents
    const observeSection = () => {
        const sections = document.querySelectorAll('.privacy-content section');
        const tocLinks = document.querySelectorAll('.privacy-content nav a');
        
        // Create an Intersection Observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Get the id of the section that is currently visible
                    const id = entry.target.getAttribute('id');
                    
                    // Remove active class from all TOC links
                    tocLinks.forEach(link => {
                        link.classList.remove('font-bold');
                    });
                    
                    // Add active class to the corresponding TOC link
                    const activeLink = document.querySelector(`a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('font-bold');
                    }
                }
            });
        }, { rootMargin: '-100px 0px -80% 0px' });
        
        // Observe each section
        sections.forEach(section => {
            observer.observe(section);
        });
    };
    
    // Initialize section highlighting if IntersectionObserver is supported
    if ('IntersectionObserver' in window) {
        observeSection();
    }
    
    // Add current year to copyright notice
    const copyrightYear = document.querySelector('footer p');
    if (copyrightYear) {
        const currentYear = new Date().getFullYear();
        copyrightYear.textContent = copyrightYear.textContent.replace('2023', currentYear);
    }
});
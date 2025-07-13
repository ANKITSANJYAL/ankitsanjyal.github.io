document.addEventListener('DOMContentLoaded', function () {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile navigation toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('#navbar ul');

    hamburger.addEventListener('click', function () {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('#navbar ul li a').forEach(link => {
        link.addEventListener('click', function () {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Sticky navbar on scroll
    window.addEventListener('scroll', function () {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.08)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Submit to Formspree
            fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    formMessage.textContent = 'Thank you for your message! I will get back to you soon.';
                    formMessage.classList.add('success');
                    formMessage.style.display = 'block';
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            })
            .catch(error => {
                formMessage.textContent = 'Sorry, there was an error sending your message. Please try again or email me directly at asanjyal82@gmail.com';
                formMessage.classList.add('error');
                formMessage.style.display = 'block';
            })
            .finally(() => {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;

                // Hide message after 8 seconds
                setTimeout(() => {
                    formMessage.style.display = 'none';
                    formMessage.classList.remove('success', 'error');
                }, 8000);
            });
        });
    }

    // Research and project card animations
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.research-card, .project-card');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;

            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Set initial state for animation
    document.querySelectorAll('.research-card, .project-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Run animation on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
});
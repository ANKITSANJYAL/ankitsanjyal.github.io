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
    document.getElementById('contact-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const messageDiv = document.getElementById('form-message');

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
            .then(response => {
                if (response.ok) {
                    messageDiv.textContent = 'Message sent successfully!';
                    messageDiv.style.color = '#4CAF50';
                    messageDiv.style.display = 'block';
                    form.reset();

                    // Hide message after 5 seconds
                    setTimeout(() => {
                        messageDiv.style.display = 'none';
                    }, 5000);
                } else {
                    throw new Error('Failed to send message');
                }
            })
            .catch(error => {
                messageDiv.textContent = 'Error: ' + error.message;
                messageDiv.style.color = '#f44336';
                messageDiv.style.display = 'block';
            });
    });
    // Sticky navbar on scroll
    window.addEventListener('scroll', function () {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 100) {
            navbar.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
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

            // Here you would typically send the form data to a server
            // For demonstration, we'll just show a success message
            formMessage.textContent = 'Thank you for your message! I will get back to you soon.';
            formMessage.classList.add('success');
            formMessage.style.display = 'block';

            // Reset form
            contactForm.reset();

            // Hide message after 5 seconds
            setTimeout(() => {
                formMessage.style.display = 'none';
                formMessage.classList.remove('success');
            }, 5000);
        });
    }

    // Project and blog card animations
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.project-card, .blog-card');

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
    document.querySelectorAll('.project-card, .blog-card').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Run animation on load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
});
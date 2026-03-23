// Modern Portfolio - JavaScript Interactions
document.addEventListener('DOMContentLoaded', function() {

    // ===== Year Footer =====
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ===== Navbar Scroll Effect =====
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // ===== Active Navigation Link =====
    const sections = document.querySelectorAll('.section, .hero');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // ===== Smooth Scroll for Navigation Links =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===== Mobile Menu Toggle =====
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');

            // Animate hamburger icon
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(10px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.navbar')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');

                const spans = mobileToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    // ===== Project Filtering =====
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filterValue = button.getAttribute('data-filter');

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects with animation
            projectCards.forEach((card, index) => {
                const categories = card.getAttribute('data-category');

                setTimeout(() => {
                    if (filterValue === 'all' || !categories) {
                        card.classList.remove('hidden');
                        card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    } else if (categories && categories.includes(filterValue)) {
                        card.classList.remove('hidden');
                        card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    } else {
                        card.classList.add('hidden');
                    }
                }, index * 50);
            });
        });
    });

    // ===== Intersection Observer for Fade-in Animations =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.research-card, .project-card, .expertise-item, .contact-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });

    // ===== Form Submission Handler =====
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;

            // Update button state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Success
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                    contactForm.reset();

                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Error
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error. Try again.';

                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    }

    // ===== Parallax Effect for Hero Section =====
    const heroParticles = document.querySelector('.hero-particles');

    if (heroParticles) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.5;
            heroParticles.style.transform = `translateY(${rate}px)`;
        });
    }

    // ===== Add hover effect sound (optional) =====
    const interactiveElements = document.querySelectorAll('.btn-primary, .btn-secondary, .filter-btn, .social-icon');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });

    // ===== Typing Effect for Hero Title (optional enhancement) =====
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;

        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        // Uncomment to enable typing effect
        // typeWriter();
    }

    // ===== Scroll Reveal Animation =====
    const revealElements = document.querySelectorAll('.section-header, .about-content, .info-card');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.8s ease-out ${index * 0.2}s, transform 0.8s ease-out ${index * 0.2}s`;
        revealObserver.observe(el);
    });

    // ===== Tech Badge Hover Effect =====
    const techBadges = document.querySelectorAll('.tech-badge, .tech-tag');

    techBadges.forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.05)';
        });

        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // ===== Image Lazy Loading Enhancement =====
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));

    // ===== Cursor Trail Effect (Optional - Modern Touch) =====
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ===== Console Easter Egg =====
    console.log('%c🚀 Ankit Sanjyal - AI Engineer & ML Researcher', 'font-size: 20px; color: #6366f1; font-weight: bold;');
    console.log('%cInterested in my work? Let\'s connect!', 'font-size: 14px; color: #9ca3af;');
    console.log('%c📧 asanjyal82@gmail.com', 'font-size: 12px; color: #10b981;');
    console.log('%c🔗 https://linkedin.com/in/ankit-sanjyal', 'font-size: 12px; color: #10b981;');

    // ===== Performance Optimization =====
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(() => {
            // Scroll-related operations
        });
    });

    // ===== Keyboard Navigation Enhancement =====
    document.addEventListener('keydown', (e) => {
        // ESC key closes mobile menu
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (mobileToggle) {
                mobileToggle.classList.remove('active');
            }
        }
    });

    // ===== Initialize all animations =====
    function init() {
        // Add loaded class to body for CSS animations
        document.body.classList.add('loaded');

        // Trigger initial animations
        window.dispatchEvent(new Event('scroll'));
    }

    // Run initialization
    init();

    console.log('%c✨ Portfolio loaded successfully!', 'font-size: 12px; color: #8b5cf6; font-weight: bold;');
});

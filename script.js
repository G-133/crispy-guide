// ===========================
// Smooth Scroll & Navigation
// ===========================

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            if (mobileMenuToggle) {
                mobileMenuToggle.classList.remove('active');
            }
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ===========================
    // Active Navigation on Scroll
    // ===========================

    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 100;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // ===========================
    // Navbar Scroll Effect
    // ===========================

    const navbar = document.querySelector('.navbar');
    
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleNavbarScroll);

    // ===========================
    // Scroll Animations (Intersection Observer)
    // ===========================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe portfolio items
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(item);
    });

    // Observe service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe stats
    const stats = document.querySelectorAll('.stat-item');
    stats.forEach((stat, index) => {
        stat.style.opacity = '0';
        stat.style.transform = 'scale(0.8)';
        stat.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.15}s`;
        observer.observe(stat);
    });

    // ===========================
    // Counter Animation for Stats
    // ===========================

    function animateCounter(element, target, duration) {
        let start = 0;
        const increment = target / (duration / 16);
        const isPercent = target === 98;
        const isPlus = element.textContent.includes('+');
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (isPercent ? '%' : isPlus ? '+' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (isPercent ? '%' : isPlus ? '+' : '');
            }
        }, 16);
    }

    const statObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                const number = entry.target.querySelector('.stat-number');
                const text = number.textContent;
                const value = parseInt(text.replace(/\D/g, ''));
                
                entry.target.classList.add('counted');
                animateCounter(number, value, 2000);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statObserver.observe(stat);
    });

    // ===========================
    // Form Handling
    // ===========================

    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const messageEl = document.getElementById('message');
            const message = messageEl ? messageEl.value.trim() : '';
            
            // Simple validation
            if (!name || !email) {
                showNotification('Пожалуйста, укажите имя и email', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Пожалуйста, введите корректный email', 'error');
                return;
            }

            const endpoint = contactForm.getAttribute('action');
            if (!endpoint || !endpoint.includes('formspree.io')) {
                showNotification('Форма не настроена: укажите ваш Formspree ID в атрибуте action формы.', 'error');
                return;
            }

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Отправка...';
                }

                const formData = new FormData(contactForm);

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });

                if (response.ok) {
                    // Save request to admin panel
                    const request = {
                        type: 'contactFormSubmit',
                        name: name,
                        email: email,
                        phone: phone || '',
                        message: message
                    };
                    
                    // Send message to admin panel (if window is available)
                    if (window.parent && window.parent.postMessage) {
                        window.parent.postMessage(request, '*');
                    }
                    
                    // Store in localStorage for admin panel
                    try {
                        const requests = JSON.parse(localStorage.getItem('contactRequests') || '[]');
                        requests.unshift({
                            id: Date.now(),
                            date: new Date().toLocaleDateString('ru-RU'),
                            name: name,
                            email: email,
                            phone: phone || '',
                            message: message || '',
                            isNew: true
                        });
                        localStorage.setItem('contactRequests', JSON.stringify(requests));
                    } catch (e) {
                        console.log('Could not save to localStorage:', e);
                    }
                    
                    showNotification('Спасибо! Мы свяжемся с вами в ближайшее время', 'success');
                    contactForm.reset();
                } else {
                    const data = await response.json().catch(() => null);
                    const errorMsg = data && data.errors && data.errors.length
                        ? data.errors.map(e => e.message).join(', ')
                        : 'Произошла ошибка при отправке. Попробуйте позже';
                    showNotification(errorMsg, 'error');
                }
            } catch (err) {
                showNotification('Сетевая ошибка. Проверьте соединение и попробуйте снова', 'error');
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Отправить заявку';
                }
            }
        });
    }

    // Email validation
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Notification system
    function showNotification(message, type = 'success') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            font-weight: 500;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===========================
    // Portfolio Item Click Effect
    // ===========================

    portfolioItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add a pulse effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
            
            // You can add modal or redirect functionality here
            // For example:
            // showProjectModal(this);
        });
    });

    // ===========================
    // Parallax Effect for Hero
    // ===========================

    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            
            if (scrolled < window.innerHeight) {
                heroVisual.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
            }
        });
    }

    // ===========================
    // Lazy Loading for Images (if you add real images)
    // ===========================

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }


    // ===========================
    // Console Message (Easter Egg)
    // ===========================

    console.log('%c👋 Привет, разработчик!', 'color: #6366f1; font-size: 20px; font-weight: bold;');
    console.log('%cЕсли ты видишь это сообщение, возможно, ты ищешь работу? 😉', 'color: #64748b; font-size: 14px;');
    console.log('%cСвяжись с нами: hello@webstudio.com', 'color: #64748b; font-size: 14px;');
});

// ===========================
// Performance Optimization
// ===========================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for resize events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


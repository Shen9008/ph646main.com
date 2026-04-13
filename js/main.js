// PH646 (ph646main.com) — site JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle (event delegation - works after partials load)
    document.body.addEventListener('click', function(e) {
        var toggle = e.target.closest('.mobile-menu-toggle');
        if (!toggle) return;
        var menu = document.querySelector('.mobile-menu');
        if (menu) {
            menu.classList.toggle('active');
            var isOpen = menu.classList.contains('active');
            var use = toggle.querySelector('use');
            if (use) {
                use.setAttribute('href', isOpen ? '#icon-close' : '#icon-menu');
            } else {
                toggle.innerHTML = isOpen ? '<span aria-hidden="true">&times;</span>' : '<span aria-hidden="true">&#9776;</span>';
            }
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    var menu = document.querySelector('.mobile-menu');
                    if (menu && menu.classList.contains('active')) {
                        menu.classList.remove('active');
                        var t = document.querySelector('.mobile-menu-toggle');
                        if (t) {
                            var u = t.querySelector('use');
                            if (u) u.setAttribute('href', '#icon-menu'); else t.innerHTML = '<span>&#9776;</span>';
                        }
                    }
                }
            }
        });
    });

    // Header scroll effect (runs when header exists, e.g. after partials)
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            header.style.background = currentScroll > 100 ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.95)';
        });
    }
    initHeaderScroll();

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => {
        el.style.opacity = '0';
        observer.observe(el);
    });

    // Game card hover effects
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Table of Contents smooth scroll (for news/blog articles)
    document.querySelectorAll('.toc__link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form validation (if forms exist)
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
            }
        });
    });

    // Odds button click handler (for sports betting)
    document.querySelectorAll('.odds-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.odds-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Lazy loading images
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
    }

    // Optional: Load page-specific banner content from config/banners.json
    (function() {
        var page = document.body.getAttribute('data-page') || 'index';
        var bannerKey = { 'slots': 'slots', 'live-casino': 'live', 'sports-betting': 'sports' }[page] || 'main';
        var base = (window.location.pathname || '').indexOf('news') !== -1 ? '../' : '';
        fetch(base + 'config/banners.json').then(function(r) { return r.json(); }).then(function(config) {
            var b = config[bannerKey] || config.main;
            if (!b) return;
            var title = document.querySelector('.cta-banner__title');
            var subtitle = document.querySelector('.cta-banner__subtitle');
            var btn = document.querySelector('.cta-banner__btn');
            if (title && b.title) title.textContent = b.title;
            if (subtitle && b.subtitle) subtitle.textContent = b.subtitle;
            if (btn && b.ctaText) btn.textContent = b.ctaText;
            if (btn && b.ctaUrl) btn.setAttribute('href', b.ctaUrl);
        }).catch(function() {});
    })();

    console.log('PH646 initialized');
});

document.addEventListener("DOMContentLoaded", () => {

    // 1. Initialize Lenis (Smooth Scroll)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Custom Cursor (Desktop)
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');

    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            gsap.to(cursor, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.1
            });
            gsap.to(follower, {
                x: e.clientX,
                y: e.clientY,
                duration: 0.5
            });
        });

        const links = document.querySelectorAll('a, button, .course-card');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                gsap.to(cursor, { scale: 0, duration: 0.2 });
                gsap.to(follower, { scale: 2, borderColor: 'var(--accent-color)', duration: 0.2 });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(cursor, { scale: 1, duration: 0.2 });
                gsap.to(follower, { scale: 1, borderColor: 'var(--text-color)', duration: 0.2 });
            });
        });
    }

    // 3. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    // Remove loading class
    document.body.classList.remove('loading');

    // Hero Reveal
    const heroTl = gsap.timeline();

    heroTl.to('.hero-title span', {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.2,
        ease: "power4.out",
        delay: 0.5
    })
        .to('.hero-subtitle', {
            opacity: 1,
            duration: 1,
            ease: "power2.out"
        }, "-=0.5")
        .to('.hero-cta', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        }, "-=0.8");

    // Philosophy Section Text Reveal
    gsap.utils.toArray('.big-text').forEach(text => {
        gsap.from(text, {
            scrollTrigger: {
                trigger: text,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Cards Stagger
    gsap.from('.course-card', {
        scrollTrigger: {
            trigger: '.course-grid',
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
    });

    // Dynamic Background Color Change
    gsap.utils.toArray('[data-bgcolor]').forEach(section => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onEnter: () => gsap.to('body', { backgroundColor: section.dataset.bgcolor, overwrite: 'auto' }),
            onLeaveBack: () => gsap.to('body', { backgroundColor: section.dataset.bgcolor, overwrite: 'auto' })
        });
    });

    // 4. Tutorials Filtering (New)
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tutorialCards = document.querySelectorAll('.tutorial-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                // Animate Cards
                tutorialCards.forEach(card => {
                    const category = card.getAttribute('data-category');

                    if (filterValue === 'all' || mapCategory(filterValue, category)) {
                        gsap.to(card, {
                            scale: 1,
                            opacity: 1,
                            display: 'block',
                            duration: 0.4,
                            ease: "power2.out"
                        });
                    } else {
                        gsap.to(card, {
                            scale: 0.8,
                            opacity: 0,
                            display: 'none',
                            duration: 0.3,
                            ease: "power2.in"
                        });
                    }
                });
            });
        });
    }

    // Helper to map complex logic if needed (simple equality for now)
    function mapCategory(filter, cardCat) {
        return filter === cardCat;
    }

    // 5. Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (menuToggle && mobileOverlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileOverlay.classList.toggle('active');

            if (mobileOverlay.classList.contains('active')) {
                // Open animation
                gsap.to(mobileLinks, {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1,
                    ease: "power3.out",
                    delay: 0.2
                });
                // Optional: Lenis stop
                if (typeof lenis !== 'undefined') lenis.stop();
            } else {
                // Close animation
                gsap.to(mobileLinks, {
                    y: 20,
                    opacity: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: "power3.in"
                });
                if (typeof lenis !== 'undefined') lenis.start();
            }
        });

        // Close on link click
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileOverlay.classList.remove('active');
                if (typeof lenis !== 'undefined') lenis.start();
            });
        });
    }

    // 6. Audio FAB Logic
    const audioFab = document.querySelector('.audio-fab');
    const audio = document.getElementById('demo-audio');
    const playIconFab = document.querySelector('.play-icon-fab');

    if (audioFab && audio) {
        audioFab.addEventListener('click', () => {
            if (audio.paused) {
                audio.play().catch(e => console.log("Audio play failed (user interaction needed):", e));
                audioFab.classList.add('playing');
                if (playIconFab) playIconFab.textContent = '⏸';
            } else {
                audio.pause();
                audioFab.classList.remove('playing');
                if (playIconFab) playIconFab.textContent = '▶';
            }
        });
    }

});

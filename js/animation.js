// ============================================================
// Animations GSAP — test sur la page d'accueil
// Nécessite gsap.min.js + ScrollTrigger.min.js chargés avant ce fichier
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // --- Hero : apparition en cascade au chargement ---
    const heroTargets = [
        '.bismillah',
        '.hero-tag',
        '.hero-title',
        '.hero-devise',
        '.hero-desc',
        '.hero-divider',
        '.hero-text .btn-primary'
    ];
    gsap.set(heroTargets, { opacity: 0, y: 24 });
    gsap.to(heroTargets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15
    });

    // --- Cartes collections / accessoires : apparition au scroll ---
    document.querySelectorAll('.collections-gallery, .accessories-gallery').forEach(gallery => {
        const cards = gallery.querySelectorAll('.collection-card');
        if (!cards.length) return;
        gsap.set(cards, { opacity: 0, y: 30 });
        gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            stagger: 0.15,
            scrollTrigger: {
                trigger: gallery,
                start: 'top 85%'
            }
        });
    });
});
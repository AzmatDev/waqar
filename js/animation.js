// ============================================================
// Animations GSAP 3.15 — page d'accueil
// Charge : gsap.min.js + ScrollTrigger.min.js + SplitText.min.js (avant ce fichier)
//
// Ce script est en bas du <body> : le DOM est déjà prêt, pas de DOMContentLoaded.
// Les blocs .gsap-hidden sont masqués en CSS (html.gsap) pour éviter un flash
// avant l'animation. Si GSAP n'a pas chargé, on retire la classe pour tout
// réafficher normalement.
// ============================================================

(function () {
    const html = document.documentElement;

    // --- Sécurité : GSAP absent (CDN bloqué, hors ligne...) → site normal
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof SplitText === 'undefined') {
        html.classList.remove('gsap');
        return;
    }
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // --- Accessibilité : l'utilisateur a demandé moins d'animations → on affiche tout, sans effet
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        html.classList.remove('gsap');
        return;
    }

    // Filet de sécurité : si les polices mettent trop longtemps, on lance quand même
    let started = false;
    const start = () => { if (!started) { started = true; init(); } };
    document.fonts.ready.then(start);
    setTimeout(start, 2500);

    // Découpe un titre en lignes masquées (chaque ligne "sort" de son cache)
    function splitLines(target) {
        return SplitText.create(target, { type: 'lines', mask: 'lines' });
    }

    function init() {
        // Les blocs vont être pilotés par GSAP : on lève le masque CSS,
        // GSAP a déjà posé l'état initial (opacity 0) sur chaque élément.
        gsap.set('.gsap-hidden', { autoAlpha: 1 });

        // ==========================================================
        // 1. HERO — chorégraphie au chargement
        // ==========================================================
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const titleSplit = splitLines(heroTitle);

            // onComplete : on restaure le HTML d'origine du titre (évite que les masques
            // ne rognent les jambages des lettres comme le "g" une fois l'anim finie)
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => titleSplit.revert() });
            tl.from('nav', { yPercent: -100, autoAlpha: 0, duration: 0.9,
                clearProps: 'transform' }, 0)
                .from('.bismillah',   { autoAlpha: 0, y: 20, duration: 1.1 }, 0.2)
                .from('.hero-tag',    { autoAlpha: 0, y: 14, duration: 0.8 }, '-=0.7')
                .from(titleSplit.lines, { yPercent: 110, duration: 1.3, ease: 'power4.out', stagger: 0.13 }, '-=0.55')
                .from('.hero-devise', { autoAlpha: 0, x: -18, duration: 0.9 }, '-=0.7')
                .from('.hero-desc',   { autoAlpha: 0, y: 16, duration: 0.9 }, '-=0.65')
                .from('.hero-divider',{ scaleX: 0, duration: 0.7, ease: 'power2.inOut' }, '-=0.6')
                .from('.hero-text .btn-primary', { autoAlpha: 0, y: 14, duration: 0.8 }, '-=0.45');
        }

        // ==========================================================
        // 2. TITRES DE SECTION — révélation ligne par ligne au scroll
        // ==========================================================
        document.querySelectorAll('.section-header').forEach(header => {
            const title = header.querySelector('.section-title');
            const sub   = header.querySelector('.section-sub');
            if (!title) return;
            const split = splitLines(title);

            const tl = gsap.timeline({
                scrollTrigger: { trigger: header, start: 'top 85%', once: true },
                onComplete: () => split.revert()
            });
            tl.from(split.lines, { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.1 });
            if (sub) tl.from(sub, { autoAlpha: 0, y: 12, duration: 0.8, ease: 'power3.out' }, '-=0.6');
        });

        // ==========================================================
        // 3. CARTES COLLECTIONS / ACCESSOIRES — entrée + parallax + hover
        // ==========================================================
        document.querySelectorAll('.collections-gallery, .accessories-gallery').forEach(gallery => {
            const cards = gallery.querySelectorAll('.collection-card');
            if (!cards.length) return;

            // Entrée en cascade
            gsap.from(cards, {
                autoAlpha: 0, y: 44, duration: 1.1, ease: 'power3.out', stagger: 0.15,
                scrollTrigger: { trigger: gallery, start: 'top 82%', once: true }
            });

            // Parallax léger sur chaque image + zoom au survol
            gallery.querySelectorAll('.collection-card-img img').forEach(img => {
                img.classList.add('gsap-parallax');
                const frame = img.closest('.collection-card-img');
                const card  = img.closest('.collection-card');
                const BASE  = 1.15;   // légère sur-échelle pour que le parallax ne laisse pas de bord vide

                gsap.set(img, { scale: BASE });
                gsap.fromTo(img, { yPercent: -6 }, {
                    yPercent: 6, ease: 'none',
                    scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true }
                });

                if (card) {
                    card.addEventListener('mouseenter', () => gsap.to(img, { scale: BASE + 0.07, duration: 0.8, ease: 'power2.out' }));
                    card.addEventListener('mouseleave', () => gsap.to(img, { scale: BASE,        duration: 0.8, ease: 'power2.out' }));
                }
            });
        });

        // ==========================================================
        // 4. CONTACT — les 3 colonnes arrivent en cascade
        // ==========================================================
        const contactGrid = document.querySelector('.contact-grid');
        if (contactGrid) {
            gsap.from(contactGrid.querySelectorAll('.contact-col'), {
                autoAlpha: 0, y: 36, duration: 1, ease: 'power3.out', stagger: 0.15,
                scrollTrigger: { trigger: contactGrid, start: 'top 82%', once: true }
            });
        }
    }
})();
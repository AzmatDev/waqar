// ============================================================
// Animations de la page collection (collection.html)
// Nécessite : gsap + ScrollTrigger + SplitText + js/anim-core.js avant.
// Chargé APRÈS js/collection.js : l'en-tête et la grille sont déjà
// rendus quand ce script s'exécute.
//
//  1. Titre de collection révélé ligne par ligne (SplitText).
//  2. Grille produits en cascade — au chargement ET à chaque bascule
//     d'onglet Adulte / Enfant (via MutationObserver, aucun couplage
//     avec collection.js).
//  3. Bloc « Le saviez-vous ? » révélé au scroll.
// ============================================================
(function () {
    var W = window.WAnim;
    if (!W || !W.enabled) return;

    var grid = document.getElementById('products-grid');

    // ---------- 2. Grille en cascade ----------
    function staggerCards() {
        if (!grid) return;
        var cards = grid.querySelectorAll('.product-card');
        if (!cards.length) return;
        // .product-card porte .fade-in (transition CSS opacity/transform) : on la
        // neutralise pour que GSAP pilote seul, sans double animation ni lag.
        cards.forEach(function (c) { c.style.transition = 'none'; });
        gsap.killTweensOf(cards);
        gsap.fromTo(cards,
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', stagger: 0.06, overwrite: 'auto' });
    }

    staggerCards(); // rendu initial

    if (grid) {
        // collection.js remplace grid.innerHTML à chaque changement d'onglet ;
        // on rejoue la cascade dès que les nouvelles cartes sont là.
        var mo = new MutationObserver(function () { staggerCards(); });
        mo.observe(grid, { childList: true });
    }

    // ---------- 1. Titre + sous-titre ----------
    var title = document.querySelector('.collection-hero-title');
    var sub = document.querySelector('.collection-hero-sub');
    var tag = document.querySelector('.collection-hero-tag');
    var meta = document.querySelector('.collection-hero-meta');

    if (title) {
        gsap.set(title, { autoAlpha: 0 });
        if (sub) gsap.set(sub, { autoAlpha: 0, y: 14 });
        if (tag) gsap.set(tag, { autoAlpha: 0, y: 12 });
        if (meta) gsap.set(meta, { autoAlpha: 0, y: 12 });

        W.onReady(function () {
            var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
            if (tag) tl.to(tag, { autoAlpha: 1, y: 0, duration: 0.6 }, 0);

            var split = W.splitLines(title);
            gsap.set(title, { autoAlpha: 1 });
            if (split) {
                tl.from(split.lines, {
                    yPercent: 110, duration: 1, ease: 'power4.out', stagger: 0.1,
                    onComplete: function () { split.revert(); }
                }, 0.1);
            } else {
                tl.from(title, { autoAlpha: 0, y: 22, duration: 0.9 }, 0.1);
            }

            if (sub) tl.to(sub, { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.55');
            if (meta) tl.to(meta, { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.5');
        });
    }

    // ---------- 3. « Le saviez-vous ? » ----------
    var savez = document.querySelector('.savez-full-inner');
    if (savez) {
        gsap.from(savez.querySelectorAll(':scope > *'), {
            autoAlpha: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.08,
            scrollTrigger: { trigger: savez, start: 'top 80%', once: true }
        });
    }
})();

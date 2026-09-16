// ============================================================
// Nav condensée au scroll — présent sur toutes les pages.
// Aucune dépendance (ni GSAP ni autre). Ajoute/retire la classe
// .is-scrolled sur <nav> ; toute la transition visuelle est en CSS
// (css/style.css). Neutralisé visuellement si prefers-reduced-motion.
// ============================================================
(function () {
    var nav = document.querySelector('nav');
    if (!nav) return;

    var ticking = false;
    function update() {
        nav.classList.toggle('is-scrolled', window.scrollY > 30);
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update(); // état correct si la page est rechargée en cours de scroll
})();

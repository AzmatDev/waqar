// ============================================================
// Nav condensée au scroll — présent sur toutes les pages.
// Aucune dépendance (ni GSAP ni autre). Ajoute/retire la classe
// .is-scrolled sur <nav> ; toute la transition visuelle est en CSS
// (css/style.css). Neutralisé visuellement si prefers-reduced-motion.
//
// La nav bascule aussi en .nav-on-dark quand elle survole une section à
// fond sombre (ex: #contact-section), pour rester lisible dessus.
// ============================================================
(function () {
    var nav = document.querySelector('nav');
    if (!nav) return;

    var darkSection = document.getElementById('contact-section');

    var ticking = false;
    function update() {
        nav.classList.toggle('is-scrolled', window.scrollY > 30);

        if (darkSection) {
            var navHeight = nav.offsetHeight;
            var rect = darkSection.getBoundingClientRect();
            nav.classList.toggle('nav-on-dark', rect.top <= navHeight && rect.bottom >= navHeight);
        }

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    update(); // état correct si la page est rechargée en cours de scroll
})();

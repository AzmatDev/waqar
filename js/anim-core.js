// ============================================================
// Socle commun des animations GSAP pour product.html / collection.html
// (index.html garde son propre js/animation.js, inchangé).
//
// À charger APRÈS gsap.min.js + ScrollTrigger.min.js (+ SplitText.min.js
// si la page en a besoin) et AVANT js/anim-*.js.
//
// Expose window.WAnim :
//   .enabled   → true si GSAP est présent ET l'utilisateur n'a pas demandé
//                moins d'animations. Si false, les scripts anim-*.js
//                sortent immédiatement et ne touchent à rien (site normal).
//   .splitLines(el) → découpe un titre en lignes masquées, ou null si
//                     SplitText n'est pas chargé.
//   .onReady(fn)    → exécute fn quand les polices sont prêtes (fallback 1 s).
// ============================================================
window.WAnim = (function () {
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    var enabled = hasGsap && !reduced;

    if (hasGsap) {
        gsap.registerPlugin(ScrollTrigger);
        if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    }

    function splitLines(target) {
        if (typeof SplitText === 'undefined') return null;
        try {
            return SplitText.create(target, { type: 'lines', mask: 'lines' });
        } catch (e) {
            return null;
        }
    }

    function onReady(fn) {
        var done = false;
        var run = function () { if (!done) { done = true; fn(); } };
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
        setTimeout(run, 1000);
    }

    return { enabled: enabled, reduced: reduced, splitLines: splitLines, onReady: onReady };
})();

// ============================================================
// Animations de la fiche produit (product.html)
// Nécessite : gsap + ScrollTrigger + js/anim-core.js chargés avant.
// Chargé APRÈS js/product.js : la galerie et la colonne infos sont
// déjà rendues quand ce script s'exécute.
//
//  1. Chorégraphie d'entrée : l'image apparaît, la colonne de droite
//     enchaîne en cascade.
//  2. Crossfade de l'image principale à chaque changement de coloris
//     ou de miniature (au lieu du swap instantané).
//  3. « Fly to cart » : au clic sur « Ajouter au panier », une copie
//     de l'image vole vers l'icône panier + rebond de l'icône.
// ============================================================
(function () {
    var W = window.WAnim;
    if (!W || !W.enabled) return;

    var mainImg = document.getElementById('main-img');
    var imgWrap = document.querySelector('.product-main-img');
    var right = document.querySelector('.product-right');
    var cartBtn = document.querySelector('.nav-cart-btn');

    // ---------- 1. Entrée ----------
    if (imgWrap && right) {
        var rightKids = right.querySelectorAll(':scope > *');
        // Certains enfants (boutons) ont une transition CSS "all 0.2s" pour leurs
        // effets de survol : on la met en pause le temps de l'entrée, puis on la
        // restaure pour ne pas casser les hovers.
        rightKids.forEach(function (c) { c.style.transition = 'none'; });
        gsap.set(imgWrap, { autoAlpha: 0, y: 24 });
        gsap.set(rightKids, { autoAlpha: 0, y: 18 });

        var tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            onComplete: function () {
                rightKids.forEach(function (c) { c.style.transition = ''; });
            }
        });
        tl.to(imgWrap, { autoAlpha: 1, y: 0, duration: 0.9 })
          .to(rightKids, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07 }, '-=0.55');
    }

    // ---------- 2. Crossfade au changement d'image ----------
    // On ignore les 900 premières ms pour ne pas se superposer à l'entrée
    // (et au tout premier chargement de l'image).
    if (mainImg) {
        var armed = false;
        setTimeout(function () { armed = true; }, 900);
        mainImg.addEventListener('load', function () {
            if (!armed) return;
            gsap.fromTo(mainImg,
                { autoAlpha: 0.35 },
                { autoAlpha: 1, duration: 0.4, ease: 'power1.out', overwrite: 'auto' });
        });
    }

    // ---------- 3. Fly to cart ----------
    // Uniquement sur mobile (<=480px) : c'est là que cart.js n'ouvre pas le
    // panier automatiquement (il se contente de faire pulser le badge), donc
    // l'animation apporte un vrai retour visuel. Sur desktop, l'ouverture du
    // drawer fait déjà le travail.
    var addBtn = document.querySelector('.btn-precommande');
    if (addBtn && cartBtn && mainImg && imgWrap) {
        addBtn.addEventListener('click', function () {
            if (window.innerWidth > 480) return;
            // Mêmes conditions que addCurrentToCart() : pas de taille → rien.
            if (!document.querySelector('.taille-btn.selected')) return;
            var src = mainImg.getAttribute('src');
            if (!src) return;
            flyToCart(src);
        });
    }

    function flyToCart(src) {
        var start = imgWrap.getBoundingClientRect();
        var end = cartBtn.getBoundingClientRect();

        var clone = document.createElement('img');
        clone.src = src;
        clone.style.cssText =
            'position:fixed;z-index:9999;pointer-events:none;border-radius:8px;object-fit:cover;' +
            'left:' + start.left + 'px;top:' + start.top + 'px;' +
            'width:' + start.width + 'px;height:' + start.height + 'px;';
        document.body.appendChild(clone);

        gsap.to(clone, {
            duration: 0.7,
            ease: 'power2.in',
            left: end.left + end.width / 2 - 12,
            top: end.top + end.height / 2 - 12,
            width: 24,
            height: 24,
            opacity: 0.15,
            onComplete: function () {
                clone.remove();
                gsap.fromTo(cartBtn,
                    { scale: 1 },
                    { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'scale' });
            }
        });
    }
})();

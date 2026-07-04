// ============================================================
// index.html — plus de logique produit ici : la galerie de
// collections (#collection) est statique. Les produits vivent
// désormais dans collection.html (js/collection.js).
// ============================================================

// Formulaire commande
const orderForm = document.getElementById('orderForm');
if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('.btn-order');
        btn.textContent = 'Envoi en cours...';
        btn.disabled = true;
        const f = id => document.getElementById(id).value;
        const subject = encodeURIComponent(`[WAQĀR] Nouvelle commande — ${f('prenom')} ${f('nom')}`);
        const body = encodeURIComponent(
            `NOUVELLE COMMANDE WAQĀR\n\n` +
            `Client : ${f('prenom')} ${f('nom')}\n` +
            `Email : ${f('email')}\n\n` +
            `Modèle : ${f('modele')}\n` +
            `Taille : ${f('taille')}\n\n` +
            `Adresse : ${f('adresse')}\n` +
            `Code postal : ${f('codepostal')}\n` +
            `Ville : ${f('ville')}\n` +
            `Pays : ${f('pays')}\n\n` +
            `Informations : ${f('message') || 'Aucune'}\n\n---\nwaqar.fr`
        );
        window.location.href = `mailto:waqar_1447@outlook.com?subject=${subject}&body=${body}`;
        setTimeout(() => {
            document.getElementById('orderForm').style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
        }, 800);
    });
}

// Formulaire contact
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const nom     = document.getElementById('contact-nom').value;
        const email   = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        const subject = encodeURIComponent(`[WAQĀR] Message de ${nom}`);
        const body    = encodeURIComponent(`Nom : ${nom}\nEmail : ${email}\n\nMessage :\n${message}\n\n---\nwaqar.fr`);
        window.location.href = `mailto:waqar_1447@outlook.com?subject=${subject}&body=${body}`;
        setTimeout(() => {
            document.getElementById('contactForm').style.display = 'none';
            document.getElementById('contactSuccess').style.display = 'block';
        }, 800);
    });
}

function observeFadeIns() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

observeFadeIns();

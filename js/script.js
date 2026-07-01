const collections = [
    {
        id: 'waqar',
        title: 'Collection WAQĀR 1447',
        sub: "Hommes et enfants. Pour la prière, le vendredi, le quotidien.",
        savezLabel: 'Le saviez-vous ?',
        savezTitle: `La Jubba — <em>l'habit du Prophète ﷺ</em>`,
        savezText1: "La Jubba est le vêtement long et ample que l'on porte par-dessus le Qamis. Contrairement à ce que certains pensent, le Prophète ﷺ portait lui-même des Jubbas — cela est prouvé dans les hadiths authentiques.",
        savezText2: "Ce n'est pas un simple vêtement traditionnel. C'est un habit de la Sunnah, chargé de sens et de noblesse.",
        savezQuote: '« Chaque Jubba que nous proposons est vérifiée selon les critères de la Sunnah. »',
        emptyMessage: "De nouvelles pièces WAQĀR arrivent bientôt, incha'Allah."
    },
    {
        id: 'mizan',
        title: 'Collection MIZĀN',
        sub: "Hommes et enfants. Le sarouel, entre pudeur et liberté de mouvement.",
        savezLabel: 'Le saviez-vous ?',
        savezTitle: `Le Sarouel — <em>simplicité et pudeur</em>`,
        savezText1: "Le sarouel est un vêtement ample, apprécié pour sa liberté de mouvement et sa conformité aux critères de pudeur de la Sunnah.",
        savezText2: "Chaque pièce MIZĀN peut être ajustée à la main à votre taille grâce à l'Ajustement Sunnah, pour un tombé parfait.",
        savezQuote: '« Mizân — l\'équilibre entre tradition et confort. »',
        emptyMessage: "La collection MIZĀN arrive bientôt, incha'Allah."
    }
];

let currentCollectionIndex = 0;
let currentCat = 'adulte';

const products = [
    { id:1, collection:'waqar', cat:'adulte', name:'Jubba Noire', sub:'50% Lycra · 50% Coton', img:'images/jubba_blk.png' },
    { id:2, collection:'waqar', cat:'adulte', name:'Jubba Blanche', sub:'50% Lycra · 50% Coton', img:'images/jubba_wht.png' },
    { id:3, collection:'waqar', cat:'enfant', name:'Jubba Noire', sub:'50% Lycra · 50% Coton', img:'images/jubba_blk_enfant.jpeg' },
    { id:4, collection:'waqar', cat:'enfant', name:'Jubba Gris clair', sub:'50% Lycra · 50% Coton', img:'images/jubba_gris_enfant.jpg' }
    // Les produits MIZĀN (sarouels) seront ajoutés ici une fois les photos et tarifs disponibles.
];

function renderProducts(cat) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    currentCat = cat;
    const collection = collections[currentCollectionIndex];
    const filtered = products.filter(p => p.collection === collection.id && p.cat === cat);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="collection-empty">${collection.emptyMessage}</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div class="product-card fade-in" onclick="scrollToOrder('${p.name}', '${p.collection}', '${cat}')">
            <div class="product-img">
                <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentElement.style.background='${p.name.includes('Noir') ? '#1A1A1A' : p.name.includes('Gris') ? '#C8C3BA' : '#EDE8DF'}'">
            </div>
            <p class="product-name">${p.name}</p>
            <p class="product-meta">${p.sub}</p>
        </div>
    `).join('');
    observeFadeIns();
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
}

function updateCollectionUI() {
    const collection = collections[currentCollectionIndex];
    const title = document.getElementById('collection-title');
    const sub = document.getElementById('collection-sub');
    const savezLabel = document.getElementById('savez-label');
    const savezTitle = document.getElementById('savez-title');
    const savezText1 = document.getElementById('savez-text1');
    const savezText2 = document.getElementById('savez-text2');
    const savezQuote = document.getElementById('savez-quote');
    const dotsContainer = document.getElementById('collection-dots');

    if (title) title.textContent = collection.title;
    if (sub) sub.textContent = collection.sub;
    if (savezLabel) savezLabel.textContent = collection.savezLabel;
    if (savezTitle) savezTitle.innerHTML = collection.savezTitle;
    if (savezText1) savezText1.textContent = collection.savezText1;
    if (savezText2) savezText2.textContent = collection.savezText2;
    if (savezQuote) savezQuote.textContent = collection.savezQuote;

    if (dotsContainer) {
        dotsContainer.innerHTML = collections.map((c, i) =>
            `<span class="collection-dot${i === currentCollectionIndex ? ' active' : ''}"></span>`
        ).join('');
    }
}

function switchCollection(direction) {
    currentCollectionIndex = (currentCollectionIndex + direction + collections.length) % collections.length;
    updateCollectionUI();
    renderProducts(currentCat);
}

function scrollToOrder(nom, collectionId, cat) {
    const p = products.find(p => p.name === nom && p.collection === collectionId && p.cat === cat);
    if (p) window.location.href = `product.html?id=${p.id}`;
}

// Hover jubba SVG
const btnHero = document.querySelector('.btn-primary');
const jubba = document.querySelector('.jubba-svg');
if (btnHero && jubba) {
    btnHero.addEventListener('mouseenter', () => jubba.style.opacity = '0.32');
    btnHero.addEventListener('mouseleave', () => jubba.style.opacity = '0.13');
}

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

updateCollectionUI();
renderProducts('adulte');
observeFadeIns();
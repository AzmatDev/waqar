const products = [
    {
        id: 1, cat: 'adulte',
        name: 'Jubba Noire',
        sub: '50% Lycra · 50% Coton',
        img: 'images/jubba_blk.png'
    },
    {
        id: 2, cat: 'adulte',
        name: 'Jubba Blanche',
        sub: '50% Lycra · 50% Coton',
        img: 'images/jubba_wht.png'
    },
    {
        id: 3, cat: 'enfant',
        name: 'Jubba Noire',
        sub: '50% Lycra · 50% Coton',
        img: 'images/jubba-enfant-noir.jpg'
    },
    {
        id: 4, cat: 'enfant',
        name: 'Jubba Gris clair',
        sub: '50% Lycra · 50% Coton',
        img: 'images/jubba-enfant-gris.jpg'
    }
];

function renderProducts(cat) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.filter(p => p.cat === cat).map(p => `
    <div class="product-card fade-in" onclick="scrollToOrder('${p.name}', '${cat}')">
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

function scrollToOrder(nom, cat) {
    document.getElementById('commande').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
        const select = document.getElementById('modele');
        for (let opt of select.options) {
            const label = cat === 'enfant' ? 'Enfant' : 'Adulte';
            const couleur = nom.includes('Noir') ? 'Noir' : nom.includes('Gris') ? 'Gris clair' : 'Blanc';
            if (opt.value.includes(label) && opt.value.includes(couleur)) {
                opt.selected = true;
                break;
            }
        }
    }, 800);
}

// Hover jubba SVG au survol du bouton hero
const btn = document.querySelector('.btn-primary');
const jubba = document.querySelector('.jubba-svg');
if (btn && jubba) {
    btn.addEventListener('mouseenter', () => jubba.style.opacity = '0.32');
    btn.addEventListener('mouseleave', () => jubba.style.opacity = '0.13');
}

document.getElementById('orderForm').addEventListener('submit', function(e) {
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
        `Informations : ${f('message') || 'Aucune'}\n\n` +
        `---\nwaqar.fr`
    );

    window.location.href = `mailto:waqar_1447@outlook.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
        document.getElementById('orderForm').style.display = 'none';
        document.getElementById('formSuccess').style.display = 'block';
    }, 800);
});

function observeFadeIns() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

renderProducts('adulte');
observeFadeIns();
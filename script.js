const products = [
    { id:1, cat:'adulte', name:'Al-Fajr', sub:'Jubba adulte — Lin tissé',
        colors:[{label:'Blanc',hex:'#EDE8DF',val:'Jubba Adulte — Blanc (Lin)'},{label:'Noir',hex:'#1A1A1A',val:'Jubba Adulte — Noir (Lin)'}],
        img:'https://images.unsplash.com/photo-1594938298603-c8148c4b4055?w=600&q=80' },
    { id:2, cat:'adulte', name:'Al-Layl', sub:'Jubba adulte — Satin',
        colors:[{label:'Noir',hex:'#1A1A1A',val:'Jubba Adulte — Noir (Satin)'},{label:'Blanc',hex:'#EDE8DF',val:'Jubba Adulte — Blanc (Satin)'}],
        img:'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80' },
    { id:3, cat:'enfant', name:'As-Saghir', sub:'Jubba enfant — Denim',
        colors:[{label:'Noir',hex:'#2A2A2A',val:'Jubba Enfant — Noir (Denim)'}],
        img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
    { id:4, cat:'enfant', name:'Al-Nur', sub:'Jubba enfant — Lin',
        colors:[{label:'Gris clair',hex:'#C8C3BA',val:'Jubba Enfant — Gris clair (Lin)'}],
        img:'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80' }
];

let currentProduct = null;

function renderProducts(cat) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = products.filter(p => p.cat === cat).map(p => `
    <div class="product-card fade-in" onclick="openModal(${p.id})">
      <div class="product-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.parentElement.style.background='${p.colors[0].hex}'">
      </div>
      <p class="product-name">${p.name}</p>
      <div class="product-meta">
        <span>${p.sub}</span>
        <div class="product-colors">
          ${p.colors.map(c => `<div class="color-dot" style="background:${c.hex}" title="${c.label}"></div>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
    observeFadeIns();
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
}

function openModal(id) {
    currentProduct = products.find(p => p.id === id);
    document.getElementById('modal-name').textContent = currentProduct.name;
    document.getElementById('modal-cat').textContent = currentProduct.sub;
    document.getElementById('modal-colors').innerHTML = currentProduct.colors.map((c, i) => `
    <div class="color-option ${i === 0 ? 'selected' : ''}" onclick="selectColor(this)">
      <div class="color-swatch" style="background:${c.hex};"></div>
      <span>${c.label}</span>
    </div>
  `).join('');
    document.getElementById('modal').classList.add('open');
}

function selectColor(el) {
    el.closest('.modal-colors').querySelectorAll('.color-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
}

function closeModal(e) {
    if (e.target === document.getElementById('modal')) {
        document.getElementById('modal').classList.remove('open');
    }
}

function prefillForm() {
    if (!currentProduct) return;
    const label = document.querySelector('.color-option.selected span')?.textContent;
    const match = currentProduct.colors.find(c => c.label === label);
    if (match) {
        for (let opt of document.getElementById('modele').options) {
            if (opt.value === match.val) { opt.selected = true; break; }
        }
    }
    document.getElementById('modal').classList.remove('open');
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
        `Email : ${f('email')}\n` +
        `Pays : ${f('pays')}\n\n` +
        `Modèle : ${f('modele')}\n` +
        `Taille : ${f('taille')}\n` +
        `Quantité : ${f('quantite')}\n\n` +
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
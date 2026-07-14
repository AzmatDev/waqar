// ============================================================
// Nécessite js/products-data.js chargé avant ce fichier
// ============================================================

const params = new URLSearchParams(window.location.search);
const familyId = params.get('id') || productFamilies[0].id;
const family = productFamilies.find(f => f.id === familyId) || productFamilies[0];

let colorId = params.get('color');
if (!colorId || !family.colors.find(c => c.id === colorId)) {
    colorId = family.colors[0].id;
}
let currentColor = family.colors.find(c => c.id === colorId);

// Tailles
const taillesContainer = document.getElementById('tailles-container');
taillesContainer.innerHTML = family.tailles.map(t => `
    <button class="taille-btn" onclick="selectTaille(this)">${t}</button>
`).join('');

// Infos générales
document.getElementById('product-title').textContent = family.name;

// Prix : un seul prix affiché, la livraison est un MODE DE RÉCEPTION, pas un 2e produit
const prixMainEl = document.getElementById('product-prix-main');
const receptionChoice = document.getElementById('reception-choice');
const receptionSupplement = document.getElementById('reception-supplement');
let receptionMode = 'propre'; // valeur par défaut

function updatePrixAffiche() {
    if (!prixMainEl) return;
    prixMainEl.textContent = receptionMode === 'livraison' ? family.prixLivraison : family.prix;
}

if (family.prixLivraison) {
    if (receptionChoice) receptionChoice.style.display = '';
    // Calcule le supplément affiché, ex: "(+3,00 €)"
    const base = parseFloat(family.prix.replace(',', '.').replace(/[^\d.]/g, ''));
    const avecLivraison = parseFloat(family.prixLivraison.replace(',', '.').replace(/[^\d.]/g, ''));
    const supplement = (avecLivraison - base).toFixed(2).replace('.', ',');
    if (receptionSupplement) receptionSupplement.textContent = `(+${supplement} €)`;

    document.querySelectorAll('input[name="reception"]').forEach(radio => {
        radio.addEventListener('change', () => {
            receptionMode = radio.value;
            updatePrixAffiche();
        });
    });
}
updatePrixAffiche();

// Info-bulle "Remise en main propre" : clic pour afficher/masquer, sans cocher le radio
const infoPropreBtn = document.getElementById('info-propre-btn');
const infoPropreText = document.getElementById('info-propre-text');
if (infoPropreBtn && infoPropreText) {
    infoPropreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        infoPropreText.style.display = infoPropreText.style.display === 'none' ? '' : 'none';
    });
}

// Offre groupée (ex: 2 sarouels = livraison offerte) — ligne compacte sous le prix
const offerLineEl = document.getElementById('product-offer-line');
if (offerLineEl && family.offre) {
    offerLineEl.style.display = '';
    offerLineEl.innerHTML = `✦ ${family.offre.titre}<span class="product-offer-detail">${family.offre.detail}</span>`;
}

document.getElementById('product-desc').textContent = family.desc;
document.title = `WAQĀR — ${family.name}`;

// Détermine si une couleur est claire (pour ajouter un léger contour au swatch)
function isLightColor(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16), g = parseInt(c.substr(2, 2), 16), b = parseInt(c.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 200;
}

// Pastilles de couleur
const colorisDiv = document.getElementById('product-coloris');
function renderColorSwatches() {
    colorisDiv.innerHTML = '';
    family.colors.forEach(c => {
        const btn = document.createElement('button');
        btn.className = 'coloris-btn' + (c.id === currentColor.id ? ' active' : '');
        btn.style.background = c.hex;
        btn.title = c.label;
        btn.style.outline = isLightColor(c.hex) ? '1px solid #ddd' : 'none';
        btn.addEventListener('click', () => {
            currentColor = c;
            history.replaceState(null, '', `product.html?id=${family.id}&color=${c.id}`);
            renderColorSwatches();
            renderGallery();
        });
        colorisDiv.appendChild(btn);
    });
}

// Image principale + miniatures (carousel)
let galleryImages = [];
let galleryIndex = 0;

function renderGallery() {
    const mainImg = document.getElementById('main-img');
    const mainImgWrap = document.querySelector('.product-main-img');
    const thumbsContainer = document.getElementById('product-thumbnails');
    const images = (currentColor.images && currentColor.images.length) ? currentColor.images : [];
    galleryImages = images;
    galleryIndex = 0;

    // Flèches (créées une seule fois, réutilisées à chaque changement de couleur)
    let prevBtn = document.getElementById('gallery-prev');
    let nextBtn = document.getElementById('gallery-next');
    if (!prevBtn && mainImgWrap) {
        prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.id = 'gallery-prev';
        prevBtn.className = 'gallery-arrow gallery-arrow-left';
        prevBtn.setAttribute('aria-label', 'Photo précédente');
        prevBtn.textContent = '‹';
        prevBtn.addEventListener('click', () => goToImage(galleryIndex - 1));
        mainImgWrap.appendChild(prevBtn);

        nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.id = 'gallery-next';
        nextBtn.className = 'gallery-arrow gallery-arrow-right';
        nextBtn.setAttribute('aria-label', 'Photo suivante');
        nextBtn.textContent = '›';
        nextBtn.addEventListener('click', () => goToImage(galleryIndex + 1));
        mainImgWrap.appendChild(nextBtn);
    }

    if (images.length === 0) {
        mainImg.style.display = 'none';
        mainImg.removeAttribute('src');
        mainImgWrap.style.background = currentColor.hex;
        thumbsContainer.innerHTML = '';
        thumbsContainer.style.display = 'none';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
        return;
    }

    mainImgWrap.style.background = '';
    mainImg.style.display = '';
    mainImg.src = images[0];
    mainImg.alt = `${family.name} — ${currentColor.label}`;

    const showArrows = images.length > 1;
    if (prevBtn) prevBtn.style.display = showArrows ? '' : 'none';
    if (nextBtn) nextBtn.style.display = showArrows ? '' : 'none';

    if (images.length > 1) {
        thumbsContainer.style.display = 'flex';
        thumbsContainer.innerHTML = images.map((img, i) => `
            <div class="product-thumb${i === 0 ? ' active' : ''}" data-index="${i}">
                <img src="${img}" alt="${family.name} miniature ${i + 1}">
            </div>
        `).join('');
        thumbsContainer.querySelectorAll('.product-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                goToImage(parseInt(thumb.dataset.index, 10));
            });
        });
    } else {
        thumbsContainer.style.display = 'none';
        thumbsContainer.innerHTML = '';
    }
}

function goToImage(index) {
    if (!galleryImages.length) return;
    galleryIndex = (index + galleryImages.length) % galleryImages.length; // boucle en continu
    const mainImg = document.getElementById('main-img');
    const thumbsContainer = document.getElementById('product-thumbnails');
    mainImg.src = galleryImages[galleryIndex];
    if (thumbsContainer) {
        thumbsContainer.querySelectorAll('.product-thumb').forEach(t => {
            t.classList.toggle('active', parseInt(t.dataset.index, 10) === galleryIndex);
        });
    }
}

renderColorSwatches();
renderGallery();

// Taille
let tailleChoisie = '';
function selectTaille(btn) {
    document.querySelectorAll('.taille-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    tailleChoisie = btn.textContent;
}

// Ajouter au panier
function addCurrentToCart() {
    if (!tailleChoisie) {
        alert('Veuillez choisir une taille.');
        return;
    }
    const ajustementCheckbox = document.getElementById('ajustement-sunnah-checkbox');
    const ajustementSunnah = ajustementCheckbox ? ajustementCheckbox.checked : false;
    cartAddItem(family.id, currentColor.id, tailleChoisie, ajustementSunnah);
}

// Guide des tailles — n'apparaît que si ce produit a un tailleGuide défini
const sizeGuideLink = document.getElementById('size-guide-link');
if (family.tailleGuide && sizeGuideLink) {
    sizeGuideLink.style.display = '';
}

// Champs Taille/Poids (modale) et Ajustement Sunnah (page produit) — uniquement sur les produits qui le proposent
if (family.ajustementSunnah) {
    const row = document.getElementById('m-taille-poids-row');
    const note = document.getElementById('m-taille-poids-note');
    const ajustementBlock = document.getElementById('ajustement-sunnah-block');
    if (row) row.style.display = '';
    if (note) note.style.display = '';
    if (ajustementBlock) ajustementBlock.style.display = '';

    const imgEl = document.getElementById('ajustement-sunnah-img');
    const texteEl = document.getElementById('ajustement-sunnah-texte');
    const tagEl = document.getElementById('ajustement-sunnah-tag');
    const checkboxEl = document.getElementById('ajustement-sunnah-checkbox');

    if (imgEl && family.ajustementSunnahImage) {
        imgEl.style.display = ''; // retire le display:none laissé par l'erreur du src="" initial
        imgEl.src = family.ajustementSunnahImage;
    }
    if (texteEl) texteEl.textContent = family.ajustementSunnahTexte || '';

    const estObligatoire = family.ajustementSunnah === 'obligatoire';
    if (tagEl) tagEl.textContent = estObligatoire ? 'Inclus' : 'Gratuit';
    if (checkboxEl && estObligatoire) {
        checkboxEl.checked = true;
        checkboxEl.disabled = true; // impossible à décocher, c'est inclus d'office
    }
}

// Info-bulle "Ajustement Sunnah" : clic pour afficher/masquer, sans cocher la case
const infoAjustementBtn = document.getElementById('info-ajustement-btn');
const infoAjustementText = document.getElementById('info-ajustement-text');
if (infoAjustementBtn && infoAjustementText) {
    infoAjustementBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        infoAjustementText.style.display = infoAjustementText.style.display === 'none' ? '' : 'none';
    });
}

function openSizeGuide() {
    if (!family.tailleGuide) return;
    document.getElementById('size-guide-title').textContent = family.name;

    const { columns, rows } = family.tailleGuide;
    const thead = `<tr><th>Taille</th>${columns.map(c => `<th>${c}</th>`).join('')}</tr>`;
    const tbody = rows.map(r => `<tr><td>${r.taille}</td>${r.values.map(v => `<td>${v}</td>`).join('')}</tr>`).join('');
    document.getElementById('size-guide-table').innerHTML = thead + tbody;

    document.getElementById('sizeGuideModal').classList.add('open');
}

function closeSizeGuide() {
    document.getElementById('sizeGuideModal').classList.remove('open');
}


// Navigation Adulte/Enfant en haut de page — n'apparaît que s'il y a un vrai choix
const hasAdulte = productFamilies.some(f => f.collection === family.collection && f.cat === 'adulte');
const hasEnfant = productFamilies.some(f => f.collection === family.collection && f.cat === 'enfant');
const navWrapper = document.getElementById('product-nav-cat-wrapper');
if (hasAdulte && hasEnfant) {
    const activeBtn = document.getElementById('btn-' + family.cat);
    if (activeBtn) activeBtn.classList.add('active');
    const productPageEl = document.querySelector('.product-page');
    if (productPageEl) productPageEl.classList.add('has-nav-cat');
} else if (navWrapper) {
    navWrapper.style.display = 'none';
}

function switchCat(cat) {
    const first = productFamilies.find(f => f.collection === family.collection && f.cat === cat);
    if (first) window.location.href = `product.html?id=${first.id}`;
}

// Cross-sell : met en avant les pièces des AUTRES collections en bas de fiche produit

function renderCrossSell() {
    const section = document.getElementById('cross-sell');
    const grid = document.getElementById('cross-sell-grid');
    const titleEl = document.getElementById('cross-sell-title');
    if (!section || !grid) return;

    // On recommande tous les autres produits du site (peu importe la collection),
    // seul le produit actuellement affiché est exclu.
    const otherFamilies = productFamilies.filter(f => f.id !== family.id);
    if (otherFamilies.length === 0) {
        section.style.display = 'none';
        return;
    }

    titleEl.textContent = 'Vous aimerez aussi';

    // Ambiguïté Adulte/Enfant : on ne l'affiche que si les recommandations mélangent les deux
    const needsCatLabel = new Set(otherFamilies.map(f => f.cat)).size > 1;

    // Un "candidat" = une combinaison produit + couleur, pour varier l'affichage
    // même quand une collection n'a qu'un seul produit (ses différentes couleurs
    // comptent comme autant de candidats). Reste valable quand vous en ajouterez d'autres.
    const candidates = [];
    otherFamilies.forEach(f => {
        f.colors.forEach(c => candidates.push({ family: f, color: c }));
    });

    // Mélange aléatoire (Fisher-Yates), puis on garde 5 maximum
    for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const picked = candidates.slice(0, 5);

    grid.innerHTML = picked.map(({ family: f, color }) => {
        const hasImg = color.images && color.images[0];
        const label = needsCatLabel ? `${f.name} ${f.cat === 'adulte' ? 'Adulte' : 'Enfant'}` : f.name;
        return `
        <a class="product-card fade-in" href="product.html?id=${f.id}&color=${color.id}">
            <div class="product-img" style="${hasImg ? '' : `background:${color.hex}`}">
                ${hasImg ? `<img src="${color.images[0]}" alt="${f.name}" loading="lazy">` : ''}
            </div>
            <p class="product-name">${label}</p>
            <p class="product-meta">${color.label}${f.matiere ? ' · ' + f.matiere : ''}</p>
        </a>`;
    }).join('');
}

function observeFadeIns() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

// Formulaire contact (identique à script.js — nécessaire car product.html
// n'inclut pas script.js et possède maintenant sa propre section contact)
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

renderCrossSell();
observeFadeIns();

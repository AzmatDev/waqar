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
document.getElementById('product-prix').textContent = family.prix;
document.getElementById('product-cat').textContent = `${family.name} ${family.cat === 'adulte' ? 'Adulte' : 'Enfant'}`;
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
function renderGallery() {
    const mainImg = document.getElementById('main-img');
    const mainImgWrap = document.querySelector('.product-main-img');
    const thumbsContainer = document.getElementById('product-thumbnails');
    const images = (currentColor.images && currentColor.images.length) ? currentColor.images : [];

    if (images.length === 0) {
        mainImg.style.display = 'none';
        mainImg.removeAttribute('src');
        mainImgWrap.style.background = currentColor.hex;
        thumbsContainer.innerHTML = '';
        thumbsContainer.style.display = 'none';
        return;
    }

    mainImgWrap.style.background = '';
    mainImg.style.display = '';
    mainImg.src = images[0];
    mainImg.alt = `${family.name} — ${currentColor.label}`;

    if (images.length > 1) {
        thumbsContainer.style.display = 'flex';
        thumbsContainer.innerHTML = images.map((img, i) => `
            <div class="product-thumb${i === 0 ? ' active' : ''}" data-index="${i}">
                <img src="${img}" alt="${family.name} miniature ${i + 1}">
            </div>
        `).join('');
        thumbsContainer.querySelectorAll('.product-thumb').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const idx = parseInt(thumb.dataset.index, 10);
                mainImg.src = images[idx];
                thumbsContainer.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    } else {
        thumbsContainer.style.display = 'none';
        thumbsContainer.innerHTML = '';
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

// Précommander
function precommander() {
    if (!tailleChoisie) {
        alert('Veuillez choisir une taille.');
        return;
    }
    document.getElementById('modal-product-name').textContent = `${family.name} — ${currentColor.label}`;
    document.getElementById('modal-product-taille').textContent = 'Taille : ' + tailleChoisie;
    document.getElementById('orderModal').classList.add('open');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('open');
}

document.getElementById('orderModalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('modal-submit-btn');
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    const nom      = document.getElementById('m-nom').value;
    const email    = document.getElementById('m-email').value;
    const tel = document.getElementById('m-tel').value;
    const adresse  = document.getElementById('m-adresse').value;
    const codepostal = document.getElementById('m-codepostal').value;
    const ville    = document.getElementById('m-ville').value;
    const pays     = document.getElementById('m-pays').value;
    const modele   = `${family.name} ${family.cat === 'adulte' ? 'Adulte' : 'Enfant'} — ${currentColor.label}`;

    try {
        const response = await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, email, tel, modele, taille: tailleChoisie, adresse, codepostal, ville, pays })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('orderModalForm').style.display = 'none';
            document.getElementById('orderModalSuccess').style.display = 'block';
        } else {
            btn.textContent = 'Erreur — réessayez';
            btn.disabled = false;
        }
    } catch (err) {
        btn.textContent = 'Erreur — réessayez';
        btn.disabled = false;
    }
});

// Navigation Adulte/Enfant en haut de page (masque ce qui n'existe pas dans cette collection)
const hasAdulte = productFamilies.some(f => f.collection === family.collection && f.cat === 'adulte');
const hasEnfant = productFamilies.some(f => f.collection === family.collection && f.cat === 'enfant');
const btnAdulte = document.getElementById('btn-adulte');
const btnEnfant = document.getElementById('btn-enfant');
if (btnAdulte) btnAdulte.style.display = hasAdulte ? '' : 'none';
if (btnEnfant) btnEnfant.style.display = hasEnfant ? '' : 'none';
const activeBtn = document.getElementById('btn-' + family.cat);
if (activeBtn) activeBtn.classList.add('active');

function switchCat(cat) {
    const first = productFamilies.find(f => f.collection === family.collection && f.cat === cat);
    if (first) window.location.href = `product.html?id=${first.id}`;
}

// ============================================================
// Nécessite js/products-data.js chargé avant ce fichier
// Page servie via collection.html?c=waqar ou collection.html?c=istiqamah
// ============================================================

const clParams = new URLSearchParams(window.location.search);
const activeCollection = collections.find(c => c.id === clParams.get('c')) || collections[0];

// Raccourci : si la collection ne contient qu'une seule pièce, inutile de faire
// choisir le client — on l'envoie directement sur la fiche produit. Dès qu'une
// 2e pièce est ajoutée à cette collection, ce raccourci se désactive tout seul.
const collectionFamilies = productFamilies.filter(f => f.collection === activeCollection.id);
const singlePieceRedirect = collectionFamilies.length === 1;
if (singlePieceRedirect) {
    const onlyFamily = collectionFamilies[0];
    const onlyColor = onlyFamily.colors[0].id;
    window.location.replace(`product.html?id=${onlyFamily.id}&color=${onlyColor}`);
}

let currentCat = 'adulte';
const cardColorState = {}; // familyId -> colorId sélectionné sur la carte

function getAvailableCats(collectionId) {
    return [...new Set(productFamilies.filter(f => f.collection === collectionId).map(f => f.cat))];
}

function renderCollectionHeader() {
    const shortTitle = activeCollection.title.replace(/^Collection\s+/i, '');
    document.getElementById('collection-page-title').textContent = shortTitle;
    document.getElementById('collection-page-sub').textContent = activeCollection.sub;
    document.title = `WAQĀR — ${shortTitle}`;

    const pieceCount = productFamilies.filter(f => f.collection === activeCollection.id).length;
    const metaEl = document.getElementById('collection-page-meta');
    if (metaEl) {
        metaEl.textContent = pieceCount > 0
            ? `${pieceCount} pièce${pieceCount > 1 ? 's' : ''}`
            : '';
    }

    document.getElementById('savez-label').textContent = activeCollection.savezLabel;
    document.getElementById('savez-title').innerHTML = activeCollection.savezTitle;
    document.getElementById('savez-text1').textContent = activeCollection.savezText1;
    document.getElementById('savez-text2').textContent = activeCollection.savezText2;
    document.getElementById('savez-quote').textContent = activeCollection.savezQuote;
}

function updateTabs() {
    const availableCats = getAvailableCats(activeCollection.id);
    const tabsWrapper = document.getElementById('tabs-wrapper');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (availableCats.length <= 1) {
        if (tabsWrapper) tabsWrapper.style.display = 'none';
        currentCat = availableCats[0] || 'adulte';
    } else {
        if (tabsWrapper) tabsWrapper.style.display = '';
        tabBtns.forEach(btn => {
            btn.style.display = availableCats.includes(btn.dataset.cat) ? '' : 'none';
        });
        if (!availableCats.includes(currentCat)) currentCat = availableCats[0];
        tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.cat === currentCat));
    }
}

function renderProducts(cat) {
    currentCat = cat;
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    const families = productFamilies.filter(f => f.collection === activeCollection.id && f.cat === cat);

    if (families.length === 0) {
        grid.innerHTML = `<div class="collection-empty">${activeCollection.emptyMessage}</div>`;
        return;
    }

    grid.innerHTML = families.map(family => {
        const defaultColor = cardColorState[family.id]
            ? family.colors.find(c => c.id === cardColorState[family.id]) || family.colors[0]
            : family.colors[0];
        cardColorState[family.id] = defaultColor.id;
        const hasImg = defaultColor.images && defaultColor.images[0];

        const imgStyle = `${family.imageRatio ? `aspect-ratio:${family.imageRatio};` : ''}${hasImg ? '' : `background:${defaultColor.hex}`}`;
        return `
        <div class="product-card fade-in" data-family="${family.id}">
            <div class="product-img" onclick="goToProduct('${family.id}')" style="${imgStyle}">
                ${hasImg ? `<img id="card-img-${family.id}" src="${defaultColor.images[0]}" alt="${family.name}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='${defaultColor.hex}'">` : ''}
            </div>
            <p class="product-name">${family.name}</p>
            <p class="product-meta" id="card-meta-${family.id}">${defaultColor.label}${family.matiere ? ' · ' + family.matiere : ''}</p>
            ${family.colors.length > 1 ? `
            <div class="product-swatches">
                ${family.colors.map(c => `<button class="swatch-dot${c.id === defaultColor.id ? ' active' : ''}" data-color="${c.id}" style="background:${c.hex}" title="${c.label}" onclick="event.stopPropagation(); selectCardColor('${family.id}', '${c.id}')"></button>`).join('')}
            </div>` : ''}
        </div>`;
    }).join('');
    observeFadeIns();
}

function selectCardColor(familyId, colorId) {
    cardColorState[familyId] = colorId;
    const family = productFamilies.find(f => f.id === familyId);
    const color = family.colors.find(c => c.id === colorId);
    const card = document.querySelector(`.product-card[data-family="${familyId}"]`);
    if (!card) return;

    const imgWrap = card.querySelector('.product-img');
    const imgEl = document.getElementById(`card-img-${familyId}`);
    const metaEl = document.getElementById(`card-meta-${familyId}`);

    if (color.images && color.images[0]) {
        imgWrap.style.background = '';
        if (imgEl) {
            imgEl.src = color.images[0];
            imgEl.style.display = '';
        } else {
            imgWrap.innerHTML = `<img id="card-img-${familyId}" src="${color.images[0]}" alt="${family.name}" loading="lazy">`;
        }
    } else {
        imgWrap.style.background = color.hex;
        if (imgEl) imgEl.style.display = 'none';
    }

    if (metaEl) metaEl.textContent = `${color.label}${family.matiere ? ' · ' + family.matiere : ''}`;
    card.querySelectorAll('.swatch-dot').forEach(dot => dot.classList.toggle('active', dot.dataset.color === colorId));
}

function goToProduct(familyId) {
    const colorId = cardColorState[familyId] || productFamilies.find(f => f.id === familyId).colors[0].id;
    window.location.href = `product.html?id=${familyId}&color=${colorId}`;
}

function filterProducts(cat, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(cat);
}

function observeFadeIns() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));
}

if (!singlePieceRedirect) {
    renderCollectionHeader();
    updateTabs();
    renderProducts(currentCat);
    observeFadeIns();
}

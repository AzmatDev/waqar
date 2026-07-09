// ============================================================
// PANIER WAQĀR — nécessite js/products-data.js chargé avant ce fichier.
// Utilisé sur TOUTES les pages : badge nav + panneau coulissant.
// Stockage : localStorage (propre à l'appareil/navigateur du client,
// pas de compte, pas de base de données côté serveur).
// ============================================================

const CART_STORAGE_KEY = 'waqar_cart';

// ---------- Stockage ----------
function cartGet() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function cartSave(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    cartUpdateBadge();
}

function cartLineKey(item) {
    return [item.familyId, item.colorId, item.taille, item.ajustementSunnah ? '1' : '0'].join('|');
}

function cartAddItem(familyId, colorId, taille, ajustementSunnah) {
    const items = cartGet();
    const key = cartLineKey({ familyId, colorId, taille, ajustementSunnah });
    const existing = items.find(i => cartLineKey(i) === key);
    if (existing) {
        existing.quantity += 1;
    } else {
        items.push({ familyId, colorId, taille, ajustementSunnah: !!ajustementSunnah, quantity: 1 });
    }
    cartSave(items);
    cartOpen();
}

function cartRemoveItem(index) {
    const items = cartGet();
    items.splice(index, 1);
    cartSave(items);
    cartRenderBody();
}

function cartChangeQuantity(index, delta) {
    const items = cartGet();
    if (!items[index]) return;
    items[index].quantity = Math.max(1, items[index].quantity + delta);
    cartSave(items);
    cartRenderBody();
}

function cartCount() {
    return cartGet().reduce((sum, i) => sum + i.quantity, 0);
}

function cartUpdateBadge() {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = cartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? '' : 'none';
}

// ---------- Résolution des données produit ----------
function cartResolveItem(item) {
    const family = productFamilies.find(f => f.id === item.familyId);
    if (!family) return null;
    const color = family.colors.find(c => c.id === item.colorId) || family.colors[0];
    return { family, color };
}

function cartFormatPrice(str) {
    return parseFloat(String(str).replace(',', '.').replace(/[^\d.]/g, '')) || 0;
}

// ---------- Injection du panneau (une seule fois par page) ----------
function cartInjectPanel() {
    if (document.getElementById('cart-drawer')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
        <div class="cart-overlay" id="cart-overlay" onclick="cartClose()"></div>
        <div class="cart-drawer" id="cart-drawer">
            <div class="cart-drawer-header">
                <span class="cart-drawer-title">Votre panier</span>
                <button class="cart-drawer-close" onclick="cartClose()" aria-label="Fermer">✕</button>
            </div>
            <div class="cart-drawer-body" id="cart-drawer-body"></div>
        </div>
    `;
    document.body.appendChild(wrapper);
}

function cartOpen() {
    cartInjectPanel();
    document.getElementById('cart-overlay').classList.add('open');
    document.getElementById('cart-drawer').classList.add('open');
    document.body.style.overflow = 'hidden';
    cartRenderBody();
}

function cartClose() {
    const overlay = document.getElementById('cart-overlay');
    const drawer = document.getElementById('cart-drawer');
    if (overlay) overlay.classList.remove('open');
    if (drawer) drawer.classList.remove('open');
    document.body.style.overflow = '';
}

// ---------- Étape 1 : liste des articles ----------
function cartRenderBody() {
    const body = document.getElementById('cart-drawer-body');
    if (!body) return;
    const items = cartGet();

    if (items.length === 0) {
        body.innerHTML = `<div class="cart-empty">Votre panier est vide.<br>Découvrez nos <a href="/#collection">collections</a>.</div>`;
        return;
    }

    let total = 0;
    let hasLivraisonOption = false;
    let sarouelCount = 0;

    const rows = items.map((item, index) => {
        const resolved = cartResolveItem(item);
        if (!resolved) return '';
        const { family, color } = resolved;
        const unitPrice = cartFormatPrice(family.prix);
        total += unitPrice * item.quantity;
        if (family.prixLivraison) hasLivraisonOption = true;
        if (family.offre) sarouelCount += item.quantity;
        const hasImg = color.images && color.images[0];
        const catLabel = family.cat === 'enfant' ? ' Enfant' : '';

        return `
        <div class="cart-item">
            <div class="cart-item-img" style="${hasImg ? '' : `background:${color.hex}`}">
                ${hasImg ? `<img src="${color.images[0]}" alt="${family.name}">` : ''}
            </div>
            <div class="cart-item-info">
                <p class="cart-item-name">${family.name}${catLabel}</p>
                <p class="cart-item-meta">${color.label} · Taille ${item.taille}${item.ajustementSunnah ? ' · Ajustement Sunnah' : ''}</p>
                <p class="cart-item-price">${family.prix}</p>
                <div class="cart-item-qty">
                    <button type="button" onclick="cartChangeQuantity(${index}, -1)" aria-label="Diminuer">−</button>
                    <span>${item.quantity}</span>
                    <button type="button" onclick="cartChangeQuantity(${index}, 1)" aria-label="Augmenter">+</button>
                </div>
            </div>
            <button type="button" class="cart-item-remove" onclick="cartRemoveItem(${index})" aria-label="Retirer">✕</button>
        </div>`;
    }).join('');

    const offerNote = sarouelCount >= 2
        ? `<p class="cart-offer-note">✦ Livraison offerte dès 2 sarouels — confirmé par email.</p>`
        : '';

    body.innerHTML = `
        <div class="cart-items">${rows}</div>
        ${offerNote}
        <div class="cart-total">
            <span>Total estimé</span>
            <strong>${total.toFixed(2).replace('.', ',')} €</strong>
        </div>
        <p class="cart-total-note">${hasLivraisonOption ? "Le mode de réception (à l'étape suivante) peut ajuster ce montant. " : ''}Montant confirmé par email, aucun paiement immédiat.</p>
        <button class="btn-precommande" onclick="cartShowCheckout()">Valider ma commande →</button>
    `;
}

// ---------- Étape 2 : coordonnées ----------
function cartShowCheckout() {
    const body = document.getElementById('cart-drawer-body');
    if (!body) return;
    const items = cartGet();
    if (items.length === 0) return;

    const needsAjustementInfo = items.some(item => {
        const r = cartResolveItem(item);
        return r && r.family.ajustementSunnah;
    });
    const needsReception = items.some(item => {
        const r = cartResolveItem(item);
        return r && r.family.prixLivraison;
    });

    body.innerHTML = `
        <button type="button" class="cart-back-btn" onclick="cartRenderBody()">← Retour au panier</button>
        <h3 class="cart-checkout-title">Vos coordonnées</h3>
        <form id="cartCheckoutForm" class="order-modal-form">
            <div class="order-modal-row">
                <div class="form-group">
                    <label class="form-label">Prénom & Nom</label>
                    <input type="text" class="form-control" id="c-nom" required placeholder="Ahmed Dupont">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-control" id="c-email" required placeholder="vous@email.com">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Téléphone</label>
                <input type="tel" class="form-control" id="c-tel" required placeholder="+33 6 00 00 00 00">
            </div>

            ${needsAjustementInfo ? `
            <div class="order-modal-row">
                <div class="form-group">
                    <label class="form-label">Votre taille (cm)</label>
                    <input type="number" class="form-control" id="c-taille-cm" min="100" max="230" placeholder="175">
                </div>
                <div class="form-group">
                    <label class="form-label">Votre poids (kg)</label>
                    <input type="number" class="form-control" id="c-poids-kg" min="20" max="250" placeholder="70">
                </div>
            </div>
            <p class="product-note" style="text-align:left;margin-top:-0.5rem;">Pour mieux vous conseiller sur la taille à choisir.</p>` : ''}

            ${needsReception ? `
            <div class="form-group">
                <label class="form-label">Mode de réception</label>
                <label class="reception-option"><input type="radio" name="c-reception" value="propre" checked><span>Remise en main propre</span></label>
                <label class="reception-option"><input type="radio" name="c-reception" value="livraison"><span>Livraison</span></label>
            </div>` : ''}

            <div class="form-group">
                <label class="form-label">Adresse</label>
                <input type="text" class="form-control" id="c-adresse" required placeholder="12 rue des Lilas">
            </div>
            <div class="order-modal-row">
                <div class="form-group">
                    <label class="form-label">Code postal</label>
                    <input type="text" class="form-control" id="c-codepostal" required placeholder="75001">
                </div>
                <div class="form-group">
                    <label class="form-label">Ville</label>
                    <input type="text" class="form-control" id="c-ville" required placeholder="Paris">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Pays</label>
                <input type="text" class="form-control" id="c-pays" required placeholder="France">
            </div>

            <button type="submit" class="btn-precommande" id="cart-submit-btn">Confirmer la commande →</button>
            <p class="product-note">Vous recevrez un email de confirmation. Paiement après contact.</p>
        </form>
    `;

    document.getElementById('cartCheckoutForm').addEventListener('submit', cartSubmitOrder);
}

// ---------- Envoi ----------
async function cartSubmitOrder(e) {
    e.preventDefault();

    const tailleCmEl = document.getElementById('c-taille-cm');
    const poidsKgEl = document.getElementById('c-poids-kg');
    if (tailleCmEl && tailleCmEl.value && (tailleCmEl.value < 100 || tailleCmEl.value > 230)) {
        alert('Merci de renseigner une taille réaliste, entre 100 et 230 cm.');
        return;
    }
    if (poidsKgEl && poidsKgEl.value && (poidsKgEl.value < 20 || poidsKgEl.value > 250)) {
        alert('Merci de renseigner un poids réaliste, entre 20 et 250 kg.');
        return;
    }

    const btn = document.getElementById('cart-submit-btn');
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    const receptionRadio = document.querySelector('input[name="c-reception"]:checked');
    const modeReception = receptionRadio ? (receptionRadio.value === 'livraison' ? 'Livraison' : 'Remise en main propre') : '';

    const items = cartGet().map(item => {
        const resolved = cartResolveItem(item);
        if (!resolved) return null;
        const { family, color } = resolved;
        const prix = (modeReception === 'Livraison' && family.prixLivraison) ? family.prixLivraison : family.prix;
        return {
            nom: `${family.name}${family.cat === 'enfant' ? ' Enfant' : ''}`,
            couleur: color.label,
            taille: item.taille,
            quantite: item.quantity,
            ajustementSunnah: item.ajustementSunnah,
            prixUnitaire: prix
        };
    }).filter(Boolean);

    const payload = {
        items,
        nom: document.getElementById('c-nom').value,
        email: document.getElementById('c-email').value,
        tel: document.getElementById('c-tel').value,
        adresse: document.getElementById('c-adresse').value,
        codepostal: document.getElementById('c-codepostal').value,
        ville: document.getElementById('c-ville').value,
        pays: document.getElementById('c-pays').value,
        tailleCm: tailleCmEl ? tailleCmEl.value : '',
        poidsKg: poidsKgEl ? poidsKgEl.value : '',
        modeReception
    };

    try {
        const response = await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        if (data.success) {
            localStorage.removeItem(CART_STORAGE_KEY);
            cartUpdateBadge();

            const waLines = items.map(i => `- ${i.nom} (${i.couleur}, taille ${i.taille}) x${i.quantite} — ${i.prixUnitaire}`).join('\n');
            const waMessage = `Bonjour, je viens de passer une commande sur le site WAQĀR :\n${waLines}\n\nNom : ${payload.nom}\nMerci de me recontacter pour finaliser ma commande.`;
            const waLink = `https://wa.me/33743773555?text=${encodeURIComponent(waMessage)}`;

            document.getElementById('cart-drawer-body').innerHTML = `
                <div class="cart-success">
                    <p class="cart-success-title">Commande enregistrée ✦</p>
                    <p class="cart-success-text">Un email de confirmation vous a été envoyé.<br>Nous vous contacterons prochainement, incha'Allah.</p>
                    <a href="${waLink}" target="_blank" class="btn-whatsapp">Continuer sur WhatsApp →</a>
                    <p class="cart-total-note" style="margin-top:0.6rem;">Un message avec votre commande est déjà rédigé, il ne vous reste qu'à l'envoyer.</p>
                </div>
            `;
        } else {
            btn.textContent = 'Erreur — réessayez';
            btn.disabled = false;
        }
    } catch (err) {
        btn.textContent = 'Erreur — réessayez';
        btn.disabled = false;
    }
}

// ---------- Initialisation (sur chaque page) ----------
cartInjectPanel();
cartUpdateBadge();

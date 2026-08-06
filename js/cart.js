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

    if (typeof trackEvent === 'function') {
        trackEvent('Ajout panier', { produit: familyId, couleur: colorId, taille });
    }

    // Sur mobile, le panneau prend tout l'écran — on n'ouvre pas automatiquement
    // pour ne pas couper la navigation. On anime juste le badge, l'utilisateur
    // ouvre le panier quand il le souhaite. Sur desktop (simple panneau latéral,
    // moins intrusif), on ouvre directement comme avant.
    if (window.innerWidth <= 480) {
        cartPulseBadge();
    } else {
        cartOpen();
    }
}

function cartPulseBadge() {
    cartInjectPanel();
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    badge.classList.remove('cart-badge-pulse');
    void badge.offsetWidth; // force le reflow pour pouvoir rejouer l'animation
    badge.classList.add('cart-badge-pulse');
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
    if (typeof trackEvent === 'function') {
        trackEvent('Panier ouvert', { articles: cartCount() });
    }
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

            <div class="checkout-mode-choice">
                <label class="reception-option"><input type="radio" name="c-mode" value="precommande" checked><span>Être conseillé(e) avant de payer</span></label>
                <label class="reception-option"><input type="radio" name="c-mode" value="paypal"><span>Je suis sûr(e) de ma taille — Payer maintenant</span></label>
            </div>

            <div id="checkout-precommande-zone">
                <button type="submit" class="btn-precommande" id="cart-submit-btn">Confirmer la commande →</button>
                <p class="product-note">Vous recevrez un email de confirmation, puis nous vous contactons pour vous conseiller avant le paiement.</p>
            </div>

            <div id="checkout-paypal-zone" style="display:none;">
                <div id="paypal-button-container"></div>
                <p class="product-note" id="paypal-status-note">Paiement sécurisé, traité directement par PayPal.</p>
            </div>
        </form>
    `;

    document.getElementById('cartCheckoutForm').addEventListener('submit', cartSubmitOrder);

    if (typeof trackEvent === 'function') {
        trackEvent('Étape coordonnées atteinte', { articles: cartCount() });
    }

    const precommandeZone = document.getElementById('checkout-precommande-zone');
    const paypalZone = document.getElementById('checkout-paypal-zone');
    let paypalRendered = false;

    document.querySelectorAll('input[name="c-mode"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'paypal' && radio.checked) {
                precommandeZone.style.display = 'none';
                paypalZone.style.display = '';
                if (typeof trackEvent === 'function') {
                    trackEvent('Mode paiement choisi', { mode: 'paypal' });
                }
                if (!paypalRendered) {
                    paypalRendered = true;
                    cartRenderPaypalButton();
                }
            } else if (radio.checked) {
                precommandeZone.style.display = '';
                paypalZone.style.display = 'none';
                if (typeof trackEvent === 'function') {
                    trackEvent('Mode paiement choisi', { mode: 'precommande' });
                }
            }
        });
    });
}

// ---------- Paiement immédiat par PayPal ----------
let cartPaypalClientIdPromise = null;
let cartPaypalSdkPromise = null;

function cartGetPaypalClientId() {
    if (!cartPaypalClientIdPromise) {
        cartPaypalClientIdPromise = fetch('/api/paypal-config')
            .then(r => r.json())
            .then(d => {
                if (!d.clientId) throw new Error(d.error || 'PayPal non configuré');
                return d.clientId;
            });
    }
    return cartPaypalClientIdPromise;
}

function cartLoadPaypalSdk() {
    if (cartPaypalSdkPromise) return cartPaypalSdkPromise;
    cartPaypalSdkPromise = cartGetPaypalClientId().then(clientId => new Promise((resolve, reject) => {
        if (window.paypal) return resolve(window.paypal);
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=EUR&intent=capture`;
        script.onload = () => resolve(window.paypal);
        script.onerror = () => reject(new Error('Impossible de charger PayPal'));
        document.head.appendChild(script);
    }));
    return cartPaypalSdkPromise;
}

// Coordonnées + mode de réception communs aux 2 modes de paiement (précommande et PayPal).
function cartCollectFormPayload() {
    const form = document.getElementById('cartCheckoutForm');
    const tailleCmEl = document.getElementById('c-taille-cm');
    const poidsKgEl = document.getElementById('c-poids-kg');
    const receptionRadio = document.querySelector('input[name="c-reception"]:checked');
    const modeReception = receptionRadio ? (receptionRadio.value === 'livraison' ? 'Livraison' : 'Remise en main propre') : '';

    return {
        form,
        modeReception,
        nom: document.getElementById('c-nom').value,
        email: document.getElementById('c-email').value,
        tel: document.getElementById('c-tel').value,
        adresse: document.getElementById('c-adresse').value,
        codepostal: document.getElementById('c-codepostal').value,
        ville: document.getElementById('c-ville').value,
        pays: document.getElementById('c-pays').value,
        tailleCm: tailleCmEl ? tailleCmEl.value : '',
        poidsKg: poidsKgEl ? poidsKgEl.value : ''
    };
}

// Panier au format brut (IDs seulement) — le serveur recalcule tout, on ne lui
// envoie jamais de prix déjà calculé côté client.
function cartRawItemsForServer() {
    return cartGet().map(item => ({
        familyId: item.familyId,
        colorId: item.colorId,
        taille: item.taille,
        quantity: item.quantity,
        ajustementSunnah: item.ajustementSunnah
    }));
}

async function cartRenderPaypalButton() {
    const container = document.getElementById('paypal-button-container');
    const statusNote = document.getElementById('paypal-status-note');
    if (!container) return;

    try {
        const paypal = await cartLoadPaypalSdk();

        paypal.Buttons({
            style: { color: 'black', shape: 'rect', label: 'pay' },

            // Bloque le paiement tant que le formulaire (coordonnées) n'est pas valide.
            onClick: (data, actions) => {
                const { form } = cartCollectFormPayload();
                if (form && !form.checkValidity()) {
                    form.reportValidity();
                    return actions.reject();
                }
                return actions.resolve();
            },

            createOrder: async () => {
                const { modeReception } = cartCollectFormPayload();
                const response = await fetch('/api/paypal-create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: cartRawItemsForServer(), modeReception })
                });
                const data = await response.json();
                if (!data.id) throw new Error(data.error || 'Erreur PayPal');
                return data.id;
            },

            onApprove: async (data) => {
                statusNote.textContent = 'Paiement en cours de confirmation...';
                const payload = cartCollectFormPayload();
                const response = await fetch('/api/paypal-capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderID: data.orderID,
                        items: cartRawItemsForServer(),
                        modeReception: payload.modeReception,
                        nom: payload.nom,
                        email: payload.email,
                        tel: payload.tel,
                        adresse: payload.adresse,
                        codepostal: payload.codepostal,
                        ville: payload.ville,
                        pays: payload.pays,
                        tailleCm: payload.tailleCm,
                        poidsKg: payload.poidsKg
                    })
                });
                const result = await response.json();

                if (result.success) {
                    if (typeof trackEvent === 'function') {
                        trackEvent('Paiement PayPal réussi', { montant: result.montant });
                    }
                    localStorage.removeItem(CART_STORAGE_KEY);
                    cartUpdateBadge();
                    document.getElementById('cart-drawer-body').innerHTML = `
                        <div class="cart-success">
                            <p class="cart-success-title">Paiement confirmé ✦</p>
                            <p class="cart-success-text">Merci ${payload.nom} ! Votre paiement de ${result.montant} a bien été reçu.<br>Un email de confirmation vous a été envoyé.</p>
                        </div>
                    `;
                } else {
                    statusNote.textContent = result.error || 'Une erreur est survenue, merci de réessayer.';
                }
            },

            onCancel: () => {
                statusNote.textContent = 'Paiement annulé.';
                if (typeof trackEvent === 'function') {
                    trackEvent('Paiement PayPal annulé');
                }
            },

            onError: (err) => {
                console.error('Erreur PayPal:', err);
                statusNote.textContent = 'Une erreur est survenue avec PayPal, merci de réessayer.';
            }
        }).render('#paypal-button-container');
    } catch (err) {
        container.innerHTML = '';
        if (statusNote) statusNote.textContent = "Le paiement PayPal n'est pas disponible pour le moment.";
        console.error(err);
    }
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

    // Quantité totale d'articles éligibles à une offre du type "livraison offerte dès 2"
    // (ex: Sarouel Mizân) — permet d'honorer réellement la promo dans le prix facturé,
    // au lieu de se contenter de l'afficher dans le panier.
    const offerQty = cartGet().reduce((sum, item) => {
        const r = cartResolveItem(item);
        return sum + ((r && r.family.offre) ? item.quantity : 0);
    }, 0);

    const items = cartGet().map(item => {
        const resolved = cartResolveItem(item);
        if (!resolved) return null;
        const { family, color } = resolved;
        const livraisonOfferte = family.offre && offerQty >= 2;
        const prix = (modeReception === 'Livraison' && family.prixLivraison && !livraisonOfferte) ? family.prixLivraison : family.prix;
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
            if (typeof trackEvent === 'function') {
                trackEvent('Précommande envoyée', { articles: items.length });
            }
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

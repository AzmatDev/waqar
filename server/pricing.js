// ============================================================
// Recalcul du prix d'une commande CÔTÉ SERVEUR.
// Ne jamais faire confiance à un prix envoyé par le navigateur : un client
// pourrait modifier la requête et payer moins cher. On repart des seuls IDs
// (familyId/colorId) et on relit js/products-data.js, la même source que le site.
// ============================================================

const { productFamilies } = require('../js/products-data.js');

function parsePrice(str) {
    return parseFloat(String(str).replace(',', '.').replace(/[^\d.]/g, '')) || 0;
}

// items attendus : [{ familyId, colorId, taille, quantity, ajustementSunnah }]
// Reproduit exactement la logique de js/cart.js (cartSubmitOrder), y compris
// l'offre "livraison offerte dès 2" (ex: Sarouel Mizân).
function computeOrderTotal(items, modeReception) {
    let offerQty = 0;
    const resolved = items.map(item => {
        const family = productFamilies.find(f => f.id === item.familyId);
        if (!family) throw new Error(`Produit inconnu : ${item.familyId}`);
        const color = family.colors.find(c => c.id === item.colorId) || family.colors[0];
        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        if (family.offre) offerQty += quantity;
        return { family, color, quantity, taille: item.taille, ajustementSunnah: !!item.ajustementSunnah };
    });

    let total = 0;
    const lignes = resolved.map(r => {
        const livraisonOfferte = r.family.offre && offerQty >= 2;
        const prixStr = (modeReception === 'Livraison' && r.family.prixLivraison && !livraisonOfferte)
            ? r.family.prixLivraison
            : r.family.prix;
        total += parsePrice(prixStr) * r.quantity;
        return {
            nom: `${r.family.name}${r.family.cat === 'enfant' ? ' Enfant' : ''}`,
            couleur: r.color.label,
            taille: r.taille,
            quantite: r.quantity,
            ajustementSunnah: r.ajustementSunnah,
            prixUnitaire: prixStr
        };
    });

    return { total, lignes };
}

module.exports = { computeOrderTotal };

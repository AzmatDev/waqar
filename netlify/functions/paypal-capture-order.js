const { computeOrderTotal } = require('../../server/pricing.js');
const { paypalBase, getPayPalAccessToken } = require('../../server/paypal.js');
const { buildAndSendOrderEmails } = require('./send-mail.js');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Capture le paiement PayPal (débite réellement le client) puis envoie les
// mêmes emails de confirmation que la précommande, avec la mention "payé".
// Appelé par le bouton PayPal dans js/cart.js (callback onApprove).
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { orderID, items, modeReception, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg } = JSON.parse(event.body || '{}');

        if (!orderID) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'orderID manquant' }) };
        if (!Array.isArray(items) || items.length === 0) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Panier vide' }) };
        if (!nom || !email || !adresse) return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Coordonnées incomplètes' }) };

        const accessToken = await getPayPalAccessToken();
        const captureRes = await fetch(`${paypalBase()}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        const capture = await captureRes.json();

        if (!captureRes.ok || capture.status !== 'COMPLETED') {
            console.error('Erreur capture PayPal:', JSON.stringify(capture));
            return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Le paiement n'a pas pu être confirmé." }) };
        }

        const captureUnit = capture.purchase_units[0].payments.captures[0];
        const montant = `${captureUnit.amount.value.replace('.', ',')} €`;
        const reference = captureUnit.id;

        // Les libellés (nom produit, couleur...) sont reconstruits ici à partir des IDs,
        // exactement comme à la création — le MONTANT en revanche vient de la réponse
        // PayPal ci-dessus (source de vérité sur ce qui a réellement été payé).
        const { lignes } = computeOrderTotal(items, modeReception);

        await buildAndSendOrderEmails({
            items: lignes,
            nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg, modeReception,
            paiement: { status: 'confirmed', reference, montant }
        });

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ success: true, reference, montant }) };
    } catch (err) {
        console.error('ERREUR PAYPAL CAPTURE ORDER:', err.message, err.stack);
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
    }
};

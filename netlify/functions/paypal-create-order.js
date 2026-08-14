const { computeOrderTotal } = require('../../server/pricing.js');
const { paypalBase, getPayPalAccessToken } = require('../../server/paypal.js');

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
};

// Crée une commande PayPal pour le montant recalculé côté serveur.
// Appelé par le bouton PayPal dans js/cart.js (callback createOrder).
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const { items, modeReception } = JSON.parse(event.body || '{}');
        if (!Array.isArray(items) || items.length === 0) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Panier vide' }) };
        }

        const { total } = computeOrderTotal(items, modeReception);
        if (total <= 0) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Montant invalide' }) };
        }

        const accessToken = await getPayPalAccessToken();
        const orderRes = await fetch(`${paypalBase()}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    description: 'Commande WAQĀR',
                    amount: { currency_code: 'EUR', value: total.toFixed(2) }
                }]
            })
        });
        const order = await orderRes.json();

        if (!orderRes.ok) {
            console.error('Erreur création commande PayPal:', JSON.stringify(order));
            return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Erreur PayPal' }) };
        }

        return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ id: order.id }) };
    } catch (err) {
        console.error('ERREUR PAYPAL CREATE ORDER:', err.message, err.stack);
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: err.message }) };
    }
};

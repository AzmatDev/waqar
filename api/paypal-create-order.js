const { computeOrderTotal } = require('../server/pricing.js');
const { paypalBase, getPayPalAccessToken } = require('../server/paypal.js');

// Crée une commande PayPal pour le montant recalculé côté serveur.
// Appelé par le bouton PayPal dans js/cart.js (callback createOrder).
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { items, modeReception } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Panier vide' });
        }

        const { total } = computeOrderTotal(items, modeReception);
        if (total <= 0) return res.status(400).json({ error: 'Montant invalide' });

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
            return res.status(500).json({ error: 'Erreur PayPal' });
        }

        res.status(200).json({ id: order.id });
    } catch (err) {
        console.error('ERREUR PAYPAL CREATE ORDER:', err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};

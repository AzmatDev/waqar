const { computeOrderTotal } = require('../server/pricing.js');
const { paypalBase, getPayPalAccessToken } = require('../server/paypal.js');
const { buildAndSendOrderEmails } = require('./send-mail.js');

// Capture le paiement PayPal (débite réellement le client) puis envoie les
// mêmes emails de confirmation que la précommande, avec la mention "payé".
// Appelé par le bouton PayPal dans js/cart.js (callback onApprove).
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { orderID, items, modeReception, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg } = req.body;

        if (!orderID) return res.status(400).json({ error: 'orderID manquant' });
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Panier vide' });
        if (!nom || !email || !adresse) return res.status(400).json({ error: 'Coordonnées incomplètes' });

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
            return res.status(500).json({ error: "Le paiement n'a pas pu être confirmé." });
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
            paiement: { reference, montant }
        });

        res.status(200).json({ success: true, reference, montant });
    } catch (err) {
        console.error('ERREUR PAYPAL CAPTURE ORDER:', err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};

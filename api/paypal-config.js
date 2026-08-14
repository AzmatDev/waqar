// Fournit le Client ID PayPal (public par nature, prévu pour être exposé au
// navigateur) au JS du panier, sans avoir à le coder en dur dans js/cart.js —
// il suffit de le régler une seule fois dans les variables d'environnement Vercel.
module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    if (!process.env.PAYPAL_CLIENT_ID) {
        return res.status(500).json({ error: 'PAYPAL_CLIENT_ID non configuré côté serveur.' });
    }
    res.status(200).json({ clientId: process.env.PAYPAL_CLIENT_ID });
};

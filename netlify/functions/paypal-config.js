const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
};

// Fournit le Client ID PayPal (public par nature, prévu pour être exposé au
// navigateur) au JS du panier, sans avoir à le coder en dur dans js/cart.js —
// il suffit de le régler une seule fois dans les variables d'environnement Netlify.
exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers: CORS_HEADERS, body: '' };
    }
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    if (!process.env.PAYPAL_CLIENT_ID) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: 'PAYPAL_CLIENT_ID non configuré côté serveur.' }) };
    }
    return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify({ clientId: process.env.PAYPAL_CLIENT_ID }) };
};

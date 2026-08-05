// ============================================================
// Petits utilitaires PayPal côté serveur (auth + URL de base).
// Nécessite PAYPAL_CLIENT_ID et PAYPAL_CLIENT_SECRET en variables
// d'environnement Vercel. PAYPAL_ENV=live pour basculer en production
// (par défaut : sandbox, pour ne jamais risquer un vrai paiement pendant les tests).
// ============================================================

function paypalBase() {
    return process.env.PAYPAL_ENV === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken() {
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET manquants dans les variables d\'environnement.');
    }
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error_description || 'Erreur authentification PayPal');
    return data.access_token;
}

module.exports = { paypalBase, getPayPalAccessToken };

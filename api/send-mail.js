const nodemailer = require('nodemailer');

function getTransporter() {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'waqar.1447h@gmail.com',
            pass: process.env.MAIL_PASSWORD
        }
    });
}

// Construit et envoie les 2 emails (frère + client).
// `paiement` : null pour une précommande (comportement historique, paiement après
// contact) ou { reference, montant } si la commande a déjà été payée via PayPal —
// dans ce cas `montant` (déjà formaté, ex: "69,90 €") fait foi car il vient de la
// réponse PayPal, pas d'un calcul recalculé ici.
async function buildAndSendOrderEmails({ items, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg, modeReception, paiement }) {
    const transporter = getTransporter();
    const isPaid = !!paiement;

    let total = 0;
    const itemsRowsHtml = items.map(item => {
        const unitPrice = parseFloat(String(item.prixUnitaire).replace(',', '.').replace(/[^\d.]/g, '')) || 0;
        total += unitPrice * (item.quantite || 1);
        return `
                <tr>
                    <td style="padding:14px 20px;font-size:13px;border-bottom:1px solid #EDE8DF;">
                        <strong>${item.nom}</strong><br>
                        <span style="color:#8C887F;font-size:12px;">${item.couleur} · Taille ${item.taille}${item.ajustementSunnah ? ' · Ajustement Sunnah' : ''}</span>
                    </td>
                    <td style="padding:14px 20px;font-size:13px;border-bottom:1px solid #EDE8DF;text-align:center;">x${item.quantite}</td>
                    <td style="padding:14px 20px;font-size:13px;border-bottom:1px solid #EDE8DF;text-align:right;">${item.prixUnitaire}</td>
                </tr>`;
    }).join('');

    const itemsRowsPlain = items.map(item =>
        `- ${item.nom} (${item.couleur}, taille ${item.taille}${item.ajustementSunnah ? ', Ajustement Sunnah' : ''}) x${item.quantite} — ${item.prixUnitaire}`
    ).join('\n');

    const totalStr = isPaid ? paiement.montant : total.toFixed(2).replace('.', ',') + ' €';

    // Mail au frère
    await transporter.sendMail({
        from: '"WAQĀR" <waqar.1447h@gmail.com>',
        to: 'waqar.1447h@gmail.com',
        subject: `[WAQĀR] ${isPaid ? 'Commande PAYÉE ✅' : 'Nouvelle commande'} — ${nom}`,
        html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">${isPaid ? 'Commande payée via PayPal' : 'Nouvelle commande'}</p>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr style="background:#F5F1EA;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Client</td>
                    <td style="padding:16px 20px;font-size:14px;">${nom}</td>
                </tr>
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Email</td>
                    <td style="padding:16px 20px;font-size:14px;"><a href="mailto:${email}" style="color:#B8956A;">${email}</a></td>
                </tr>
                <tr style="background:#F5F1EA;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Téléphone</td>
                    <td style="padding:16px 20px;font-size:14px;">${tel}</td>
                </tr>
                ${modeReception ? `
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Réception</td>
                    <td style="padding:16px 20px;font-size:14px;">${modeReception}</td>
                </tr>` : ''}
                ${(tailleCm || poidsKg) ? `
                <tr style="background:#F5F1EA;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Gabarit client</td>
                    <td style="padding:16px 20px;font-size:14px;">${tailleCm ? tailleCm + ' cm' : '—'} · ${poidsKg ? poidsKg + ' kg' : '—'}</td>
                </tr>` : ''}
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Adresse</td>
                    <td style="padding:16px 20px;font-size:14px;">${adresse}, ${codepostal} ${ville}, ${pays}</td>
                </tr>
                ${isPaid ? `
                <tr style="background:#E8F5E9;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2E7D32;">Paiement</td>
                    <td style="padding:16px 20px;font-size:14px;color:#2E7D32;">✅ Payé via PayPal · réf. ${paiement.reference}</td>
                </tr>` : ''}
            </table>

            <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;margin:30px 0 10px;">Articles commandés</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
                ${itemsRowsHtml}
                <tr>
                    <td style="padding:14px 20px;font-size:13px;font-weight:bold;">${isPaid ? 'Total payé' : 'Total estimé'}</td>
                    <td></td>
                    <td style="padding:14px 20px;font-size:14px;font-weight:bold;text-align:right;">${totalStr}</td>
                </tr>
            </table>
            <p style="font-size:11px;color:#8C887F;">${isPaid ? 'Montant réellement débité, confirmé par PayPal.' : 'Montant indicatif — à confirmer avec le client (offres groupées, ajustements éventuels).'}</p>

            <p style="font-size:11px;color:#8C887F;text-align:center;border-top:1px solid #EDE8DF;padding-top:20px;margin-top:30px;">WAQĀR · ١٤٤٧ · Porter la Sunnah avec dignité</p>
        </div>
    `
    });

    // Mail au client
    await transporter.sendMail({
        from: '"WAQĀR" <waqar.1447h@gmail.com>',
        to: email,
        subject: isPaid ? 'WAQĀR — Paiement confirmé' : 'WAQĀR — Commande confirmée',
        html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">${isPaid ? 'Paiement confirmé' : 'Commande confirmée'}</p>

            <p style="font-size:16px;font-style:italic;margin-bottom:30px;">Barak Allahu fik ${nom},</p>
            <p style="font-size:14px;line-height:1.8;color:#5A5651;margin-bottom:30px;">${isPaid
                ? `Votre paiement de ${paiement.montant} a bien été reçu via PayPal (réf. ${paiement.reference}). Votre commande est confirmée, nous la préparons dès maintenant, incha'Allah.`
                : `Votre commande a bien été enregistrée. Nous vous contacterons prochainement pour le paiement et les détails d'expédition, incha'Allah.`}</p>

            <div style="background:#F5F1EA;padding:24px;margin-bottom:30px;">
                <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;margin-bottom:16px;">Récapitulatif</p>
                <pre style="font-family:Georgia,serif;font-size:13px;white-space:pre-wrap;margin:0 0 12px;">${itemsRowsPlain}</pre>
                <p style="font-size:14px;margin-bottom:8px;"><strong>${isPaid ? 'Total payé' : 'Total estimé'} :</strong> ${totalStr}</p>
                <p style="font-size:14px;"><strong>Adresse :</strong> ${adresse}, ${codepostal} ${ville}, ${pays}</p>
            </div>

            <p style="font-size:13px;font-style:italic;color:#B8956A;text-align:center;margin-bottom:30px;">« Porter la Sunnah avec dignité »</p>
            <p style="font-size:11px;color:#8C887F;text-align:center;border-top:1px solid #EDE8DF;padding-top:20px;">WAQĀR · ١٤٤٧</p>
        </div>
    `
    });

    return { totalStr };
}

async function handler(req, res) {
    // Gère le preflight CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { items, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg, modeReception } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Panier vide' });
    }

    try {
        await buildAndSendOrderEmails({ items, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg, modeReception, paiement: null });
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('ERREUR MAIL:', err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
}

module.exports = handler;
module.exports.buildAndSendOrderEmails = buildAndSendOrderEmails;

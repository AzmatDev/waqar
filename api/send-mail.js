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
// `paiement` :
//   - null → précommande (comportement historique, paiement après contact)
//   - { status: 'confirmed', reference, montant } → payé et vérifié automatiquement
//     via l'API PayPal (capture-order). `montant` fait foi, il vient de PayPal.
//   - { status: 'pending', montant } → client redirigé vers PayPal.Me, montant
//     attendu mais PAS vérifié automatiquement (pas d'API/webhook côté PayPal.Me) —
//     à confirmer manuellement par le frère à réception.
async function buildAndSendOrderEmails({ items, nom, email, tel, adresse, codepostal, ville, pays, tailleCm, poidsKg, modeReception, paiement }) {
    const transporter = getTransporter();
    const isConfirmedPaid = !!paiement && paiement.status === 'confirmed';
    const isPendingPaid = !!paiement && paiement.status === 'pending';
    const isPaid = isConfirmedPaid; // conservé pour compat avec le texte "précommande" par défaut

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

    const totalStr = (isConfirmedPaid || isPendingPaid) ? paiement.montant : total.toFixed(2).replace('.', ',') + ' €';

    const brotherSubjectTag = isConfirmedPaid ? 'Commande PAYÉE ✅' : (isPendingPaid ? 'Paiement PayPal.Me en cours ⏳' : 'Nouvelle commande');
    const brotherHeaderTag = isConfirmedPaid ? 'Commande payée via PayPal' : (isPendingPaid ? 'Paiement via PayPal.Me — à vérifier' : 'Nouvelle commande');

    // Mail au frère
    await transporter.sendMail({
        from: '"WAQĀR" <waqar.1447h@gmail.com>',
        to: 'waqar.1447h@gmail.com',
        subject: `[WAQĀR] ${brotherSubjectTag} — ${nom}`,
        html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">${brotherHeaderTag}</p>

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
                ${isConfirmedPaid ? `
                <tr style="background:#E8F5E9;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#2E7D32;">Paiement</td>
                    <td style="padding:16px 20px;font-size:14px;color:#2E7D32;">✅ Payé via PayPal · réf. ${paiement.reference}</td>
                </tr>` : ''}
                ${isPendingPaid ? `
                <tr style="background:#FFF4E5;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#B8860B;">Paiement</td>
                    <td style="padding:16px 20px;font-size:14px;color:#B8860B;">⏳ Client redirigé vers PayPal.Me — vérifiez la réception de ${paiement.montant} avant expédition.</td>
                </tr>` : ''}
            </table>

            <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;margin:30px 0 10px;">Articles commandés</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:10px;">
                ${itemsRowsHtml}
                <tr>
                    <td style="padding:14px 20px;font-size:13px;font-weight:bold;">${isConfirmedPaid ? 'Total payé' : (isPendingPaid ? 'Montant attendu (PayPal.Me)' : 'Total estimé')}</td>
                    <td></td>
                    <td style="padding:14px 20px;font-size:14px;font-weight:bold;text-align:right;">${totalStr}</td>
                </tr>
            </table>
            <p style="font-size:11px;color:#8C887F;">${isConfirmedPaid ? 'Montant réellement débité, confirmé par PayPal.' : (isPendingPaid ? "Montant NON vérifié automatiquement — contrôlez vous-même la réception sur PayPal avant d'expédier." : 'Montant indicatif — à confirmer avec le client (offres groupées, ajustements éventuels).')}</p>

            <p style="font-size:11px;color:#8C887F;text-align:center;border-top:1px solid #EDE8DF;padding-top:20px;margin-top:30px;">WAQĀR · ١٤٤٧ · Porter la Sunnah avec dignité</p>
        </div>
    `
    });

    const clientSubject = isConfirmedPaid ? 'WAQĀR — Paiement confirmé' : (isPendingPaid ? 'WAQĀR — Finalisez votre paiement' : 'WAQĀR — Commande confirmée');
    const clientHeaderTag = isConfirmedPaid ? 'Paiement confirmé' : (isPendingPaid ? 'Commande enregistrée' : 'Commande confirmée');
    const clientIntro = isConfirmedPaid
        ? `Votre paiement de ${paiement.montant} a bien été reçu via PayPal (réf. ${paiement.reference}). Votre commande est confirmée, nous la préparons dès maintenant, incha'Allah.`
        : (isPendingPaid
            ? `Votre commande a bien été enregistrée. Merci de finaliser votre paiement de ${paiement.montant} via le lien PayPal ouvert dans votre navigateur. Dès réception, nous préparons votre commande, incha'Allah.`
            : `Votre commande a bien été enregistrée. Nous vous contacterons prochainement pour le paiement et les détails d'expédition, incha'Allah.`);

    // Mail au client
    await transporter.sendMail({
        from: '"WAQĀR" <waqar.1447h@gmail.com>',
        to: email,
        subject: clientSubject,
        html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">${clientHeaderTag}</p>

            <p style="font-size:16px;font-style:italic;margin-bottom:30px;">Barak Allahu fik ${nom},</p>
            <p style="font-size:14px;line-height:1.8;color:#5A5651;margin-bottom:30px;">${clientIntro}</p>

            <div style="background:#F5F1EA;padding:24px;margin-bottom:30px;">
                <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;margin-bottom:16px;">Récapitulatif</p>
                <pre style="font-family:Georgia,serif;font-size:13px;white-space:pre-wrap;margin:0 0 12px;">${itemsRowsPlain}</pre>
                <p style="font-size:14px;margin-bottom:8px;"><strong>${isConfirmedPaid ? 'Total payé' : (isPendingPaid ? 'Montant à régler' : 'Total estimé')} :</strong> ${totalStr}</p>
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

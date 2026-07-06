const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
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

    const { nom, email, tel, modele, taille, adresse, codepostal, ville, pays, tailleCm, poidsKg, ajustementSunnah } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'waqar.1447h@gmail.com',
            pass: process.env.MAIL_PASSWORD
        }
    });

    try {
        // Mail au frère
        await transporter.sendMail({
            from: '"WAQĀR" <waqar.1447h@gmail.com>',
            to: 'waqar.1447h@gmail.com',
            subject: `[WAQĀR] Nouvelle précommande — ${nom}`,
            html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">Nouvelle précommande</p>
            
            <table style="width:100%;border-collapse:collapse;margin-bottom:30px;">
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
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Modèle</td>
                    <td style="padding:16px 20px;font-size:14px;font-weight:bold;">${modele}</td>
                </tr>
                <tr style="background:#F5F1EA;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Taille</td>
                    <td style="padding:16px 20px;font-size:14px;">${taille}</td>
                </tr>
                ${(tailleCm || poidsKg) ? `
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Gabarit client</td>
                    <td style="padding:16px 20px;font-size:14px;">${tailleCm ? tailleCm + ' cm' : '—'} · ${poidsKg ? poidsKg + ' kg' : '—'}</td>
                </tr>` : ''}
                ${ajustementSunnah ? `
                <tr style="background:#F5F1EA;">
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Ajustement Sunnah</td>
                    <td style="padding:16px 20px;font-size:14px;font-weight:bold;color:#B8956A;">Demandé (longueur, gratuit)</td>
                </tr>` : ''}
                <tr>
                    <td style="padding:16px 20px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;">Adresse</td>
                    <td style="padding:16px 20px;font-size:14px;">${adresse}, ${codepostal} ${ville}, ${pays}</td>
                </tr>
            </table>

            <p style="font-size:11px;color:#8C887F;text-align:center;border-top:1px solid #EDE8DF;padding-top:20px;">WAQĀR · ١٤٤٧ · Porter la Sunnah avec dignité</p>
        </div>
    `
        });

// Mail au client
        await transporter.sendMail({
            from: '"WAQĀR" <waqar.1447h@gmail.com>',
            to: email,
            subject: 'WAQĀR — Précommande confirmée',
            html: `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;color:#1C1C1C;">
            <h1 style="font-size:28px;font-weight:300;letter-spacing:4px;margin-bottom:4px;">WAQĀR</h1>
            <p style="color:#B8956A;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;">Précommande confirmée</p>

            <p style="font-size:16px;font-style:italic;margin-bottom:30px;">Barak Allahu fik ${nom},</p>
            <p style="font-size:14px;line-height:1.8;color:#5A5651;margin-bottom:30px;">Votre précommande a bien été enregistrée. Nous vous contacterons prochainement pour le paiement et les détails d'expédition, incha'Allah.</p>

            <div style="background:#F5F1EA;padding:24px;margin-bottom:30px;">
                <p style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8C887F;margin-bottom:16px;">Récapitulatif</p>
                <p style="font-size:14px;margin-bottom:8px;"><strong>Modèle :</strong> ${modele}</p>
                <p style="font-size:14px;margin-bottom:8px;"><strong>Taille :</strong> ${taille}</p>
                <p style="font-size:14px;"><strong>Adresse :</strong> ${adresse}, ${codepostal} ${ville}, ${pays}</p>
            </div>

            <p style="font-size:13px;font-style:italic;color:#B8956A;text-align:center;margin-bottom:30px;">« Porter la Sunnah avec dignité »</p>
            <p style="font-size:11px;color:#8C887F;text-align:center;border-top:1px solid #EDE8DF;padding-top:20px;">WAQĀR · ١٤٤٧</p>
        </div>
    `
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('ERREUR MAIL:', err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};
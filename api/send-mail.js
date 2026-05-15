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

    const { nom, email, tel, modele, taille, adresse, codepostal, ville, pays } = req.body;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'azmat.chwt@gmail.com',
            pass: process.env.MAIL_PASSWORD
        }
    });

    try {
        await transporter.sendMail({
            from: '"WAQĀR" <azmat.chwt@gmail.com>',
            to: 'azmat.chwt@gmail.com',
            subject: `[WAQĀR] Nouvelle précommande — ${nom}`,
            text: `NOUVELLE PRÉCOMMANDE\n\nClient : ${nom}\nEmail : ${email}\nTéléphone : ${tel}\n\nModèle : ${modele}\nTaille : ${taille}\n\nAdresse : ${adresse}\nCode postal : ${codepostal}\nVille : ${ville}\nPays : ${pays}`
        });

        await transporter.sendMail({
            from: '"WAQĀR" <azmat.chwt@gmail.com>',
            to: email,
            subject: 'WAQĀR — Précommande enregistrée',
            text: `Barak Allahu fik ${nom},\n\nVotre précommande a bien été enregistrée.\n\nRécapitulatif :\nModèle : ${modele}\nTaille : ${taille}\n\nNous vous contacterons prochainement, incha'Allah.\n\nWAQĀR`
        });

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('ERREUR MAIL:', err.message, err.stack);
        res.status(500).json({ error: err.message });
    }
};
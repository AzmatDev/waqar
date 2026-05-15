const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { nom, email, modele, taille, adresse, codepostal, ville, pays } = req.body;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'azmat.chwt@gmail.com',
            pass: process.env.MAIL_PASSWORD
        }
    });

    try {
        // Mail au frère
        await transporter.sendMail({
            from: 'azmat.chwt@gmail.com',
            to: 'azmat.chwt@gmail.com',
            subject: `[WAQĀR] Nouvelle précommande — ${nom}`,
            text: `NOUVELLE PRÉCOMMANDE\n\nClient : ${nom}\nEmail : ${email}\n\nModèle : ${modele}\nTaille : ${taille}\n\nAdresse : ${adresse}\nCode postal : ${codepostal}\nVille : ${ville}\nPays : ${pays}`
        });

        // Mail au client
        await transporter.sendMail({
            from: 'azmat.chwt@gmail.com',
            to: email,
            subject: 'WAQĀR — Précommande enregistrée',
            text: `Barak Allahu fik ${nom},\n\nVotre précommande a bien été enregistrée.\n\nRécapitulatif :\nModèle : ${modele}\nTaille : ${taille}\n\nNous vous contacterons prochainement pour le paiement et l'expédition, incha'Allah.\n\nWAQĀR\n« Porter la Sunnah avec dignité »`
        });

        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
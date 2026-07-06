// ============================================================
// DONNÉES PARTAGÉES — utilisées par index.html (script.js) et product.html (product.js)
// ============================================================

const collections = [
    {
        id: 'waqar',
        title: 'Collection WAQĀR 1447',
        sub: "Hommes et enfants. Pour la prière, le vendredi, le quotidien.",
        savezLabel: "L'esprit de WAQĀR 1447",
        savezTitle: `La Jubba — <em>l'habit du Prophète ﷺ</em>`,
        savezText1: "La Jubba est le vêtement long et ample que l'on porte par-dessus le Qamis. Contrairement à ce que certains pensent, le Prophète ﷺ portait lui-même des Jubbas — cela est prouvé dans les hadiths authentiques.",
        savezText2: "Ce n'est pas un simple vêtement traditionnel. C'est un habit de la Sunnah, chargé de sens et de noblesse.",
        savezQuote: '« Chaque Jubba que nous proposons est vérifiée selon les critères de la Sunnah. »',
        emptyMessage: "De nouvelles pièces WAQĀR arrivent bientôt, incha'Allah."
    },
    {
        id: 'istiqamah',
        title: 'Collection ISTIQĀMA 1448',
        sub: "Avancer avec droiture, à travers les vêtements du quotidien.",
        savezLabel: "L'esprit d'ISTIQĀMA",
        savezTitle: `Al-Istiqâma — <em>la droiture constante</em>`,
        savezText1: "L'Istiqâma désigne la constance sur le droit chemin : rester droit dans sa foi et ses actes, jour après jour, sans dévier.",
        savezText2: "Chaque pièce de cette collection est pensée pour accompagner cette constance au quotidien — sobre, pudique, et conforme aux critères de la Sunnah.",
        savezQuote: '« Dis : "Je crois en Allah", puis sois droit (istaqim). » — hadith rapporté par Sufyân ibn ʿAbdillah (Sahîh Muslim).',
        emptyMessage: "De nouvelles pièces ISTIQĀMA arrivent bientôt, incha'Allah."
    }
];

// Chaque "famille" = 1 produit (ex: "Jubba Adulte"), décliné en plusieurs couleurs.
// Chaque couleur peut avoir plusieurs photos (galerie/carousel sur la fiche produit).
const productFamilies = [
    {
        id: 'jubba-adulte',
        collection: 'waqar',
        cat: 'adulte',
        name: 'Jubba',
        prix: '69,90 €',
        matiere: '50% Lycra · 50% Coton',
        desc: "La Jubba adulte est taillée dans un tissu souple et léger, pensé pour être porté au quotidien comme pour la prière du vendredi. Sa coupe ample respecte scrupuleusement les critères de la Sunnah.",
        tailles: ['S', 'M', 'L', 'XL'],
        colors: [
            { id: 'noire', label: 'Noir', hex: '#1A1A1A', images: ['images/jubba_blk.png'] },
            { id: 'blanche', label: 'Blanc', hex: '#F0EDE8', images: ['images/jubba_wht.png'] }
        ]
    },
    {
        id: 'jubba-enfant',
        collection: 'waqar',
        cat: 'enfant',
        name: 'Jubba',
        prix: '44,90 €',
        matiere: '50% Lycra · 50% Coton',
        desc: "La Jubba enfant permet au fils de grandir dans la Sunnah dès le plus jeune âge. Même rigueur, même qualité, adaptée aux plus petits.",
        tailles: ['0-2 ans', '2-4 ans', '4-6 ans', '6-8 ans'],
        colors: [
            { id: 'noire', label: 'Noir', hex: '#1A1A1A', images: ['images/jubba_blk_enfant.jpeg'] },
            { id: 'gris', label: 'Gris clair', hex: '#C8C3BA', images: ['images/jubba_gris_enfant.jpg'] }
        ]
    },
    {
        // Prix et matière encore à préciser avec le frère.
        id: 'sarouel-adulte',
        collection: 'istiqamah',
        cat: 'adulte',
        name: 'Sarouel Mizân',
        prix: '59,90 €',
        prixNote: 'Remise en main propre',
        prixLivraison: '62,90 €',
        prixLivraisonNote: 'Livraison incluse',
        offre: {
            titre: 'Offre 2 sarouels',
            detail: '2 sarouels achetés = livraison offerte — soit 119,80 € au lieu de 125,80 €'
        },
        matiere: '',
        desc: "Le Sarouel Mizân, ample et confortable, conforme aux critères de pudeur de la Sunnah. Disponible en plusieurs coloris, avec possibilité d'Ajustement Sunnah — un ajustement gratuit de la longueur, sur simple demande.",
        tailles: ['S', 'M', 'L', 'XL'],
        // Valeurs à compléter dès que les mesures exactes sont disponibles ('—' = à venir)
        // Valeurs standards à titre indicatif (exemple donné par le frère) — à ajuster
        // dès que les vraies plages seront confirmées, pas de mesure précise par client.
        tailleGuide: {
            columns: ['Tour de taille (cm)'],
            rows: [
                { taille: 'S', values: ['76-84'] },
                { taille: 'M', values: ['84-92'] },
                { taille: 'L', values: ['92-100'] },
                { taille: 'XL', values: ['100-108'] }
            ]
        },
        ajustementSunnah: true, // proposé uniquement sur ce produit pour l'instant
        colors: [
            { id: 'beige', label: 'Beige', hex: '#D8C8AE', images: ['images/sarouel/beige-1.png', 'images/sarouel/beige-2.png', 'images/sarouel/beige-3.png', 'images/sarouel/beige-4.png'] },
            { id: 'kaki', label: 'Kaki', hex: '#6B6E4E', images: ['images/sarouel/kaki-1.png', 'images/sarouel/kaki-2.png', 'images/sarouel/kaki-3.png', 'images/sarouel/kaki-4.png'] },
            { id: 'noir', label: 'Noir', hex: '#1A1A1A', images: ['images/sarouel/noir-1.png', 'images/sarouel/noir-2.png', 'images/sarouel/noir-3.png'] },
            { id: 'gris-chine', label: 'Gris chiné', hex: '#8C8C8C', images: ['images/sarouel/gris-chine-1.png', 'images/sarouel/gris-chine-2.png', 'images/sarouel/gris-chine-3.png', 'images/sarouel/gris-chine-4.png'] },
            { id: 'bleu-marine', label: 'Bleu marine', hex: '#1B2A4A', images: ['images/sarouel/bleu-marine-1.png', 'images/sarouel/bleu-marine-2.png', 'images/sarouel/bleu-marine-3.png', 'images/sarouel/Bleu-marine-4.png'] }
        ]
    }
    // TODO : ajouter ici la 2e famille de produit de la collection ISTIQĀMA
    // (le "autre vêtement" mentionné par le frère) dès que ses infos seront connues.
    // Reprendre la même structure : { id, collection:'istiqamah', cat, name, prix, matiere, desc, tailles, colors }
];

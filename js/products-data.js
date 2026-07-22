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
    },
    {
        id: 'accessoires',
        title: 'Accessoires WAQĀR',
        sub: "Les détails qui accompagnent la Sunnah, jusque dans ce qui ne se voit pas.",
        savezLabel: "L'esprit des Accessoires",
        savezTitle: `La Wiqāya — <em>الوقاية, la protection</em>`,
        savezText1: "Il y a des accessoires qu'on porte. Et des accessoires qui nous définissent.",
        savezText2: "Chaque accessoire WAQĀR est choisi avec la même exigence que nos vêtements — y compris dans ce qui ne se voit pas au premier regard.",
        savezQuote: '« Pas de taille unique qui se détend, pas de taqiyya qui glisse pendant la prière. »',
        emptyMessage: "De nouveaux accessoires WAQĀR arrivent bientôt, incha'Allah."
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
            titre: 'Livraison offerte dès 2 sarouels',
            detail: 'Soit 119,80 € au lieu de 125,80 €'
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
        ajustementSunnah: 'optionnel',
        ajustementSunnahTexte: "Nous ajustons gratuitement la longueur du sarouel afin de dégager la cheville, conformément à la Sunnah. La coupe et l'ampleur du vêtement restent inchangées.",
        ajustementSunnahImage: 'images/sarouel/guide-longueur-sarouel.png',
        colors: [
            { id: 'beige', label: 'Beige', hex: '#D8C8AE', images: ['images/sarouel/beige-1.png', 'images/sarouel/beige-2.png', 'images/sarouel/beige-3.png', 'images/sarouel/beige-4.png'] },
            { id: 'kaki', label: 'Kaki', hex: '#6B6E4E', images: ['images/sarouel/kaki-1.png', 'images/sarouel/kaki-2.png', 'images/sarouel/kaki-3.png', 'images/sarouel/kaki-4.png'] },
            { id: 'noir', label: 'Noir', hex: '#1A1A1A', images: ['images/sarouel/noir-1.png', 'images/sarouel/noir-2.png', 'images/sarouel/noir-3.png'] },
            { id: 'gris-chine', label: 'Gris chiné', hex: '#8C8C8C', images: ['images/sarouel/gris-chine-1.png', 'images/sarouel/gris-chine-2.png', 'images/sarouel/gris-chine-3.png', 'images/sarouel/gris-chine-4.png'] },
            { id: 'bleu-marine', label: 'Bleu marine', hex: '#1B2A4A', images: ['images/sarouel/bleu-marine-1.png', 'images/sarouel/bleu-marine-2.png', 'images/sarouel/bleu-marine-3.png', 'images/sarouel/Bleu-marine-4.png'] }
        ]
    },
    {
        id: 'chemise-sakina-adulte',
        collection: 'istiqamah',
        cat: 'adulte',
        name: 'Chemise Sakīna',
        prix: '44,90 €',
        matiere: '100% Lin',
        desc: "La Chemise Sakīna, légère et respirante, taillée dans un lin 100% pour une allure pudique et confortable au quotidien. Col Hakim, coupe oversize, manches longues, sans poches.",
        tailles: ['S', 'M', 'L', 'XL'],
        ajustementSunnah: 'obligatoire',
        ajustementSunnahTexte: "Chaque Chemise Sakīna est ajustée sur la longueur des manches, conformément à la Sunnah. Seule la longueur des manches est concernée — la coupe générale ne change pas.",
        ajustementSunnahImage: 'images/sakina/guide-manches-chemise.png',
        colors: [
            { id: 'vert-sauge', label: 'Vert Sauge', hex: '#9CAF88', images: ['images/sakina/kaki-1.jpeg', 'images/sakina/kaki-2.jpeg', 'images/sakina/kaki-3.jpeg'] },
            { id: 'marron', label: "Marron terre d'ombre", hex: '#6F4E37', images: ['images/sakina/marron-1.jpeg', 'images/sakina/marron-2.jpeg', 'images/sakina/marron-3.jpeg'] },
            { id: 'beige-lin', label: 'Beige lin naturel', hex: '#E8DCC8', images: ['images/sakina/beige-1.jpeg', 'images/sakina/beige-2.jpeg', 'images/sakina/beige-3.jpeg'] }
        ]
    },
    {
        id: 'wiqaya',
        collection: 'accessoires',
        cat: 'adulte',
        name: 'La Wiqāya',
        prix: '14,90 €',
        matiere: 'Toile Coton · 1ère qualité',
        desc: "La Wiqāya n'est pas une simple taqiyya. Conçue pour l'homme qui ne fait aucun compromis sur la qualité, même dans ce qui ne se voit pas au premier regard. Toile tissée de première qualité — respirante, légère et durable, confortable en toutes saisons : elle garde la tête au frais en été et protège des courants d'air en hiver.",
        // Tailles = tour de tête exact en cm, pas de taille unique qui se détend.
        tailles: ['54', '55', '56', '57', '58', '59', '60'],
        colors: [
            { id: 'noir', label: 'Noir', hex: '#1A1A1A', images: ['images/wiqaya/noir-1.jpeg'] },
            { id: 'marron', label: 'Marron', hex: '#6F4E37', images: ['images/wiqaya/marron-1.jpeg'] },
            { id: 'vert', label: 'Vert', hex: '#3F4A34', images: ['images/wiqaya/vert-1.jpeg'] },
            { id: 'gris-anthracite', label: 'Gris Anthracite', hex: '#3A3A3A', images: ['images/wiqaya/gris-anthracite-1.jpeg'] },
            { id: 'blanc', label: 'Blanc', hex: '#E8E6E1', images: ['images/wiqaya/blanc-1.jpeg'] },
            { id: 'beige', label: 'Beige', hex: '#E4D9C4', images: ['images/wiqaya/beige-1.jpeg'] },
            { id: 'bleu-marine', label: 'Bleu marine', hex: '#1B2A4A', images: ['images/wiqaya/bleu-marine-1.jpeg'] }
        ]
    }
];

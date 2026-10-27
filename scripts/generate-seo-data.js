// Génère netlify/edge-functions/seo-data.json (données minimales pour l'Edge Function
// qui injecte titre / og / canonical / JSON-LD dans le HTML des pages produit et collection,
// afin que les aperçus WhatsApp, Instagram, iMessage les voient sans exécuter de JavaScript).
const fs = require('fs');
const path = require('path');
const { collections, productFamilies } = require('../js/products-data.js');

const data = {
    collections: Object.fromEntries(collections.map(c => [c.id, { title: c.title, sub: c.sub }])),
    families: Object.fromEntries(productFamilies.map(f => [f.id, {
        name: f.name,
        desc: f.desc,
        prix: f.prix,
        matiere: f.matiere,
        collection: f.collection,
        colors: f.colors.map(c => ({ id: c.id, image: (c.images || [])[0] || null }))
    }]))
};
fs.writeFileSync(path.join(__dirname, '..', 'netlify', 'edge-functions', 'seo-data.json'), JSON.stringify(data));
console.log('seo-data.json généré');

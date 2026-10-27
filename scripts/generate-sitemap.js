// Génère sitemap.xml à partir de js/products-data.js.
// À relancer (npm run sitemap) après l'ajout d'un produit ou d'une collection.
const fs = require('fs');
const path = require('path');
const { collections, productFamilies } = require('../js/products-data.js');

const SITE = 'https://waqar1447.com';
const urls = [`${SITE}/`];

// Une collection d'une seule pièce redirige vers sa fiche produit (collection.js) :
// on ne la liste pas, la fiche suffit.
for (const c of collections) {
    if (productFamilies.filter(f => f.collection === c.id).length > 1) {
        urls.push(`${SITE}/collection.html?c=${c.id}`);
    }
}
for (const f of productFamilies) urls.push(`${SITE}/product.html?id=${f.id}`);
for (const page of ['cgv.html', 'mentions-legales.html', 'confidentialite.html']) urls.push(`${SITE}/${page}`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.replace(/&/g, '&amp;')}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(__dirname, '..', 'sitemap.xml'), xml);
console.log(`sitemap.xml : ${urls.length} URL`);

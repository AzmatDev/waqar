// ============================================================
// SEO dynamique pour product.html / collection.html (pages génériques) :
// titre, description, canonical, balises og et JSON-LD mis à jour selon le produit
// ou la collection affichés. Google exécute le JS, mais les valeurs statiques du
// <head> servent de repli.
// ============================================================

const SEO_SITE = 'https://waqar1447.com';

function seoSetMeta(selector, create, value) {
    let el = document.head.querySelector(selector);
    if (!el) { el = create(); document.head.appendChild(el); }
    if (el.tagName === 'LINK') el.setAttribute('href', value);
    else el.setAttribute('content', value);
}

function seoMeta(attr, key) {
    return () => { const m = document.createElement('meta'); m.setAttribute(attr, key); return m; };
}

function seoApply({ title, description, path, image }) {
    const url = `${SEO_SITE}/${path}`;
    const img = image ? `${SEO_SITE}/${image}` : null;
    document.title = title;
    seoSetMeta('meta[name="description"]', seoMeta('name', 'description'), description);
    seoSetMeta('link[rel="canonical"]', () => { const l = document.createElement('link'); l.rel = 'canonical'; return l; }, url);
    seoSetMeta('meta[property="og:title"]', seoMeta('property', 'og:title'), title);
    seoSetMeta('meta[property="og:description"]', seoMeta('property', 'og:description'), description);
    seoSetMeta('meta[property="og:url"]', seoMeta('property', 'og:url'), url);
    if (img) seoSetMeta('meta[property="og:image"]', seoMeta('property', 'og:image'), img);
}

// Première phrase(s) du texte, coupée proprement vers 155 caractères
function seoSnippet(text) {
    const flat = String(text || '').replace(/\s+/g, ' ').trim();
    if (flat.length <= 155) return flat;
    const cut = flat.slice(0, 155);
    return cut.slice(0, Math.max(cut.lastIndexOf(' '), 100)).replace(/[,;:.\s]+$/, '') + '…';
}

function seoJsonLd(data) {
    let el = document.getElementById('seo-jsonld');
    if (!el) { el = document.createElement('script'); el.type = 'application/ld+json'; el.id = 'seo-jsonld'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(data);
}

function seoProduct(family, collection) {
    const images = family.colors.flatMap(c => (c.images || []).slice(0, 1)).map(i => `${SEO_SITE}/${i}`);
    const price = String(family.prix).replace(/[^\d,]/g, '').replace(',', '.');
    seoApply({
        title: `${family.name} — WAQĀR`,
        description: seoSnippet(family.desc),
        path: `product.html?id=${family.id}`,
        image: family.colors[0].images && family.colors[0].images[0]
    });
    seoJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: family.name,
        description: family.desc.replace(/\s+/g, ' ').trim(),
        image: images,
        brand: { '@type': 'Brand', name: 'WAQĀR' },
        material: family.matiere,
        category: collection ? collection.title : undefined,
        offers: {
            '@type': 'Offer',
            url: `${SEO_SITE}/product.html?id=${family.id}`,
            priceCurrency: 'EUR',
            price,
            availability: 'https://schema.org/PreOrder'
        }
    });
}

function seoCollection(collection) {
    const shortTitle = collection.title.replace(/^Collection\s+/i, '');
    seoApply({
        title: `${shortTitle} — WAQĀR`,
        description: seoSnippet(collection.sub),
        path: `collection.html?c=${collection.id}`
    });
}

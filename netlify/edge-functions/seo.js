// Edge Function : injecte les balises SEO / aperçu de lien dans le HTML de
// product.html et collection.html AVANT envoi. Les robots d'aperçu (WhatsApp, Instagram,
// iMessage…) n'exécutent pas le JavaScript ; sans ça ils verraient le texte générique.
// À la moindre erreur, on renvoie la page d'origine telle quelle (js/seo.js prend le relais).
import data from "./seo-data.json" with { type: "json" };

const SITE = "https://waqar1447.com";

const esc = s => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function snippet(text) {
    const flat = String(text || "").replace(/\s+/g, " ").trim();
    if (flat.length <= 155) return flat;
    const cut = flat.slice(0, 155);
    return cut.slice(0, Math.max(cut.lastIndexOf(" "), 100)).replace(/[,;:.\s]+$/, "") + "…";
}

function inject(html, { title, description, path, image, jsonLd }) {
    const url = `${SITE}/${path}`;
    html = html
        .replace(/<title>[\s\S]*?<\/title>/i, "")
        .replace(/<meta\s+name="description"[^>]*>/gi, "")
        .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
        .replace(/<meta\s+property="og:(title|description|url|image)"[^>]*>/gi, "");
    const block = [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}">`,
        `<link rel="canonical" href="${esc(url)}">`,
        `<meta property="og:title" content="${esc(title)}">`,
        `<meta property="og:description" content="${esc(description)}">`,
        `<meta property="og:url" content="${esc(url)}">`,
        image ? `<meta property="og:image" content="${esc(`${SITE}/${image}`)}">` : "",
        jsonLd ? `<script type="application/ld+json" id="seo-jsonld">${JSON.stringify(jsonLd).replace(/</g, "\u003c")}</script>` : ""
    ].join("\n    ");
    return html.replace(/<\/head>/i, `    ${block}\n</head>`);
}

export default async (request, context) => {
    const response = await context.next();
    try {
        const url = new URL(request.url);
        const ctype = response.headers.get("content-type") || "";
        if (response.status !== 200 || !ctype.includes("text/html")) return response;
        let html = await response.text();
        let meta = null;

        if (url.pathname.endsWith("/product.html") || url.pathname === "/product") {
            const f = data.families[url.searchParams.get("id")];
            if (f) {
                const color = f.colors.find(c => c.id === url.searchParams.get("color")) || f.colors[0];
                const images = f.colors.map(c => c.image).filter(Boolean).map(i => `${SITE}/${i}`);
                const id = url.searchParams.get("id");
                meta = {
                    title: `${f.name} — WAQĀR`,
                    description: snippet(f.desc),
                    path: `product.html?id=${id}`,
                    image: color && color.image,
                    jsonLd: {
                        "@context": "https://schema.org",
                        "@type": "Product",
                        name: f.name,
                        description: f.desc.replace(/\s+/g, " ").trim(),
                        image: images,
                        brand: { "@type": "Brand", name: "WAQĀR" },
                        material: f.matiere,
                        offers: {
                            "@type": "Offer",
                            url: `${SITE}/product.html?id=${id}`,
                            priceCurrency: "EUR",
                            price: String(f.prix).replace(/[^\d,]/g, "").replace(",", "."),
                            availability: "https://schema.org/PreOrder"
                        }
                    }
                };
            }
        } else if (url.pathname.endsWith("/collection.html") || url.pathname === "/collection") {
            const id = url.searchParams.get("c");
            const c = data.collections[id];
            if (c) {
                const first = Object.values(data.families).find(f => f.collection === id);
                meta = {
                    title: `${c.title.replace(/^Collection\s+/i, "")} — WAQĀR`,
                    description: snippet(c.sub),
                    path: `collection.html?c=${id}`,
                    image: first && first.colors[0] && first.colors[0].image
                };
            }
        }
        if (!meta) return new Response(html, response);
        const headers = new Headers(response.headers);
        headers.delete("content-length");
        return new Response(inject(html, meta), { status: 200, headers });
    } catch (e) {
        return response;
    }
};

export const config = { path: ["/product.html", "/collection.html"] };

# WAQĀR — Guide du projet

Site vitrine (pas de backend applicatif, pas de panier/paiement en ligne — les commandes se
finalisent par email/WhatsApp) pour une marque de vêtements homme/enfant conformes à la Sunnah.

## Stack

- HTML/CSS/JS statique, pas de framework, pas de build.
- `nodemailer` (seule dépendance npm) — utilisé pour l'envoi d'email de commande/contact,
  probablement via une fonction serverless (vérifier `api/` ou équivalent si présent).
- Animations : GSAP (`js/animation.js`).

## Architecture des données produits (le plus important)

Tout le catalogue est centralisé dans **[js/products-data.js](js/products-data.js)**, en deux
tableaux :

- `collections` — une entrée par collection (id, titres, textes narratifs "l'esprit de X",
  message si vide). Chaque collection a une histoire/thème (ex: Istiqāma = la droiture).
- `productFamilies` — une entrée par **produit** (pas par couleur). Chaque famille référence
  sa `collection` via l'id, a un `cat` (`adulte`/`enfant`), un prix, une matière, des tailles,
  et un tableau `colors` où chaque couleur a ses propres images (galerie).

Ce fichier est exposé à la fois au navigateur (`<script>` classique) et à Node
(`module.exports` en bas du fichier) — ne pas casser cette double compatibilité.

**`collection.html?c=<id>`** et **`product.html?id=<familyId>&color=<colorId>`** sont
génériques : ils lisent uniquement `products-data.js` via `js/collection.js` / `js/product.js`.
→ Ajouter une collection ou un produit = éditer `products-data.js`, jamais ces pages HTML.

Cas particulier : si une collection n'a qu'une seule famille de produit, `collection.js`
redirige automatiquement vers la fiche produit (pas de page de liste inutile).

## Images

Convention de dossier : `images/collection-<nom-collection>/<nom-produit>/<couleur>_<n>.ext`
(ou `<couleur>-<n>.ext` selon les collections plus anciennes — pas 100% uniforme, vérifier le
dossier existant avant d'ajouter). Formats mixtes `.png`/`.jpeg` selon les uploads d'origine.

## Page d'accueil (index.html)

La section `#collection` liste les collections en dur (cartes avec lien vers `collection.html`
ou directement `product.html` si single-produit). Une carte "Prochainement" sert de
placeholder pour la prochaine collection à venir — à remplacer quand une nouvelle collection
est prête plutôt que d'en ajouter une nouvelle.

## Conventions de nommage

- "Sarouel" (pas "Saroual") dans les textes/noms de produits affichés, même si un dossier
  d'images peut être nommé différemment.
- Chaque produit a un thème/texte narratif spirituel cohérent avec la collection — ne pas
  inventer de description sans confirmer le ton avec l'utilisateur (prix, matière, tailles
  sont des décisions business, jamais à deviner).

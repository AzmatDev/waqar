const products = [
    { id:1, cat:'adulte', name:'Jubba Noire', prixActuel:'69,90 €', img:'images/jubba_blk.png', desc:'La Jubba Noire adulte est taillée dans un tissu souple et léger, pensé pour être porté au quotidien comme pour la prière du vendredi. Sa coupe ample respecte scrupuleusement les critères de la Sunnah.' },
    { id:2, cat:'adulte', name:'Jubba Blanche', prixActuel:'69,90 €', img:'images/jubba_wht.png', desc:'La Jubba Blanche adulte incarne la pureté et la simplicité prophétique. Le Prophète ﷺ aimait le blanc — cette pièce en est le reflet, dans un tissu doux et respirant.' },
    { id:3, cat:'enfant', name:'Jubba Noire', prixActuel:'44,90 €', img:'images/jubba_blk_enfant.jpeg', desc:'La Jubba Noire enfant permet au fils de grandir dans la Sunnah dès le plus jeune âge. Même rigueur, même qualité, adaptée aux plus petits.' },
    { id:4, cat:'enfant', name:'Jubba Gris clair', prixActuel:'44,90 €', img:'images/jubba_gris_enfant.jpg', desc:'La Jubba Gris clair enfant offre une élégance sobre et naturelle. Une couleur douce, conforme aux teintes aimées du Prophète ﷺ.' }
];

// Lire l'id dans l'URL
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get('id')) || 1;
const current = products.find(p => p.id === id) || products[0];
// Après avoir défini current
const taillesContainer = document.getElementById('tailles-container');
const tailles = current.cat === 'enfant'
    ? ['0-2 ans', '2-4 ans', '4-6 ans', '6-8 ans']
    : ['S', 'M', 'L', 'XL'];

taillesContainer.innerHTML = tailles.map(t => `
    <button class="taille-btn" onclick="selectTaille(this)">${t}</button>
`).join('');

// Remplir les infos
document.getElementById('main-img').src = current.img;
document.getElementById('main-img').alt = current.name;
document.getElementById('product-title').textContent = current.name;
document.getElementById('product-prix').textContent = current.prixActuel;
document.getElementById('product-cat').textContent = current.cat === 'adulte' ? 'Jubba Adulte' : 'Jubba Enfant';
document.getElementById('product-desc').textContent = current.desc;
// Coloris
const coloris = current.cat === 'adulte'
    ? [{hex:'#1A1A1A', id:1}, {hex:'#F0EDE8', id:2}]
    : [{hex:'#1A1A1A', id:3}, {hex:'#C8C3BA', id:4}];

const colorisDiv = document.getElementById('product-coloris');
coloris.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'coloris-btn' + (c.id === id ? ' active' : '');
    btn.style.background = c.hex;
    btn.style.outline = c.hex === '#F0EDE8' || c.hex === '#C8C3BA' ? '1px solid #ddd' : 'none';
    btn.addEventListener('click', () => window.location.href = `product.html?id=${c.id}`);
    colorisDiv.appendChild(btn);
});
document.title = `WAQĀR — ${current.name}`;

// Taille
let tailleChoisie = '';
function selectTaille(btn) {
    document.querySelectorAll('.taille-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    tailleChoisie = btn.textContent;
}

// Précommander
function precommander() {
    if (!tailleChoisie) {
        alert('Veuillez choisir une taille.');
        return;
    }
    document.getElementById('modal-product-name').textContent = current.name;
    document.getElementById('modal-product-taille').textContent = 'Taille : ' + tailleChoisie;
    document.getElementById('orderModal').classList.add('open');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('open');
}

document.getElementById('orderModalForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('modal-submit-btn');
    btn.textContent = 'Envoi en cours...';
    btn.disabled = true;

    const nom      = document.getElementById('m-nom').value;
    const email    = document.getElementById('m-email').value;
    const tel = document.getElementById('m-tel').value;
    const adresse  = document.getElementById('m-adresse').value;
    const codepostal = document.getElementById('m-codepostal').value;
    const ville    = document.getElementById('m-ville').value;
    const pays     = document.getElementById('m-pays').value;
    const modele   = (current.cat === 'adulte' ? 'Jubba Adulte' : 'Jubba Enfant') + ' — ' + current.name.replace('Jubba ', '');

    try {
        const response = await fetch('/api/send-mail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, email, tel, modele, taille: tailleChoisie, adresse, codepostal, ville, pays })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('orderModalForm').style.display = 'none';
            document.getElementById('orderModalSuccess').style.display = 'block';
        } else {
            btn.textContent = 'Erreur — réessayez';
            btn.disabled = false;
        }
    } catch (err) {
        btn.textContent = 'Erreur — réessayez';
        btn.disabled = false;
    }
});

// Activer le bon bouton selon la catégorie actuelle
document.getElementById('btn-' + current.cat).classList.add('active');

function switchCat(cat) {
    const first = products.find(p => p.cat === cat);
    if (first) window.location.href = `product.html?id=${first.id}`;
}
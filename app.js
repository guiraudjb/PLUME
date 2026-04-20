let logoDataUrl = "";
const palettes = {
    // Marque de l'État
    marianne:  { main: '#6a6af4', sun: '#000091', bg: '#f5f5fe' }, // Bleu France
    rouge:     { main: '#e1000f', sun: '#c9191e', bg: '#fdf4f4' }, // Rouge Marianne

    // Couleurs Chaudes
    tuile:     { main: '#ce614a', sun: '#ad4847', bg: '#fde3e0' }, 
    macaron:   { main: '#e18b76', sun: '#8d533e', bg: '#fef4f2' }, 
    opera:     { main: '#c94668', sun: '#743242', bg: '#fef0f2' }, 
    carmin:    { main: '#c62828', sun: '#791818', bg: '#fdf2f3' }, 
    tournesol: { main: '#c8aa39', sun: '#716043', bg: '#fef6e3' }, 
    moutarde:  { main: '#c3992a', sun: '#695228', bg: '#fef5e8' },

    // Couleurs Froides
    ecume:     { main: '#465f9d', sun: '#2f4077', bg: '#e9edfe' }, 
    celadon:   { main: '#2b9487', sun: '#1b615a', bg: '#e4fdf6' },
    amethyste: { main: '#a558a0', sun: '#6e445a', bg: '#f3e6f3' }, 
    glycine:   { main: '#b340a0', sun: '#6e445a', bg: '#fee7fc' },

    // Couleurs Vertes / Nature
    emeraude:  { main: '#00a95f', sun: '#297254', bg: '#c3fad5' }, 
    menthe:    { main: '#009081', sun: '#37635f', bg: '#bafaee' }, 
    bourgeon:  { main: '#68a532', sun: '#447049', bg: '#e6feda' }, 
    fougere:   { main: '#348e4b', sun: '#1f542d', bg: '#dffdf7' },
    tilleul:   { main: '#b7a73f', sun: '#66673d', bg: '#fef7da' },

    // Tons Neutres
    terre:     { main: '#927c77', sun: '#50433f', bg: '#f6f5f5' }
};

function applyPalette() {
    const p = palettes[document.getElementById('cfg-palette').value];
    document.documentElement.style.setProperty('--theme-main', p.main);
    document.documentElement.style.setProperty('--theme-sun', p.sun);
    document.documentElement.style.setProperty('--theme-bg', p.bg);
}

function format(cmd, val = null) { document.execCommand(cmd, false, val); }

function insertHTML(html) { document.execCommand('insertHTML', false, html + '<p><br></p>'); }

function insertImage() {
    // 1. Création d'un sélecteur de fichier invisible
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp';

    // 2. Écoute de l'événement quand l'utilisateur a choisi une image
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Vérification de la taille (optionnel mais recommandé, ex: limite à 2 Mo)
        if (file.size > 2 * 1024 * 1024) {
            alert("L'image est trop volumineuse. Veuillez choisir une image de moins de 2 Mo.");
            return;
        }

        const reader = new FileReader();

        // 3. Quand l'image est lue, on l'injecte dans le HTML
        reader.onload = function(readerEvent) {
            const base64Data = readerEvent.target.result;
            
            // Formatage de l'image pour le DSFR et le format A4
            // Le conteneur Flex permet de centrer l'image
            // max-width: 100% empêche le débordement des marges
            const imgHTML = `
                <div style="display: flex; justify-content: center; margin: 1.5rem 0;" contenteditable="false">
                    <img src="${base64Data}" alt="Image d'illustration" style="max-width: 100%; max-height: 400px; object-fit: contain;">
                </div>
            `;
            
            // On utilise notre moteur d'insertion qui ajoute un paragraphe vide à la suite
            insertHTML(imgHTML);
        };

        // Lecture du fichier
        reader.readAsDataURL(file);
    };

    // Déclenche l'ouverture de la fenêtre Windows/Mac
    input.click();
}

function insertDivider() {
    // Remplacement du gris par var(--theme-sun) pour s'adapter dynamiquement
    // J'ai également passé l'épaisseur à 2px pour qu'elle soit plus visible et élégante
    const dividerHTML = `
        <hr style="border: none; border-top: 2px solid var(--theme-sun); margin: 2rem 0;">
    `;
    
    insertHTML(dividerHTML);
}

function insertPageBreak() {
    // 1. On crée une nouvelle feuille A4 (réutilise la fonction existante)
    addNewPage();
    
    // 2. On récupère toutes les pages (la nouvelle est forcément la dernière)
    const pages = document.querySelectorAll('.page-a4');
    const newPage = pages[pages.length - 1];
    
    // 3. On cible la zone de texte de cette nouvelle page
    const contentEditable = newPage.querySelector('.content-editable');
    
    // 4. Défilement fluide (Scroll) pour amener l'utilisateur sur la nouvelle page
    newPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // 5. Place le curseur actif dans la nouvelle zone de texte
    // Cela permet à l'utilisateur de continuer à taper sans devoir cliquer
    setTimeout(() => {
        contentEditable.focus();
    }, 500); // Léger délai pour laisser le temps au scroll de s'effectuer
}

function insertGrid(n) {
    let colsHTML = ''; 
    
    // On crée les blocs pour chaque colonne avec un texte d'attente
    for(let i = 0; i < n; i++) {
        colsHTML += `
            <div>
                <p><em>Texte de la colonne ${i+1}...</em></p>
            </div>
        `;
    }
    
    // L'astuce cruciale : on encapsule dans notre grille Flexbox
    const gridHTML = `
        <div class="custom-grid" contenteditable="false">
            <div style="display: flex; gap: 1.5rem; width: 100%;" contenteditable="true">
                ${colsHTML}
            </div>
        </div>
    `;
    
    // Notre fonction utilitaire insertHTML ajoute automatiquement un <p><br></p> après !
    // Cela garantit de toujours pouvoir cliquer SOUS les colonnes.
    insertHTML(gridHTML);
}
 
function insertTable() {
    // 1. Demande des dimensions
    const nbCols = parseInt(prompt("Nombre de colonnes :", "3"));
    const nbRows = parseInt(prompt("Nombre de lignes (hors entête) :", "2"));
    
    if (isNaN(nbCols) || isNaN(nbRows)) return;

    // 2. Demande du style d'entête
    const choix = prompt(
        "Style d'entête :\n" +
        "1 : Colonnes uniquement (Haut)\n" +
        "2 : Lignes uniquement (Gauche)\n" +
        "3 : Les deux (Colonnes et Lignes)\n" +
        "4 : Aucun", 
        "1"
    );

    if (choix === null) return;

    const hasColHeader = (choix === "1" || choix === "3");
    const hasRowHeader = (choix === "2" || choix === "3");

    let tableHTML = `<div class="fr-table" contenteditable="false">`;
    tableHTML += `<table>`;

    // --- CONSTRUCTION DE L'ENTÊTE DE COLONNE ---
    if (hasColHeader) {
        tableHTML += `<thead><tr>`;
        for (let c = 0; c < nbCols; c++) {
            tableHTML += `<th scope="col" contenteditable="true">Entête</th>`;
        }
        tableHTML += `</tr></thead>`;
    }

    // --- CONSTRUCTION DU CORPS DU TABLEAU ---
    tableHTML += `<tbody contenteditable="true">`;
    for (let r = 0; r < nbRows; r++) {
        tableHTML += `<tr>`;
        for (let c = 0; c < nbCols; c++) {
            if (c === 0 && hasRowHeader) {
                tableHTML += `<th scope="row">Ligne ${r+1}</th>`;
            } else {
                tableHTML += `<td>-</td>`;
            }
        }
        tableHTML += `</tr>`;
    }
    tableHTML += `</tbody></table></div>`;

    insertHTML(tableHTML);
}

function insertSommaire() {
    // La structure est simplifiée au maximum pour laisser le CSS travailler
    const sommaireHTML = `
        <nav class="fr-summary" role="navigation" contenteditable="false">
            <p class="fr-summary__title">Au sommaire de ce numéro</p>
            <ol contenteditable="true">
                <li>Titre du premier article</li>
                <li>Titre du deuxième article</li>
                <li>Titre du troisième article</li>
            </ol>
        </nav>
    `;
    
    insertHTML(sommaireHTML);
}

function insertCallout() {
    insertHTML(`<div class="fr-callout"><h3 class="fr-callout__title">Exergue</h3><p class="fr-callout__text">Contenu important.</p></div>`);
}

function insertCitation() {
    // 1. Demande à l'utilisateur s'il souhaite une image
    const wantsPhoto = confirm("Voulez-vous ajouter une photo de l'auteur à cette citation ?\n(Cliquez sur OK pour choisir une image, ou Annuler pour du texte seul)");

    if (wantsPhoto) {
        // --- CAS 1 : AVEC PHOTO ---
        
        // 2. NOUVEAU : Demande de quel côté placer la photo
        const position = prompt(
            "Position de la photo :\n" +
            "1 : À gauche (par défaut)\n" +
            "2 : À droite", 
            "1"
        );
        
        // Si l'utilisateur annule cette étape, on annule toute l'insertion
        if (position === null) return;
        
        const photoOnRight = (position === "2");

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg, image/webp';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Sécurité taille (max 2Mo)
            if (file.size > 2 * 1024 * 1024) {
                alert("L'image est trop lourde. Veuillez choisir une image de moins de 2 Mo.");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(readerEvent) {
                const photoUrl = readerEvent.target.result;
                
                // --- CONSTRUCTION DYNAMIQUE DU HTML ---
                // On prépare les deux blocs (image et texte)
                const imgBlock = `<img src="${photoUrl}" alt="Portrait" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid var(--grey-900);">`;
                
                // Le bloc texte change légèrement de style selon le côté de l'image (border-left vs border-right)
                const textBlockStyle = photoOnRight 
                    ? `margin: 0; padding-right: 1.5rem; border-right: 4px solid var(--theme-sun); flex-grow: 1; text-align: right;` 
                    : `margin: 0; padding-left: 1.5rem; border-left: 4px solid var(--theme-sun); flex-grow: 1;`;

                const textBlock = `
                    <blockquote style="${textBlockStyle}" contenteditable="true">
                        <p style="font-size: 1.3rem; font-style: italic; font-weight: 700; color: #1e1e1e; margin-bottom: 0.75rem; line-height: 1.4;">
                            « Saisissez la déclaration ici. »
                        </p>
                        <footer style="font-size: 0.95rem; font-weight: 700; color: #666;">
                            — Prénom Nom, <span style="font-weight: normal; font-style: italic;">Fonction</span>
                        </footer>
                    </blockquote>
                `;
                
                // On assemble dans le bon ordre
                const contentHTML = photoOnRight ? textBlock + imgBlock : imgBlock + textBlock;

                const citationAvecPhoto = `
                    <div style="display: flex; gap: 1.5rem; align-items: flex-start; margin: 2rem 0 2rem 1rem;" contenteditable="false">
                        ${contentHTML}
                    </div>
                `;
                
                insertHTML(citationAvecPhoto);
            };
            reader.readAsDataURL(file);
        };
        input.click(); 
        
    } else {
        // --- CAS 2 : SANS PHOTO (Classique protégé) ---
        const citationClassique = `
            <div style="margin: 2rem 0 2rem 1rem;" contenteditable="false">
                <blockquote style="margin: 0; padding-left: 1.5rem; border-left: 4px solid var(--theme-sun);" contenteditable="true">
                    <p style="font-size: 1.3rem; font-style: italic; font-weight: 700; color: #1e1e1e; margin-bottom: 0.75rem; line-height: 1.4;">
                        « Saisissez la déclaration ou l'extrait de discours ici. »
                    </p>
                    <footer style="font-size: 0.95rem; font-weight: 700; color: #666;">
                        — Prénom Nom, <span style="font-weight: normal; font-style: italic;">Titre ou Fonction</span>
                    </footer>
                </blockquote>
            </div>
        `;
        insertHTML(citationClassique);
    }
}

function insertChiffreCle() {
    // Ajout de contenteditable="false" sur le conteneur parent
    // Ajout de contenteditable="true" sur le chiffre et le texte
    const chiffreCleHTML = `
        <div style="display: flex; align-items: center; gap: 1.5rem; margin: 2rem 0; padding: 1.5rem; background-color: var(--theme-bg); border-radius: 4px; border-left: 4px solid var(--theme-sun);" contenteditable="false">
            
            <div style="font-size: 3.5rem; font-weight: 800; color: var(--theme-sun); line-height: 1; min-width: max-content; outline: none;" contenteditable="true">
                +42%
            </div>
            
            <div style="font-size: 1.1rem; font-weight: 500; color: #1e1e1e; line-height: 1.4; outline: none;" contenteditable="true">
                <p style="margin: 0;"><strong>Libellé du chiffre clé.</strong> Expliquez ici la signification de cette statistique.</p>
            </div>
            
        </div>
    `;
    
    insertHTML(chiffreCleHTML);
}

function insertLink() {
    const url = prompt("Veuillez saisir l'URL du lien (ex: https://www.gouvernement.fr) :");
    
    // Si l'utilisateur annule ou laisse vide, on arrête tout
    if (!url) return; 

    // Sécurisation de l'URL : on ajoute https:// si l'utilisateur l'a oublié
    // (sauf s'il s'agit d'une adresse email avec mailto:)
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }

    // Récupération de la sélection actuelle
    const selection = window.getSelection();

    // S'il n'y a pas de texte sélectionné (le curseur clignote juste)
    if (selection.isCollapsed) {
        // On insère l'URL sous forme de texte cliquable grâce à notre fonction existante
        const linkHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        insertHTML(linkHTML);
    } else {
        // S'il y a du texte sélectionné, on utilise la commande native du navigateur
        document.execCommand('createLink', false, finalUrl);
        
        // Petite astuce pour forcer l'ouverture dans un nouvel onglet (target="_blank")
        // sur le lien que le navigateur vient juste de générer
        if (selection.anchorNode && selection.anchorNode.parentNode.tagName === 'A') {
            selection.anchorNode.parentNode.setAttribute('target', '_blank');
            selection.anchorNode.parentNode.setAttribute('rel', 'noopener noreferrer');
        }
    }
}

function syncMetadata() {
    document.querySelectorAll('.stamp-bureau').forEach(el => el.innerText = document.getElementById('cfg-bureau').value.toUpperCase());
    document.querySelectorAll('.stamp-titre').forEach(el => el.innerText = document.getElementById('cfg-titre').value.toUpperCase());
    document.querySelectorAll('.stamp-date').forEach(el => el.innerText = document.getElementById('cfg-date').value);
    document.querySelectorAll('.stamp-footer').forEach(el => el.innerText = document.getElementById('cfg-footer').value);
    document.querySelectorAll('.logo-bureau').forEach(img => { if(logoDataUrl) { img.src = logoDataUrl; img.style.display = 'block'; }});
}

function handleLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => { logoDataUrl = e.target.result; syncMetadata(); };
        reader.readAsDataURL(input.files[0]);
    }
}

function addNewPage() {
    const pageNum = document.querySelectorAll('.page-a4').length + 1;
    const newPage = document.getElementById('page-1').cloneNode(true);
    newPage.id = `page-${pageNum}`;
    newPage.querySelector('.content-editable').innerHTML = "<p><br></p>";
    newPage.querySelector('.page-num-display').innerText = `Page ${pageNum}`;
    document.getElementById('pages-container').appendChild(newPage);
    syncMetadata();
}

function saveJSON() {
    const state = {
        // Ajout de la palette manquante
        palette: document.getElementById('cfg-palette').value,
        
        // Aplatissement des métadonnées à la racine de l'objet
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        logo: logoDataUrl,
        
        // Sauvegarde des pages
        pages: Array.from(document.querySelectorAll('.content-editable')).map(el => el.innerHTML)
    };
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' }));
    a.download = 'newsletter.json'; 
    a.click();
}

function restoreJSON(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const state = JSON.parse(e.target.result);
            
            // 1. Restauration des réglages de la barre d'outils
            if (state.palette) document.getElementById('cfg-palette').value = state.palette;
            if (state.bureau) document.getElementById('cfg-bureau').value = state.bureau;
            if (state.titre) document.getElementById('cfg-titre').value = state.titre;
            if (state.date) document.getElementById('cfg-date').value = state.date;
            if (state.footer) document.getElementById('cfg-footer').value = state.footer;
            
            // Restauration du logo personnalisé s'il y en avait un
            logoDataUrl = state.logo || "";
            
            applyPalette(); // Applique les couleurs
            
            // 2. Restauration des pages A4
            if (state.pages && Array.isArray(state.pages)) {
                const container = document.getElementById('pages-container');
                container.innerHTML = ''; // Vide l'espace de travail actuel
                
                state.pages.forEach((pageContent, index) => {
                    const pageNum = index + 1;
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page-a4';
                    pageDiv.id = `page-${pageNum}`;
                    
                    // Reconstruit la structure stricte de la page
                    pageDiv.innerHTML = `
                        <button class="delete-page-btn" onclick="deletePage(this)">
                            <span class="fr-icon-delete-bin-line"></span> Supprimer la page
                        </button>
                        <div class="safe-area">
                            <div class="header-brand">
                                <div class="fr-header__brand">
                                    <div class="fr-header__logo">
                                        <p class="fr-logo">République<br>Française</p>
                                    </div>
                                </div>
                                <div class="custom-logo-container"><img class="logo-bureau" src="${logoDataUrl}" style="${logoDataUrl ? 'display:block;' : 'display:none;'}"></div>
                            </div>
                            
                            <div class="header-info">
                                <div class="stamp-bureau" style="font-weight:700; font-size:1rem;"></div>
                                <div class="doc-meta" style="display:flex; justify-content:space-between; font-weight:700; font-size:0.9rem">
                                    <span class="stamp-titre"></span>
                                    <span class="stamp-date"></span>
                                </div>
                            </div>
                            
                            <div class="content-editable" contenteditable="true">
                                ${pageContent}
                            </div>
                            
                            <div class="footer-wrapper">
                                <span class="stamp-footer"></span>
                                <span class="page-num-display">Page ${pageNum}</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(pageDiv);
                });
            }
            
            // 3. Resynchronisation globale (tamponnage des textes sur toutes les pages)
            syncMetadata();
            
            // Réinitialise l'input pour permettre de recharger le même fichier si besoin
            input.value = "";
            
        } catch (err) {
            alert("Erreur lors de la lecture du fichier de sauvegarde. Le fichier est peut-être corrompu.");
            console.error(err);
        }
    };
    
    // Lit le fichier en tant que texte
    reader.readAsText(file);
}

function scaleUI() {
    const ratio = Math.min((window.innerWidth - 100) / 794, 1);
    document.getElementById('pages-container').style.transform = `scale(${ratio})`;
}



function deletePage(btn) {
    const page = btn.closest('.page-a4');
    const totalPages = document.querySelectorAll('.page-a4').length;

    if (totalPages <= 1) {
        alert("Impossible de supprimer cette page : un document doit contenir au moins une page.");
        return;
    }

    if (confirm("⚠️ Êtes-vous sûr de vouloir supprimer cette page et tout son contenu ? Cette action est irréversible.")) {
        page.remove();
        renumberPages(); // Met à jour les numéros en bas de page
    }
}

/**
 * Recalcule les numéros de toutes les pages (footer et ID)
 */
function renumberPages() {
    const pages = document.querySelectorAll('.page-a4');
    pages.forEach((page, index) => {
        const pageNum = index + 1;
        
        // Met à jour l'ID technique
        page.id = `page-${pageNum}`;
        
        // Met à jour l'affichage visuel dans le pied de page
        const numDisplay = page.querySelector('.page-num-display');
        if (numDisplay) {
            numDisplay.innerText = `Page ${pageNum}`;
        }
    });
}

// =====================================================================
// INTERCEPTEUR DE COLLAGE (SPECIAL TABLEUR EXCEL / SHEETS)
// =====================================================================
document.addEventListener('paste', function(e) {
    // 1. On vérifie que l'on colle bien à l'intérieur de notre zone de travail
    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    // 2. Récupération des données brutes en texte simple
    const textData = (e.clipboardData || window.clipboardData).getData('text/plain');
    
    // 3. Détection d'un tableur : présence de tabulations (\t) ET de retours à la ligne (\n)
    const isSpreadsheet = textData.includes('\t') && textData.includes('\n');

    if (isSpreadsheet) {
        e.preventDefault(); // On bloque l'insertion catastrophique du navigateur

        const rows = textData.trim().split('\n');
        const activeElement = document.activeElement;
        const inExistingTable = activeElement.closest('table');

        let htmlClean = '';

        if (inExistingTable) {
            // --- CAS 1 : COLLAGE DANS UN TABLEAU EXISTANT ---
            rows.forEach(row => {
                if (row.trim() !== '') {
                    const cols = row.split('\t');
                    htmlClean += '<tr>';
                    cols.forEach(col => {
                        htmlClean += `<td>${col.trim()}</td>`;
                    });
                    htmlClean += '</tr>';
                }
            });
            document.execCommand('insertHTML', false, htmlClean);
            
        } else {
            // --- CAS 2 : COLLAGE DANS LE VIDE (CRÉATION D'UN NOUVEAU TABLEAU) ---
            
            // On pose la même question que lors de la création manuelle d'un tableau
            const choix = prompt(
                "Vous collez des données de tableur. Choisissez le style d'entête :\n" +
                "1 : Colonnes uniquement (Haut)\n" +
                "2 : Lignes uniquement (Gauche)\n" +
                "3 : Les deux (Colonnes et Lignes)\n" +
                "4 : Aucun", 
                "1"
            );

            // Si l'utilisateur clique sur Annuler, on stoppe l'action
            if (choix === null) return;

            const hasColHeader = (choix === "1" || choix === "3");
            const hasRowHeader = (choix === "2" || choix === "3");

            htmlClean += `<div class="fr-table" contenteditable="false">`;
            htmlClean += `<table contenteditable="true">`;
            
            let tbodyOpened = false;

            rows.forEach((row, rowIndex) => {
                if (row.trim() !== '') {
                    const cols = row.split('\t');
                    
                    // Si on est sur la première ligne ET qu'on a demandé des entêtes de colonnes
                    if (rowIndex === 0 && hasColHeader) {
                        htmlClean += `<thead><tr>`;
                        cols.forEach(col => {
                            htmlClean += `<th scope="col">${col.trim()}</th>`;
                        });
                        htmlClean += `</tr></thead>`;
                    } else {
                        // On ouvre le corps du tableau si ce n'est pas déjà fait
                        if (!tbodyOpened) {
                            htmlClean += `<tbody>`;
                            tbodyOpened = true;
                        }
                        
                        htmlClean += `<tr>`;
                        cols.forEach((col, colIndex) => {
                            // Si on est sur la première colonne ET qu'on a demandé des entêtes de lignes
                            if (colIndex === 0 && hasRowHeader) {
                                htmlClean += `<th scope="row">${col.trim()}</th>`;
                            } else {
                                htmlClean += `<td>${col.trim()}</td>`;
                            }
                        });
                        htmlClean += `</tr>`;
                    }
                }
            });
            
            if (tbodyOpened) htmlClean += `</tbody>`;
            htmlClean += `</table></div><p><br></p>`;
            
            document.execCommand('insertHTML', false, htmlClean);
        }
    }
});
// =====================================================================
// MODULE D'OUTILS FLOTTANTS POUR BLOCS COMPLEXES (CORBEILLE & REGLAGES)
// =====================================================================

// 1. Création du conteneur de la barre d'outils
const floatToolbar = document.createElement('div');
floatToolbar.style.cssText = `
    position: fixed;
    display: none;
    z-index: 10000;
    gap: 0.3rem;
    background-color: #fff;
    padding: 0.3rem;
    border: 1px solid var(--grey-900);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
`;

// 2. Bouton Redimensionner (Règle) - Apparaîtra uniquement sur les grilles
const resizeBtn = document.createElement('button');
resizeBtn.innerHTML = '📏';
resizeBtn.title = "Modifier la largeur des colonnes";
resizeBtn.style.cssText = `
    background-color: #f5f5fe;
    border: 1px solid var(--theme-sun);
    border-radius: 4px;
    width: 30px; height: 30px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
`;

// 3. Bouton Corbeille (Toujours présent)
const trashBtn = document.createElement('button');
trashBtn.innerHTML = '<span class="fr-icon-delete-bin-fill"></span>';
trashBtn.title = "Supprimer ce bloc";
trashBtn.style.cssText = `
    background-color: #ffe8e5;
    color: #e1000f;
    border: 1px solid #e1000f;
    border-radius: 4px;
    width: 30px; height: 30px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
`;

floatToolbar.appendChild(resizeBtn);
floatToolbar.appendChild(trashBtn);
document.body.appendChild(floatToolbar);

let hoveredBlock = null;
const blockSelectors = '.fr-table, .custom-grid, .fr-summary, .fr-callout, blockquote, hr, img, [contenteditable="false"]';

// 4. Traque de la souris (Mise à jour)
document.addEventListener('mousemove', function(e) {
    if (e.target === floatToolbar || floatToolbar.contains(e.target)) return;

    const editor = e.target.closest('.content-editable');
    if (!editor) { hideFloatToolbar(); return; }

    const block = e.target.closest(blockSelectors);

    if (block && editor.contains(block)) {
        if (hoveredBlock !== block) {
            hideFloatToolbar();
            hoveredBlock = block;
            hoveredBlock.classList.add('block-hover-focus');
            
            // NOUVEAU : On affiche la règle pour les grilles ET les tableaux
            if (hoveredBlock.classList.contains('custom-grid') || hoveredBlock.classList.contains('fr-table')) {
                resizeBtn.style.display = 'flex';
            } else {
                resizeBtn.style.display = 'none';
            }

            const rect = hoveredBlock.getBoundingClientRect();
            floatToolbar.style.top = (rect.top - 20) + 'px';
            floatToolbar.style.left = (rect.right - 40) + 'px';
            floatToolbar.style.display = 'flex';
        }
    } else {
        hideFloatToolbar();
    }
});

function hideFloatToolbar() {
    if (hoveredBlock) {
        hoveredBlock.classList.remove('block-hover-focus');
        hoveredBlock = null;
    }
    floatToolbar.style.display = 'none';
}

// 5. Actions des boutons
trashBtn.addEventListener('click', function() {
    if (hoveredBlock) {
        hoveredBlock.remove();
        hideFloatToolbar();
    }
});

resizeBtn.addEventListener('click', function() {
    if (!hoveredBlock) return;

    // --- CAS 1 : GRILLES FLEXBOX ---
    if (hoveredBlock.classList.contains('custom-grid')) {
        const gridInner = hoveredBlock.querySelector('div[style*="display: flex"]');
        if (!gridInner) return;
        
        const cols = Array.from(gridInner.children).filter(c => c.tagName === 'DIV');
        const n = cols.length;
        
        const input = prompt(
            `Répartition de vos ${n} colonnes (Grille).\nEntrez les proportions (ex: 30/70, ou 25 50 25) :`, 
            n === 2 ? "50/50" : "33/33/33"
        );
        
        if (!input) return;

        const parts = input.split(/[\/\-\+,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        
        if (parts.length === n) {
            cols.forEach((col, i) => {
                col.style.flex = parts[i];
                col.style.maxWidth = "none";
            });
        } else {
            alert(`Format invalide. Ce bloc contient ${n} colonnes, vous devez fournir ${n} valeurs.`);
        }
    }
    
    // --- CAS 2 : TABLEAUX HTML ---
    else if (hoveredBlock.classList.contains('fr-table')) {
        const table = hoveredBlock.querySelector('table');
        if (!table) return;

        // Compte le nombre de colonnes en regardant la première ligne disponible
        const firstRow = table.querySelector('tr');
        if (!firstRow) return;
        
        const n = firstRow.children.length;

        const input = prompt(
            `Répartition des ${n} colonnes (Tableau).\nEntrez les proportions (ex: 30/70, ou 20 60 20) :`, 
            n === 2 ? "50/50" : "33/33/33"
        );

        if (!input) return;

        const parts = input.split(/[\/\-\+,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));

        if (parts.length === n) {
            // Contrairement à Flexbox, un tableau a besoin de pourcentages stricts. 
            // On calcule donc le total pour faire la conversion automatiquement.
            const total = parts.reduce((sum, val) => sum + val, 0);

            // Cherche s'il y a déjà un groupe de colonnes, sinon on le crée
            let colgroup = table.querySelector('colgroup');
            if (!colgroup) {
                colgroup = document.createElement('colgroup');
                // On l'insère tout en haut du tableau
                table.insertBefore(colgroup, table.firstChild); 
            } else {
                colgroup.innerHTML = ''; // Nettoie les anciens réglages
            }

            // Applique les largeurs converties en pourcentages
            parts.forEach(part => {
                const col = document.createElement('col');
                const percentage = ((part / total) * 100).toFixed(2); // Garde 2 décimales (ex: 33.33%)
                col.style.width = `${percentage}%`;
                colgroup.appendChild(col);
            });
            
            // Force le navigateur à respecter strictement nos pourcentages
            table.style.tableLayout = 'fixed';

        } else {
            alert(`Format invalide. Ce tableau contient ${n} colonnes, vous devez fournir ${n} valeurs.`);
        }
    }
});

// Cache la barre d'outils lors du défilement
document.getElementById('pages-container').addEventListener('scroll', hideFloatToolbar);

window.onresize = scaleUI;
window.onload = () => { scaleUI(); applyPalette(); syncMetadata(); };

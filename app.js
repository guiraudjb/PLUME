let logoDataUrl = "";
const palettes = {
    // Marque de l'État
    marianne:     { main: '#6a6af4', sun: '#000091', bg: '#f5f5fe' }, // Bleu France
    rouge:        { main: '#e1000f', sun: '#c9191e', bg: '#fdf4f4' }, // Rouge Marianne

    // Couleurs Illustratives - Chaudes
    tuile:        { main: '#ce614a', sun: '#a94645', bg: '#fef4f3' }, // Pink Tuile (Corrigé)
    macaron:      { main: '#e18b76', sun: '#8d533e', bg: '#fef4f2' }, // Pink Macaron
    opera:        { main: '#c94668', sun: '#743242', bg: '#fef0f2' }, // Brown Opera
    terre_battue: { main: '#e4794a', sun: '#755348', bg: '#fee9e5' }, // Orange Terre Battue (Ajouté)
    tournesol:    { main: '#c8aa39', sun: '#716043', bg: '#fef6e3' }, // Yellow Tournesol
    moutarde:     { main: '#c3992a', sun: '#695228', bg: '#fef5e8' }, // Yellow Moutarde

    // Couleurs Illustratives - Froides / Violettes
    ecume:        { main: '#465f9d', sun: '#2f4077', bg: '#e9edfe' }, // Blue Écume
    cumulus:      { main: '#417dc4', sun: '#3558a2', bg: '#e6eefe' }, // Blue Cumulus (Ajouté)
    glycine:      { main: '#a558a0', sun: '#6e445a', bg: '#fee7fc' }, // Purple Glycine (Corrigé)

    // Couleurs Illustratives - Vertes / Nature
    emeraude:     { main: '#00a95f', sun: '#297254', bg: '#c3fad5' }, // Green Émeraude
    menthe:       { main: '#009081', sun: '#37635f', bg: '#bafaee' }, // Green Menthe
    archipel:     { main: '#009099', sun: '#006a6f', bg: '#e5fbfd' }, // Green Archipel (Remplace Céladon)
    bourgeon:     { main: '#68a532', sun: '#447049', bg: '#e6feda' }, // Green Bourgeon
    tilleul:      { main: '#b7a73f', sun: '#66673d', bg: '#fef7da' }, // Green Tilleul-Verveine

    // Couleurs Illustratives - Tons Neutres / Bruns
    cafe_creme:   { main: '#d1b781', sun: '#685c48', bg: '#f7ecce' }, // Brown Café Crème (Ajouté)
    caramel:      { main: '#c08c65', sun: '#855b48', bg: '#f3e2d9' }, // Brown Caramel (Ajouté)
    gris_galet:   { main: '#aea397', sun: '#6a6156', bg: '#f3ede5' }  // Beige Gris Galet (Remplace Terre)
};

function applyPalette() {
    const p = palettes[document.getElementById('cfg-palette').value];
    document.documentElement.style.setProperty('--theme-main', p.main);
    document.documentElement.style.setProperty('--theme-sun', p.sun);
    document.documentElement.style.setProperty('--theme-bg', p.bg);
    refreshAllCharts();
    if (typeof refreshAllMaps === 'function') {
        refreshAllMaps();
    }
}

function format(cmd, val = null) {
    enforceFocus();
    document.execCommand(cmd, false, val);
}

function insertHTML(html) { 
    enforceFocus();
    document.execCommand('insertHTML', false, html + '<p><br></p>'); 
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
    // 1. On capture l'état global (Palette, Titres, etc.)
    const state = {
        palette: document.getElementById('cfg-palette').value,
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        logo: logoDataUrl,
        pages: []
    };
    
    // 2. On traite chaque page une par une
    document.querySelectorAll('.page-a4').forEach(page => {
        // On crée un clone "fantôme" (non attaché au DOM visible)
        const clone = page.cloneNode(true);
        const editor = clone.querySelector('.content-editable');
        
        // --- LA PURGE (Le secret de la performance) ---
        // On repère toutes les images générées par nos outils
        const generatedImages = editor.querySelectorAll('.chart-container img, .map-container img');
        
        generatedImages.forEach(img => {
            // On vide le SRC (qui contient le Base64 massif)
            // On le remplace par un pixel transparent ou un placeholder léger
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        });
        
        // On sauvegarde le HTML purgé de ce clone
        state.pages.push({
            content: editor.innerHTML,
            isLandscape: page.classList.contains('landscape')
        });
    });
    
    // 3. Téléchargement (qui sera instantané maintenant)
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state)], { type: 'application/json' }));
    a.download = 'lettre-plume.json'; 
    a.click();
}

function restoreJSON(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) { // <-- AJOUT de 'async' pour pouvoir utiliser 'await'
        try {
            const state = JSON.parse(e.target.result);
            
            // 1. Restauration des réglages
            if (state.palette) document.getElementById('cfg-palette').value = state.palette;
            if (state.bureau) document.getElementById('cfg-bureau').value = state.bureau;
            if (state.titre) document.getElementById('cfg-titre').value = state.titre;
            if (state.date) document.getElementById('cfg-date').value = state.date;
            if (state.footer) document.getElementById('cfg-footer').value = state.footer;
            
            logoDataUrl = state.logo || "";
            applyPalette(); 
            
            // 2. Restauration du HTML (qui contient des cadres d'images vides)
            if (state.pages && Array.isArray(state.pages)) {
                const container = document.getElementById('pages-container');
                container.innerHTML = ''; 
                
                state.pages.forEach((pageData, index) => {
                    const pageNum = index + 1;
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page-a4';
                    pageDiv.id = `page-${pageNum}`;
                    
                    const rawContent = typeof pageData === 'string' ? pageData : pageData.content;
                    const pageContent = sanitizeHTML(rawContent); 
                    
                    const isLandscape = typeof pageData === 'object' ? pageData.isLandscape : false;
                    if (isLandscape) pageDiv.classList.add('landscape');
                    
                    const btnText = isLandscape ? "Portrait" : "Paysage";
                    const btnIcon = isLandscape ? "fr-icon-file-text-line" : "fr-icon-refresh-line";
                    const btnTitle = isLandscape ? "Repasser en mode Portrait" : "Passer en mode Paysage";

                    pageDiv.innerHTML = `
                        <div class="page-actions" contenteditable="false">
                            <button class="page-action-btn" onclick="toggleOrientation(this)" title="${btnTitle}">
                                <span class="${btnIcon}"></span> ${btnText}
                            </button>
                            <button class="page-action-btn delete" onclick="deletePage(this)" title="Supprimer la page">
                                <span class="fr-icon-delete-bin-line"></span> Supprimer
                            </button>
                        </div>
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
            
            syncMetadata();
            input.value = "";
            
            // --- LA MAGIE (Redessin dynamique) ---
            // On laisse le temps au navigateur d'afficher la page avec les cadres blancs
            // Puis on lance les moteurs pour repeindre les graphiques et les cartes
            setTimeout(async () => {
                refreshAllCharts();
                if (typeof refreshAllMaps === 'function') {
                    // On affiche un petit message dans la console pour le debug
                    console.log("Reconstruction des médias vectoriels en cours...");
                    await refreshAllMaps();
                }
            }, 100);
            
        } catch (err) {
            alert("Erreur lors de la lecture du fichier de sauvegarde. Le fichier est peut-être corrompu.");
            console.error(err);
        }
    };
    
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

function toggleOrientation(btn) {
    // 1. On cible la page parente
    const page = btn.closest('.page-a4');
    
    // 2. On bascule la classe CSS (Le vrai mécanisme d'orientation)
    const isLandscape = page.classList.toggle('landscape');
    
    // 3. UX : On met à jour l'interface du bouton
    if (isLandscape) {
        // Si on vient de passer en Paysage, le bouton propose de revenir en Portrait
        btn.innerHTML = '<span class="fr-icon-file-text-line"></span> Portrait';
        btn.title = "Repasser en mode Portrait";
    } else {
        // Si on vient de revenir en Portrait, le bouton propose de passer en Paysage
        btn.innerHTML = '<span class="fr-icon-refresh-line"></span> Paysage';
        btn.title = "Passer en mode Paysage";
    }
    
    // 4. Sécurité visuelle : on force le recalcul du zoom pour que la page reste bien cadrée à l'écran
    if (typeof scaleUI === 'function') scaleUI();
}

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
// CONFIGURATION DE SÉCURITÉ DOMPURIFY
// =====================================================================
const purifyConfig = {
    // On autorise explicitement les attributs dont notre éditeur a besoin
    ADD_ATTR: ['contenteditable', 'data-chart-config', 'data-map-config', 'target', 'rel', 'scope'],
    // On autorise les URI de type "data:" pour conserver vos images en Base64
    ALLOW_DATA_ATTR: true,
    // On s'assure de ne pas supprimer les iframes ou autres objets non sollicités
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    // Force target="_blank" et rel="noopener noreferrer" sur tous les liens pour la sécurité
    ADD_TAGS: ['a'] 
};

/**
 * Nettoie une chaîne HTML de tout code malveillant
 */
function sanitizeHTML(dirtyHtml) {
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(dirtyHtml, purifyConfig);
    }
    console.warn("⚠️ DOMPurify n'est pas chargé. Nettoyage ignoré.");
    return dirtyHtml; // Fallback par défaut
}


// =====================================================================
// MODULE DE MASQUAGE AUTOMATIQUE DE LA BARRE D'OUTILS (MODE ZEN)
// =====================================================================

const editorHeader = document.querySelector('.editor-header');
let idleTimer;

/**
 * Lance le compte à rebours avant le masquage
 */
function startIdleTimer() {
    clearTimeout(idleTimer);
    
    // Masque après 4 secondes (laisse le temps de lire au lancement de la page)
    idleTimer = setTimeout(() => {
        // Sécurité critique : on ne masque pas si la souris est sur la barre
        // ou si l'utilisateur est en train de taper dans un champ de réglage (Titre, Date...)
        if (!editorHeader.matches(':hover') && !editorHeader.matches(':focus-within')) {
            editorHeader.classList.add('toolbar-hidden');
        }
    }, 4000);
}

/**
 * Fait réapparaître la barre instantanément
 */
function wakeUpToolbar() {
    if (editorHeader.classList.contains('toolbar-hidden')) {
        editorHeader.classList.remove('toolbar-hidden');
    }
    // À chaque réveil, on relance le chronomètre
    startIdleTimer();
}

// 1. Détection des mouvements de souris sur toute la page
document.addEventListener('mousemove', function(e) {
    // Le bandeau République Française fait environ 90px de haut.
    // Si la souris remonte dans les 140 premiers pixels de l'écran, on déroule la barre.
    if (e.clientY < 140 || editorHeader.contains(e.target)) {
        wakeUpToolbar();
    }
});

// 2. Gestion de l'accessibilité au clavier (Focus)
editorHeader.addEventListener('focusin', wakeUpToolbar);
editorHeader.addEventListener('focusout', startIdleTimer);

// 3. Cas spécifique pour les écrans tactiles ou petits écrans
// Toucher le bandeau "République Française" réveille la barre d'outils
document.querySelector('.fr-header').addEventListener('click', wakeUpToolbar);

// 4. Déclenchement automatique dès l'ouverture de la page web
startIdleTimer();


// =====================================================================
// MODULE DE MÉMOIRE GLOBALE DU CURSEUR (SÉCURITÉ FOCUS)
// =====================================================================
let globalSavedRange = null;
let lastActiveEditor = null;

// 1. Le "Traqueur" : Mémorise la position à chaque clic ou frappe au clavier
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode; // Sécurité noeud texte

        const editor = container.closest('.content-editable');
        if (editor) {
            lastActiveEditor = editor;
            globalSavedRange = range.cloneRange();
        }
    }
});

// 2. Le "Garde du corps" : Fonction à appeler avant d'insérer quoi que ce soit
function enforceFocus() {
    const selection = window.getSelection();
    let isFocusedInEditor = false;

    // Vérifie si le curseur actuel est bien dans un éditeur
    if (selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;
        if (container.closest('.content-editable')) {
            isFocusedInEditor = true;
        }
    }

    // Si le curseur est perdu dans la nature (ex: clic sur un bouton de la barre)
    if (!isFocusedInEditor) {
        selection.removeAllRanges();

        if (globalSavedRange && lastActiveEditor && document.body.contains(lastActiveEditor)) {
            // Cas A : On restaure la dernière position connue
            selection.addRange(globalSavedRange);
        } else {
            // Cas B : L'utilisateur n'a jamais cliqué. On force le curseur dans la 1ère page.
            const firstEditor = document.querySelector('.content-editable');
            if (firstEditor) {
                const range = document.createRange();
                range.selectNodeContents(firstEditor);
                range.collapse(false); // Place le curseur tout à la fin
                selection.addRange(range);
            }
        }
    }
}

// =====================================================================
// INTERCEPTEUR DE COLLAGE (SPECIAL TABLEUR EXCEL / SHEETS / CALC)
// =====================================================================
document.addEventListener('paste', function(e) {
    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    const clipboardData = e.clipboardData || window.clipboardData;
    const textData = clipboardData.getData('text/plain');
    const htmlData = clipboardData.getData('text/html');
    
    // Détection d'une structure de type Tableur (Tabulations + Sauts de ligne)
    const isSpreadsheet = textData.includes('\t') && textData.includes('\n');

    // On vérifie immédiatement où se trouve le curseur de l'utilisateur
    const activeElement = document.activeElement;
    const inExistingTable = activeElement.closest('table');

    if (isSpreadsheet) {
        e.preventDefault(); // On bloque l'insertion catastrophique du navigateur

        // --- SÉCURITÉ : REFUS DE COLLER DANS UN TABLEAU EXISTANT ---
        if (inExistingTable) {
            alert("⚠️ Vous ne pouvez pas coller un tableau à l'intérieur d'un autre tableau.\nVeuillez cliquer sur une ligne vide en dehors du tableau pour coller vos données.");
            return; // On arrête tout immédiatement
        }

        // --- CRÉATION D'UN NOUVEAU TABLEAU ---
        const rows = textData.trim().split('\n');
        let htmlClean = '';
        
        const choix = prompt(
            "Vous collez des données de tableur. Choisissez le style d'entête :\n" +
            "1 : Colonnes uniquement (Haut)\n" +
            "2 : Lignes uniquement (Gauche)\n" +
            "3 : Les deux (Colonnes et Lignes)\n" +
            "4 : Aucun", 
            "1"
        );

        if (choix === null) return;

        const hasColHeader = (choix === "1" || choix === "3");
        const hasRowHeader = (choix === "2" || choix === "3");

        htmlClean += `<div class="fr-table" contenteditable="false">`;
        htmlClean += `<table contenteditable="true">`;
        
        let tbodyOpened = false;

        rows.forEach((row, rowIndex) => {
            if (row.trim() !== '') {
                const cols = row.split('\t');
                
                if (rowIndex === 0 && hasColHeader) {
                    htmlClean += `<thead><tr>`;
                    cols.forEach(col => {
                        htmlClean += `<th scope="col">${col.trim()}</th>`;
                    });
                    htmlClean += `</tr></thead>`;
                } else {
                    if (!tbodyOpened) {
                        htmlClean += `<tbody>`;
                        tbodyOpened = true;
                    }
                    
                    htmlClean += `<tr>`;
                    cols.forEach((col, colIndex) => {
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
        
        // Insertion sécurisée du tableau généré
        document.execCommand('insertHTML', false, sanitizeHTML(htmlClean));

    } else if (htmlData) {
        // --- SÉCURISATION DU COLLAGE CLASSIQUE (Texte, images, etc.) ---
        e.preventDefault(); 
        const cleanPaste = sanitizeHTML(htmlData);
        document.execCommand('insertHTML', false, cleanPaste);
    }
});

window.onresize = scaleUI;
window.onload = () => { scaleUI(); applyPalette(); syncMetadata(); };

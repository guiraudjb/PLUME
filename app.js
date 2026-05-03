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

// =====================================================================
// SYSTÈME DE NOTIFICATIONS (TOASTS DSFR)
// =====================================================================
/**
 * Affiche une notification non-bloquante en bas à droite de l'écran
 * @param {string} title - Titre en gras
 * @param {string} message - Texte d'explication
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 */
function showToast(title, message, type = 'info') {
    // 1. Création du conteneur global s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Création de l'alerte basée sur le DSFR
    const toast = document.createElement('div');
    // On utilise les classes natives .fr-alert et .fr-alert--[type]
    toast.className = `fr-alert fr-alert--${type} fr-alert--sm plume-toast`;
    
    toast.innerHTML = `
        <h3 class="fr-alert__title">${title}</h3>
        <p>${message}</p>
    `;

    // 3. Ajout à l'écran
    container.appendChild(toast);

    // 4. Disparition automatique après 4.5 secondes
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        // On attend la fin de l'animation CSS (0.3s) pour détruire le noeud HTML
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

function applyPalette() {
    const p = palettes[document.getElementById('cfg-palette').value];
    document.documentElement.style.setProperty('--theme-main', p.main);
    document.documentElement.style.setProperty('--theme-sun', p.sun);
    document.documentElement.style.setProperty('--theme-bg', p.bg);
    refreshAllCharts();
    if (typeof refreshAllMaps === 'function') {
        refreshAllMaps();
    }
    if (typeof refreshAllTimelines === 'function') refreshAllTimelines();
}

function updateColoredMargins() {
    const positions = ['top', 'bottom', 'left', 'right'];
    const pages = document.querySelectorAll('.page-a4');
    
    pages.forEach(page => {
        positions.forEach(pos => {
            const isChecked = document.getElementById(`cfg-margin-${pos}`).checked;
            if (isChecked) {
                page.classList.add(`has-margin-${pos}`);
            } else {
                page.classList.remove(`has-margin-${pos}`);
            }
        });
    });
}

function format(cmd, val = null) {
    enforceFocus();
    document.execCommand(cmd, false, val);
}

/**
 * Extrait les listes (ul, ol) qui sont anormalement coincées à l'intérieur d'un paragraphe.
 */
function fixInvalidListNesting() {
    // Petit délai (10ms) pour laisser le temps à execCommand de finir de générer le DOM corrompu
    setTimeout(() => {
        const editor = document.querySelector('.content-editable');
        if (!editor) return;

        // On cible toutes les listes (ul, ol) qui ont un paragraphe (<p>) comme parent direct
        const trappedLists = editor.querySelectorAll('p > ul, p > ol');
        
        trappedLists.forEach(list => {
            const invalidParentP = list.parentNode;
            
            // 1. On déplace la liste pour la mettre au même niveau que le paragraphe (juste avant lui)
            invalidParentP.parentNode.insertBefore(list, invalidParentP);
            
            // 2. Nettoyage : si le paragraphe d'origine est maintenant vide 
            // (ex: il ne contenait que la liste ou des sauts de ligne), on le détruit.
            if (invalidParentP.textContent.trim() === '' && invalidParentP.querySelectorAll('img').length === 0) {
                invalidParentP.remove();
            }
        });
    }, 10); // Le petit délai garantit que le navigateur a terminé son insertion native
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
    // Application de l'état des 4 marges
    const positions = ['top', 'bottom', 'left', 'right'];
    positions.forEach(pos => {
        if (document.getElementById(`cfg-margin-${pos}`).checked) {
            newPage.classList.add(`has-margin-${pos}`);
        } else {
            newPage.classList.remove(`has-margin-${pos}`);
        }
    });
    newPage.setAttribute('data-margin-text', document.getElementById('cfg-margin-text').value.toUpperCase());
    document.getElementById('pages-container').appendChild(newPage);
    syncMetadata();
}

// N'oubliez pas le mot-clé "async" ici :
async function saveJSON() {
    // 1. On capture l'état global (Palette, Titres, etc.)
    const state = {
        palette: document.getElementById('cfg-palette').value,
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        marginText: document.getElementById('cfg-margin-text').value,
        margins: {
            top: document.getElementById('cfg-margin-top').checked,
            bottom: document.getElementById('cfg-margin-bottom').checked,
            left: document.getElementById('cfg-margin-left').checked,
            right: document.getElementById('cfg-margin-right').checked
        },
        logo: logoDataUrl,
        pages: []
    };
    
    // 2. On traite chaque page une par une
    document.querySelectorAll('.page-a4').forEach(page => {
        // On crée un clone "fantôme" (non attaché au DOM visible)
        const clone = page.cloneNode(true);
        const editor = clone.querySelector('.content-editable');
        
        // --- LA PURGE (Le secret de la performance) ---
        // On repère toutes les images générées par nos outils (CORRECTION APPLIQUÉE ICI)
        const generatedImages = editor.querySelectorAll('.chart-container img, .plume-map-container img');
        
        generatedImages.forEach(img => {
            // On vide le SRC (qui contient le Base64 massif)
            // On le remplace par un pixel transparent ou un placeholder léger
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        });
        
        // On sauvegarde le HTML purgé de ce clone
        state.pages.push({
            
            //content: editor.innerHTML,
            content: sanitizePlumeHTML(editor.innerHTML),
            isLandscape: page.classList.contains('landscape')
        });
    });
    
    // 3. NOUVEAU TÉLÉCHARGEMENT (Fenêtre "Enregistrer sous")
    const jsonString = JSON.stringify(state, null, 2);
    
    // Génération d'un nom par défaut pertinent avec la date du jour
    const nomParDefaut = `lettre-plume-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.json`;
    
    // On appelle notre fonction utilitaire avec "await" pour attendre l'action de l'utilisateur
    await saveAsSafe(jsonString, nomParDefaut, 'application/json', '.json');
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
            if (state.marginText !== undefined) {
                    document.getElementById('cfg-margin-text').value = state.marginText;
                    updateMarginText(); // On applique visuellement le changement
            }
            if (state.margins) {
                if (state.margins.top !== undefined) document.getElementById('cfg-margin-top').checked = state.margins.top;
                if (state.margins.bottom !== undefined) document.getElementById('cfg-margin-bottom').checked = state.margins.bottom;
                if (state.margins.left !== undefined) document.getElementById('cfg-margin-left').checked = state.margins.left;
                if (state.margins.right !== undefined) document.getElementById('cfg-margin-right').checked = state.margins.right;
            }
                        
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
            updateColoredMargins(); // Applique les bordures colorées aux nouvelles pages
            updateMarginText();
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
                if (typeof refreshAllTimelines === 'function') await refreshAllTimelines();
            }, 100);
            
        } catch (err) {
            showToast("Fichier corrompu", "Erreur lors de la lecture de la sauvegarde.", "error");
            console.error(err);
        }
    };
    
    reader.readAsText(file);
}

function scaleUI() {
    const ratio = Math.min((window.innerWidth - 100) / 794, 1);
    document.getElementById('pages-container').style.transform = `scale(${ratio})`;
}

// Mise à jour de la fonction deletePage (app.js)
async function deletePage(btn) {
    const page = btn.closest('.page-a4');
    const totalPages = document.querySelectorAll('.page-a4').length;

    if (totalPages <= 1) {
        showToast("Action impossible", "Un document doit contenir au moins une page.", "warning");
        return;
    }

    const confirmed = await plumeModal({
        title: "Supprimer la page ?",
        message: "Êtes-vous sûr de vouloir supprimer cette page et tout son contenu ?\nCette action est irréversible.",
        confirmText: "Supprimer définitivement",
        cancelText: "Annuler"
    });

    if (confirmed) {
        page.remove();
        renumberPages();
        showToast("Succès", "La page a été supprimée.", "info");
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

function openTablePasteModal(rawData, savedRange) {
    // 1. Création de l'interface (On réutilise les styles de la modale Chart.js)
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 850px; max-width: 95vw; height: 60vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 260px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-table-line"></span> Import de tableau</h3>
                <p style="font-size: 0.8rem; margin: 0; color: #666;">Sélectionnez le format qui correspond à vos données copiées.</p>
                
                <div>
                    <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Style d'entête</label>
                    <select id="paste-table-header" class="fr-select">
                        <option value="col" selected>Colonnes uniquement (Haut)</option>
                        <option value="row">Lignes uniquement (Gauche)</option>
                        <option value="both">Colonnes et Lignes</option>
                        <option value="none">Aucun entête</option>
                    </select>
                </div>
                
                <div style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-paste-cancel">Annuler</button>
                    <button class="fr-btn" id="btn-paste-insert">Insérer</button>
                </div>
            </div>
            <div style="flex:1; padding: 1.5rem; background:#fff; overflow: auto; display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: #666; font-size: 0.9rem;">Aperçu du rendu :</h4>
                <div id="paste-table-preview" class="content-editable" onclick="event.stopPropagation()" style="flex: 1; border: 1px dashed var(--grey-900); padding: 1rem; border-radius: 4px; overflow: auto; background: transparent;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 2. Moteur de prévisualisation en temps réel
    function renderPreview() {
        const style = document.getElementById('paste-table-header').value;
        const hasColHeader = style === 'col' || style === 'both';
        const hasRowHeader = style === 'row' || style === 'both';

        let html = '<div class="fr-table" contenteditable="false"><table contenteditable="true">';
        let tbodyOpened = false;

        rawData.forEach((row, rowIndex) => {
            if (row.join('').trim() !== '') { // Ignore les lignes totalement vides
                if (rowIndex === 0 && hasColHeader) {
                    html += '<thead><tr>';
                    row.forEach(col => html += `<th scope="col">${col.trim()}</th>`);
                    html += '</tr></thead>';
                } else {
                    if (!tbodyOpened) { html += '<tbody>'; tbodyOpened = true; }
                    html += '<tr>';
                    row.forEach((col, colIndex) => {
                        if (colIndex === 0 && hasRowHeader) html += `<th scope="row">${col.trim()}</th>`;
                        else html += `<td>${col.trim()}</td>`;
                    });
                    html += '</tr>';
                }
            }
        });
        if (tbodyOpened) html += '</tbody>';
        html += '</table></div>';

        document.getElementById('paste-table-preview').innerHTML = html;
        return html; // Retourne le HTML pour l'insertion finale
    }

    // Premier affichage
    renderPreview();

    // Mise à jour au changement de la liste déroulante
    document.getElementById('paste-table-header').addEventListener('change', renderPreview);

    // 3. Actions des boutons
    document.getElementById('btn-paste-cancel').onclick = () => overlay.remove();

    document.getElementById('btn-paste-insert').onclick = () => {
        const finalHTML = renderPreview() + '<p><br></p>';
        overlay.remove();

        // On restaure précieusement le curseur là où l'utilisateur avait collé
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // Insertion sécurisée
        document.execCommand('insertHTML', false, sanitizeHTML(finalHTML));
    };
}



// =====================================================================
// INTERCEPTEUR DE COLLAGE (SPECIAL TABLEUR + NETTOYAGE STRICT)
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
        e.preventDefault(); 

        if (inExistingTable) {
            showToast("Collage refusé", "Vous ne pouvez pas coller un tableau dans un autre tableau.", "warning");
            return; 
        }

        // 1. On sauvegarde la position du curseur AVANT d'ouvrir la modale
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) {
            savedRange = selection.getRangeAt(0).cloneRange();
        }

        // 2. On transforme le texte brut en un tableau JavaScript propre (2 dimensions)
        const rows = textData.trim().split('\n').map(row => row.split('\t'));

        // 3. On ouvre notre Studio de prévisualisation !
        openTablePasteModal(rows, savedRange);

    } else if (htmlData) {
        // --- SÉCURISATION DU COLLAGE WEB/WORD (La Douane) ---
        e.preventDefault(); 
        
        let cleanPaste = htmlData;

        if (typeof DOMPurify !== 'undefined') {
            // Configuration ultra-stricte réservée au collage
            const pasteConfig = {
                // On préserve uniquement la structure sémantique
                ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                // On n'autorise QUE les liens
                ALLOWED_ATTR: ['href'],
                // On détruit tout le reste (styles en ligne, classes, IDs, divs, images externes)
                FORBID_TAGS: ['style', 'script', 'img', 'table', 'div', 'span', 'iframe', 'form', 'input'],
                FORBID_ATTR: ['style', 'class', 'id', 'data-chart-config', 'data-map-config']
            };

            // On nettoie le HTML
            cleanPaste = DOMPurify.sanitize(htmlData, pasteConfig);
            
            // Sécurité UX : On force les liens collés à s'ouvrir dans un nouvel onglet pour ne pas perdre l'éditeur
            cleanPaste = cleanPaste.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
        } else {
            console.warn("DOMPurify absent : repli sur l'importation en texte brut.");
            cleanPaste = textData.replace(/\n/g, '<br>');
        }

        document.execCommand('insertHTML', false, cleanPaste);
        
    } else if (textData) {
        // --- COLLAGE DEPUIS LE BLOC-NOTES (Texte pur) ---
        e.preventDefault();
        
        // On découpe le texte copié à chaque retour à la ligne (\n ou \r\n)
        const formattedText = textData
            .split(/\r?\n/)
            .map(line => {
                // Si la ligne est vide (double saut de ligne), on crée un paragraphe vide respectueux de la sémantique
                if (line.trim() === '') {
                    return '<p><br></p>';
                }
                // Sinon, on emballe la ligne dans un paragraphe
                return `<p>${line}</p>`;
            })
            .join(''); // On recolle le tout

        document.execCommand('insertHTML', false, formattedText);
    }
});

window.onresize = scaleUI;
// =====================================================================
// INITIALISATION ET CYCLE DE VIE DU NAVIGATEUR
// =====================================================================

window.onload = async () => { 
    scaleUI(); 
    applyPalette(); 
    syncMetadata();
    updateMarginText();

    const draft = localStorage.getItem('plume_draft_state');
    const timestamp = localStorage.getItem('plume_draft_timestamp');
    
    if (draft) {
        const draftDate = new Date(parseInt(timestamp)).toLocaleString('fr-FR', { 
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
        });
        
        const restore = await plumeModal({
            title: "Brouillon détecté",
            message: `Une session non sauvegardée du <strong>${draftDate}</strong> a été trouvée.\n\nVoulez-vous reprendre votre travail en cours ?`,
            confirmText: "Restaurer la session",
            cancelText: "Ignorer"
        });

        if (restore) {
            restoreDraftFromLocal(draft);
        } else {
            localStorage.removeItem('plume_draft_state');
            localStorage.removeItem('plume_draft_timestamp');
        }
    }

    setInterval(saveDraftToLocal, 30000);
};

// 3. Sauvegarde de sécurité au moment exact où l'utilisateur ferme l'onglet ou rafraîchit
window.addEventListener('beforeunload', () => {
    saveDraftToLocal();
});


// =====================================================================
// OPTIMISATION DE L'EXPORT PDF (Garantir les liens cliquables)
// =====================================================================
window.addEventListener('beforeprint', () => {
    // 1. On cherche la zone d'édition
    const editor = document.querySelector('.content-editable');
    if (editor) {
        // 2. On la fige pour que le navigateur la considère comme une page web normale
        editor.setAttribute('contenteditable', 'false');
    }
});

window.addEventListener('afterprint', () => {
    // 3. Dès que la fenêtre d'impression se ferme, on rend la main à l'utilisateur
    const editor = document.querySelector('.content-editable');
    if (editor) {
        editor.setAttribute('contenteditable', 'true');
    }
});

// =====================================================================
// NORMALISATION DE L'ÉDITEUR (Correction de la touche Entrée)
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    const editor = document.querySelector('.content-editable');
    if (!editor) return;

    // 1. On force le navigateur à TOUJOURS créer des paragraphes <p> (fini les <div> indésirables)
    document.execCommand('defaultParagraphSeparator', false, 'p');

    // 2. Interception intelligente de la touche Entrée
    editor.addEventListener('keydown', function(e) {
        
        if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    // On appelle l'Antidote pour générer la ligne vierge sous le bloc actuel
                    createVirginParagraph(selection.getRangeAt(0).startContainer, false);
                }
                return; 
            }
        
        if (e.key === 'Enter') {
            // Si l'utilisateur fait Maj + Entrée, on le laisse faire un simple saut de ligne <br>
            if (e.shiftKey) return;

            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const currentNode = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

            // --- A. Sortir d'un Titre (H1-H6) ---
            const heading = currentNode.closest('h1, h2, h3, h4, h5, h6');
            if (heading) {
                // Si on est à la toute fin du titre
                if (range.endOffset === range.startContainer.textContent.length || range.startContainer.textContent === '') {
                    e.preventDefault(); // On bloque le comportement par défaut
                    
                    // On crée un paragraphe vide en dessous
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    heading.parentNode.insertBefore(p, heading.nextSibling);
                    
                    // On y déplace le curseur
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    return;
                }
            }

            // --- B. Sortir d'une Citation (Blockquote) ---
            const blockquote = currentNode.closest('blockquote');
            
            // NOUVEAU : On vérifie si on est à l'intérieur d'une liste
            const inList = currentNode.closest('ul, ol');

            // Si on est dans un Blockquote ET qu'on n'est PAS dans une liste
            // (Si on est dans une liste, on laisse le navigateur gérer le double-Entrée pour en sortir proprement)
            if (blockquote && !inList) {
                // Si on tape Entrée sur une ligne vide à l'intérieur de la citation
                if (currentNode.textContent.trim() === '') {
                    e.preventDefault();
                    
                    // On crée un paragraphe normal
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    
                    // CORRECTION MAJEURE : On cherche le wrapper parent in-éditable
                    // S'il existe (ex: Citation avec photo), on insère APRES le wrapper.
                    // Sinon, on insère après le blockquote simple.
                    const lockedWrapper = blockquote.closest('[contenteditable="false"]');
                    const targetToBypass = lockedWrapper || blockquote;
                    
                    targetToBypass.parentNode.insertBefore(p, targetToBypass.nextSibling);
                    
                    // On supprime la ligne vide qui restait dans la citation
                    if (currentNode !== blockquote && currentNode.parentNode) {
                        currentNode.remove();
                    }
                    
                    // Si la citation entière est devenue vide, on la supprime carrément
                    // Attention à supprimer le wrapper complet si c'est un composant complexe
                    if (blockquote.textContent.trim() === '') {
                        targetToBypass.remove();
                    }

                    // On déplace le curseur dans le nouveau paragraphe libre
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    return;
                }
            }
        }
    });
});

// =====================================================================
// L'ANTIDOTE : GÉNÉRATEUR DE PARAGRAPHE 100% VIERGE
// =====================================================================
function createVirginParagraph(contextNode, appendToEnd = false) {
    let editor;
    let referenceNode = contextNode;

    if (appendToEnd) {
        editor = contextNode; // Dans ce cas, contextNode est l'éditeur lui-même
    } else {
        // Remonter à la racine absolue (enfant direct de l'éditeur) pour casser l'effet "Oignon"
        if (referenceNode.nodeType === 3) referenceNode = referenceNode.parentNode;
        while (referenceNode && referenceNode.parentNode && !referenceNode.parentNode.classList.contains('content-editable')) {
            referenceNode = referenceNode.parentNode;
        }
        editor = referenceNode ? referenceNode.parentNode : null;
    }

    if (!editor) return;

    // 1. Création du paragraphe pur, sans aucune classe ni style
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    
    // 2. Insertion
    if (appendToEnd) {
        editor.appendChild(p);
    } else if (referenceNode) {
        editor.insertBefore(p, referenceNode.nextSibling);
    }

    // 3. Téléportation forcée du curseur
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // 4. L'ÉRADICATION : On force le navigateur à vider sa "mémoire fantôme"
    document.execCommand('removeFormat', false, null);
    
    // On mitraille la commande 'outdent' (Diminuer le retrait) 5 fois de suite
    // pour détruire tous les niveaux de retraits que le navigateur aurait pu mémoriser.
    for(let i = 0; i < 5; i++) {
        document.execCommand('outdent', false, null);
    }
}

// =====================================================================
// GARDIEN DE ZONE D'ÉDITION (Anti-blocage en fin de document) - VERSION 3.0
// =====================================================================
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('content-editable')) {
        const editor = e.target;
        
        let lastNode = editor.lastChild;
        while (lastNode && lastNode.lastChild) lastNode = lastNode.lastChild;
        if (!lastNode) return;

        const targetElement = lastNode.nodeType === 3 ? lastNode.parentElement : lastNode;
        
        // On détecte si on est bloqué par un composant fermé OU par un retrait tenace
        const isLocked = targetElement.closest('[contenteditable="false"], .fr-table');
        const isIndented = targetElement.closest('blockquote');
        
        if (isLocked || isIndented) {
            // On appelle l'Antidote pour générer la ligne vierge à la toute fin
            createVirginParagraph(editor, true);
        }
    }
});

function updateMarginText() {
    // On récupère le texte et on le met en majuscules pour garantir l'homogénéité
    const text = document.getElementById('cfg-margin-text').value.toUpperCase();
    const pages = document.querySelectorAll('.page-a4');
    
    pages.forEach(page => {
        // On injecte le texte dans l'attribut HTML de chaque page
        page.setAttribute('data-margin-text', text);
    });
}

async function saveAsSafe(content, suggestedName, mimeType, extension) {
    try {
        if (window.showSaveFilePicker) {
            // Logique native pour Chrome/Edge (Gestionnaire de fichiers système)
            const handle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'Document PLUME',
                    accept: { [mimeType]: [extension] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            return true;
        } else {
            // Logique de secours pour Firefox/Safari avec notre Modale plumeModal
            let fileName = await plumeModal({
                title: "Enregistrer le fichier",
                message: "Sous quel nom souhaitez-vous sauvegarder votre travail ?",
                type: "prompt",
                defaultValue: suggestedName,
                confirmText: "Télécharger"
            });

            if (!fileName) return false;
            
            if (!fileName.endsWith(extension)) fileName += extension;
            const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName;
            a.click(); URL.revokeObjectURL(url);
            return true;
        }
    } catch (err) {
        if (err.name !== 'AbortError') console.error("Erreur de sauvegarde :", err);
        return false;
    }
}

// =====================================================================
// MODULE SAUVEGARDE LOCALE (AUTO-SAVE / BROUILLON)
// =====================================================================

function saveDraftToLocal() {
    const state = {
        palette: document.getElementById('cfg-palette').value,
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        marginText: document.getElementById('cfg-margin-text').value,
        margins: {
            top: document.getElementById('cfg-margin-top').checked,
            bottom: document.getElementById('cfg-margin-bottom').checked,
            left: document.getElementById('cfg-margin-left').checked,
            right: document.getElementById('cfg-margin-right').checked
        },
        logo: logoDataUrl,
        pages: []
    };
    
    document.querySelectorAll('.page-a4').forEach(page => {
        const clone = page.cloneNode(true);
        const editor = clone.querySelector('.content-editable');
        
        // Purge des images lourdes générées par l'éditeur (elles seront recréées à la volée)
        const generatedImages = editor.querySelectorAll('.chart-container img, .plume-map-container img');
        generatedImages.forEach(img => {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        });
        
        state.pages.push({
            //content: editor.innerHTML,
            content: sanitizePlumeHTML(editor.innerHTML),
            isLandscape: page.classList.contains('landscape')
        });
    });

    try {
        localStorage.setItem('plume_draft_state', JSON.stringify(state));
        localStorage.setItem('plume_draft_timestamp', Date.now());
    } catch (e) {
        console.warn("⚠️ Impossible de sauvegarder le brouillon automatiquement (Quota dépassé ?)", e);
    }
}

async function restoreDraftFromLocal(jsonString) {
    try {
        const state = JSON.parse(jsonString);
        
        // Restauration des réglages
        if (state.palette) document.getElementById('cfg-palette').value = state.palette;
        if (state.bureau) document.getElementById('cfg-bureau').value = state.bureau;
        if (state.titre) document.getElementById('cfg-titre').value = state.titre;
        if (state.date) document.getElementById('cfg-date').value = state.date;
        if (state.footer) document.getElementById('cfg-footer').value = state.footer;
        if (state.marginText !== undefined) {
            document.getElementById('cfg-margin-text').value = state.marginText;
            updateMarginText(); // On applique visuellement le changement
        }
        if (state.margins) {
            if (state.margins.top !== undefined) document.getElementById('cfg-margin-top').checked = state.margins.top;
            if (state.margins.bottom !== undefined) document.getElementById('cfg-margin-bottom').checked = state.margins.bottom;
            if (state.margins.left !== undefined) document.getElementById('cfg-margin-left').checked = state.margins.left;
            if (state.margins.right !== undefined) document.getElementById('cfg-margin-right').checked = state.margins.right;
        }
        logoDataUrl = state.logo || "";
        applyPalette(); 
        
        // Restauration du contenu
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
        updateColoredMargins(); // Applique les bordures colorées aux nouvelles pages
            updateMarginText();
        
        // Reconstruction asynchrone des médias (Cartes et Graphiques)
        setTimeout(async () => {
            refreshAllCharts();
            if (typeof refreshAllMaps === 'function') {
                await refreshAllMaps();
            }
            if (typeof refreshAllTimelines === 'function') await refreshAllTimelines();
        }, 100);
        
        if (typeof showToast !== 'undefined') {
            showToast("Brouillon restauré", "Vous avez récupéré votre dernière session.", "success");
        }
        
    } catch (err) {
        console.error(err);
        if (typeof showToast !== 'undefined') showToast("Erreur", "Le brouillon est corrompu et n'a pas pu être chargé.", "error");
    }
}


/**
 * Système de modale asynchrone (Remplace alert, confirm et prompt)
 * @param {Object} options - { title, message, type: 'confirm'|'prompt', defaultValue, confirmText, cancelText }
 * @returns {Promise} - Retourne le texte saisi (prompt) ou un booléen (confirm)
 */
function plumeModal({ 
    title = "Confirmation", 
    message = "", 
    type = "confirm", 
    defaultValue = "", 
    confirmText = "Valider", 
    cancelText = "Annuler" 
}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'chart-modal-overlay';
        
        const isPrompt = type === 'prompt';
        const inputHTML = isPrompt 
            ? `<div class="fr-input-group fr-mt-2w">
                 <input type="text" id="modal-input" class="fr-input" value="${defaultValue}" autocomplete="off">
               </div>` 
            : "";

        overlay.innerHTML = `
            <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column;">
                <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                    <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;">
                        <span class="${isPrompt ? 'fr-icon-edit-line' : 'fr-icon-question-line'}"></span> ${title}
                    </h3>
                </div>
                <div style="padding: 1.5rem; background: #fff;">
                    <p style="margin:0; line-height:1.5;">${message.replace(/\n/g, '<br>')}</p>
                    ${inputHTML}
                </div>
                <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="modal-cancel">${cancelText}</button>
                    <button class="fr-btn" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#modal-input');
        if (input) setTimeout(() => input.focus(), 100);

        const close = (value) => {
            overlay.remove();
            resolve(value);
        };

        overlay.querySelector('#modal-cancel').onclick = () => close(isPrompt ? null : false);
        overlay.querySelector('#modal-confirm').onclick = () => {
            close(isPrompt ? (input.value || defaultValue) : true);
        };
        
        // Validation avec la touche Entrée
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') overlay.querySelector('#modal-confirm').click();
            if (e.key === 'Escape') overlay.querySelector('#modal-cancel').click();
        });
    });
}


// =====================================================================
// MODULE DE NETTOYAGE HTML (Sanitizer)
// =====================================================================

/**
 * SANITIZER ROBUSTE - VERSION DSFR INTEGRALE
 * Nettoie les scories de Word tout en préservant 100% des composants PLUME/DSFR.
 */
function sanitizePlumeHTML(rawHtml) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    // 1. DÉFINITION DU "COMPOSANT SACRÉ"
    // On protège tout ce qui a une classe DSFR ou des métadonnées PLUME
// 1. DÉFINITION DU "COMPOSANT SACRÉ" (Version Corrigée)
    const isProtected = (el) => {
        // On ajoute la détection des classes commençant par 'plume-'
        const hasProtectedClass = Array.from(el.classList).some(cls => 
            cls.startsWith('fr-') || cls.startsWith('plume-')
        );
        
        const hasDataAttr = el.getAttributeNames().some(attr => attr.startsWith('data-'));
        
        // On met à jour le sélecteur .closest pour inclure plume-
        const isInsideComponent = el.closest('[class*="fr-"], [class*="plume-"], [data-map-config], [data-chart-config]');
        
        return hasProtectedClass || hasDataAttr || isInsideComponent;
    };
    
    // 2. NETTOYAGE SÉLECTIF DES STYLES
    tempDiv.querySelectorAll('*[style]').forEach(el => {
        if (isProtected(el)) return; // On ne touche pas aux composants DSFR

        // On ne nettoie que les styles "parasites" sur le texte standard
        const textAlign = el.style.textAlign; // On préserve l'alignement (choix utilisateur)
        el.removeAttribute('style');
        if (textAlign) el.style.textAlign = textAlign;
    });

    // 3. PURGE DES BALISES VIDES (AVEC PRÉCAUTION)
    tempDiv.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6').forEach(el => {
        if (isProtected(el)) return; // Protection des structures DSFR vides (ex: conteneurs d'icônes)
        
        const content = el.innerHTML.trim();
        if (content === '' || content === '<br>' || content === '&nbsp;') {
            el.remove();
        }
    });

    // 4. NORMALISATION SÉMANTIQUE
    // On remplace les scories de mise en forme par du HTML propre
    tempDiv.querySelectorAll('b').forEach(el => { el.outerHTML = `<strong>${el.innerHTML}</strong>`; });
    tempDiv.querySelectorAll('i').forEach(el => { el.outerHTML = `<em>${el.innerHTML}</em>`; });

    return tempDiv.innerHTML;
}

/**
 * MODULE COMPOSANTS - PLUME (Blocs DSFR et éléments de structure)
 * Contient toutes les fonctions d'insertion statiques de l'éditeur.
 */

function insertImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function(readerEvent) {
            // Création d'une image virtuelle pour la compression
            const img = new Image();
            img.onload = function() {
                // Calcul des dimensions (Max 800px de large pour une feuille A4)
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                // Canvas invisible pour redimensionner
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Export optimisé en WEBP (compression 75%)
                const compressedBase64 = canvas.toDataURL('image/webp', 0.75);

                // CORRECTION : Un conteneur "block" centré, prêt à être manipulé (float) par la barre flottante
                const imgHTML = `
                    <div class="plume-image" style="display: block; text-align: center; margin: 1.5rem auto; clear: both;" contenteditable="false">
                        <img src="${compressedBase64}" alt="Image d'illustration" style="max-width: 100%; height: auto; border-radius: 4px; object-fit: contain;">
                    </div>
                    <p><br></p>
                `;
                
                // Sécurité : on s'assure que le focus est bien dans l'éditeur
                if (typeof enforceFocus === 'function') enforceFocus();
                insertHTML(imgHTML);
            };
            img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function insertDivider() {
    const dividerHTML = `
        <hr class="plume-divider" style="border: none; border-top: 2px solid var(--theme-sun); margin: 2rem 0;">
    `;
    insertHTML(dividerHTML);
}

function insertPageBreak() {
    addNewPage(); // Appelle la fonction globale dans app.js
    const pages = document.querySelectorAll('.page-a4');
    const newPage = pages[pages.length - 1];
    const copiedFootnotes = newPage.querySelector('.fr-footnotes');
    if (copiedFootnotes) {
        copiedFootnotes.remove();
    }
    const contentEditable = newPage.querySelector('.content-editable');
    
    newPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        contentEditable.focus();
    }, 500);
}

function insertFootnote() {
    // 1. Sauvegarde de la position du curseur
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const savedRange = selection.getRangeAt(0).cloneRange();

    // 2. Création de la modale interactive
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-edit-box-line"></span> Nouvelle note de bas de page</h3>
            </div>
            
            <div style="padding: 1.5rem; background: #fff;">
                <label class="fr-label" style="font-weight:700;">Contenu de la note</label>
                <textarea id="footnote-text-input" class="fr-input" placeholder="Saisissez ici vos précisions ou sources..." style="width: 100%; height: 100px; resize: none;"></textarea>
                <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">La note sera automatiquement numérotée et placée en bas de page.</p>
            </div>
            
            <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button class="fr-btn fr-btn--secondary" id="btn-footnote-cancel">Annuler</button>
                <button class="fr-btn" id="btn-footnote-insert">Insérer la note</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const inputArea = document.getElementById('footnote-text-input');
    const btnInsert = document.getElementById('btn-footnote-insert');
    const btnCancel = document.getElementById('btn-footnote-cancel');

    // Focus automatique
    setTimeout(() => inputArea.focus(), 100);

    // Actions
    btnCancel.onclick = () => overlay.remove();

    btnInsert.onclick = () => {
        const noteText = inputArea.value.trim();
        if (!noteText) {
            overlay.remove();
            return;
        }

        overlay.remove();

        // 3. Restauration de la sélection
        selection.removeAllRanges();
        selection.addRange(savedRange);

        // 4. Logique d'insertion
        // On récupère l'endroit précis où se trouve le curseur
let container = savedRange.commonAncestorContainer;
// Si c'est un nœud de texte (nodeType 3), on cible son élément parent
if (container.nodeType === 3) {
    container = container.parentNode;
}
// On remonte jusqu'à la page A4 courante
const safeArea = container.closest('.safe-area');
        const noteId = 'footnote-' + Date.now();
        const anchorId = 'anchor-' + noteId;

        // Gestion du bloc fr-footnotes hors de l'éditeur
        let footnotesSection = safeArea.querySelector('.fr-footnotes');
        if (!footnotesSection) {
            footnotesSection = document.createElement('div');
            footnotesSection.className = 'fr-footnotes';
            footnotesSection.innerHTML = `
                <ol class="fr-footnotes__list"></ol>
            `;
            const footer = safeArea.querySelector('.footer-wrapper');
            if (footer) safeArea.insertBefore(footnotesSection, footer);
            else safeArea.appendChild(footnotesSection);
        }

        const list = footnotesSection.querySelector('.fr-footnotes__list');
        const index = list.children.length + 1;

        // Insertion de l'appel [index]
        const sup = document.createElement('sup');
        const link = document.createElement('a');
        link.href = `#${noteId}`;
        link.id = anchorId;
        link.className = 'fr-footnote';
        link.textContent = `[${index}]`;
        sup.appendChild(link);
        
        savedRange.deleteContents();
        savedRange.insertNode(sup);

        // Ajout de la note en bas
        const listItem = document.createElement('li');
        listItem.id = noteId;
        listItem.innerHTML = `
            <p class="fr-footnotes__content">
                ${noteText}
                <a href="#${anchorId}" class="fr-footnotes__backlink" title="Retour au texte">↵</a>
            </p>
        `;
        list.appendChild(listItem);
    };
}

function insertGrid(n) {
    let colsHTML = ''; 
    for(let i = 0; i < n; i++) {
        // Le contenteditable="true" est déplacé ICI, isolant chaque colonne
        colsHTML += `
            <div style="flex: 1 1 0%; min-width: 0; word-break: break-word;" contenteditable="true">
                <p><em>Texte de la colonne ${i+1}...</em></p>
            </div>
        `;
    }
    
    const gridHTML = `
        <div class="plume-grid" contenteditable="false" style="margin: 1.5rem 0;">
            <div style="display: flex; gap: 1.5rem; width: 100%;" contenteditable="false">
                ${colsHTML}
            </div>
        </div>
    `;
    insertHTML(gridHTML);
}

function insertTable() {
    // 1. Sauvegarde du curseur pour insérer le tableau au bon endroit plus tard
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    // 2. Création de l'interface de la Modale (Studio)
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 850px; max-width: 95vw; height: 60vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 280px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-table-line"></span> Nouveau tableau</h3>
                <p style="font-size: 0.8rem; margin: 0; color: #666;">Définissez la structure de votre tableau.</p>
                
                <div style="display: flex; gap: 1rem;">
                    <div style="flex: 1;">
                        <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Colonnes</label>
                        <input type="number" id="tbl-cols" class="fr-input" value="3" min="1" max="15">
                    </div>
                    <div style="flex: 1;">
                        <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Lignes</label>
                        <input type="number" id="tbl-rows" class="fr-input" value="2" min="1" max="50">
                    </div>
                </div>

                <div>
                    <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Style d'entête</label>
                    <select id="tbl-header" class="fr-select">
                        <option value="col" selected>Colonnes (Haut)</option>
                        <option value="row">Lignes (Gauche)</option>
                        <option value="both">Colonnes et Lignes</option>
                        <option value="none">Aucun entête</option>
                    </select>
                </div>
                
                <div style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-tbl-cancel">Annuler</button>
                    <button class="fr-btn" id="btn-tbl-insert">Insérer</button>
                </div>
            </div>
            <div style="flex:1; padding: 1.5rem; background:#fff; overflow: auto; display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: #666; font-size: 0.9rem;">Aperçu du rendu :</h4>
                <div id="tbl-preview" class="content-editable" onclick="event.stopPropagation()" style="flex: 1; border: 1px dashed var(--grey-900); padding: 1rem; border-radius: 4px; overflow: auto; background: transparent;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 3. Moteur de prévisualisation en temps réel
    function renderPreview() {
        // Récupération sécurisée des valeurs
        const cols = Math.max(1, parseInt(document.getElementById('tbl-cols').value) || 3);
        const rows = Math.max(1, parseInt(document.getElementById('tbl-rows').value) || 2);
        const style = document.getElementById('tbl-header').value;
        
        const hasColHeader = style === 'col' || style === 'both';
        const hasRowHeader = style === 'row' || style === 'both';

        let tableHTML = `<div class="fr-table" contenteditable="false"><table contenteditable="true">`;

        // Génération des entêtes de colonnes
        if (hasColHeader) {
            tableHTML += `<thead><tr>`;
            for (let c = 0; c < cols; c++) tableHTML += `<th scope="col">Entête</th>`;
            tableHTML += `</tr></thead>`;
        }

        // Génération du corps du tableau
        tableHTML += `<tbody>`;
        for (let r = 0; r < rows; r++) {
            tableHTML += `<tr>`;
            for (let c = 0; c < cols; c++) {
                if (c === 0 && hasRowHeader) tableHTML += `<th scope="row">Ligne ${r+1}</th>`;
                else tableHTML += `<td>-</td>`;
            }
            tableHTML += `</tr>`;
        }
        tableHTML += `</tbody></table></div>`;
        
        // Injection dans l'aperçu
        document.getElementById('tbl-preview').innerHTML = tableHTML;
        return tableHTML; // On retourne le HTML pour l'utiliser lors de l'insertion
    }

    // Premier affichage
    renderPreview();

    // 4. Écouteurs d'événements pour mettre à jour l'aperçu en direct
    ['tbl-cols', 'tbl-rows', 'tbl-header'].forEach(id => {
        document.getElementById(id).addEventListener('input', renderPreview);
    });

    // 5. Actions des boutons
    document.getElementById('btn-tbl-cancel').onclick = () => overlay.remove();

    document.getElementById('btn-tbl-insert').onclick = () => {
        const finalHTML = renderPreview(); // On génère le HTML définitif
        overlay.remove(); // On ferme la modale
        
        // On restaure le curseur exactement là où l'utilisateur était
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
        
        // On insère le tableau
        insertHTML(finalHTML);
    };
}

function insertSommaire() {
    const sommaireHTML = `
        <nav class="fr-summary" role="navigation" contenteditable="false">
            <p class="fr-summary__title" contenteditable="true">Au sommaire de ce numéro</p>
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
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) savedRange = selection.getRangeAt(0).cloneRange();

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 850px; max-width: 95vw; height: 60vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 300px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-chat-quote-line"></span> Nouvelle Citation</h3>
                <p style="font-size: 0.8rem; margin: 0; color: #666;">Définissez le style et l'auteur.</p>
                
                <div>
                    <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Portrait de l'auteur</label>
                    <select id="cit-photo" class="fr-select">
                        <option value="none" selected>Texte uniquement</option>
                        <option value="left">Photo à gauche</option>
                        <option value="right">Photo à droite</option>
                    </select>
                </div>

                <div id="cit-photo-upload-wrap" style="display:none; padding-top: 0.5rem; border-top: 1px dashed var(--grey-900);">
                    <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Image du portrait</label>
                    <input type="file" id="cit-file" accept="image/png, image/jpeg, image/webp" style="display:none">
                    <button class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-image-add-line fr-btn--icon-left" id="btn-cit-upload" style="width:100%">Choisir une image...</button>
                </div>
                
                <div style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-cit-cancel">Annuler</button>
                    <button class="fr-btn" id="btn-cit-insert">Insérer</button>
                </div>
            </div>
            <div style="flex:1; padding: 1.5rem; background:#fff; overflow: auto; display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: #666; font-size: 0.9rem;">Aperçu du rendu :</h4>
                <div id="cit-preview" class="content-editable" onclick="event.stopPropagation()" style="flex: 1; border: 1px dashed var(--grey-900); padding: 1rem; border-radius: 4px; overflow: auto; background: transparent; display: flex; align-items: center;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Avatar gris par défaut (SVG) pour la prévisualisation
    let currentPhotoUrl = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='8' r='5'/%3E%3Cpath d='M20 21a8 8 0 0 0-16 0'/%3E%3C/svg%3E";

    function renderPreview() {
        const style = document.getElementById('cit-photo').value;
        const photoOnRight = (style === "right");
        const hasPhoto = (style !== "none");
        let html = '';
        
        if (hasPhoto) {
            const imgBlock = `<img src="${currentPhotoUrl}" alt="Portrait" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid var(--grey-900); background: #f0f0f0;">`;
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
            const contentHTML = photoOnRight ? textBlock + imgBlock : imgBlock + textBlock;
            html = `<div class="plume-citation" style="display: flex; gap: 1.5rem; align-items: flex-start; margin: 2rem 0 2rem 1rem;" contenteditable="false">${contentHTML}</div>`;
            
        } else {
            html = `
                <div class="plume-citation" style="margin: 2rem 0 2rem 1rem;" contenteditable="false">
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
        }
        document.getElementById('cit-preview').innerHTML = html;
        return html;
    }

    renderPreview();

    // Afficher/Cacher le bouton d'upload selon le choix du menu déroulant
    document.getElementById('cit-photo').addEventListener('change', (e) => {
        const wrap = document.getElementById('cit-photo-upload-wrap');
        wrap.style.display = e.target.value !== 'none' ? 'block' : 'none';
        renderPreview();
    });

    document.getElementById('btn-cit-upload').onclick = () => document.getElementById('cit-file').click();

    document.getElementById('cit-file').onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            showToast("Image trop lourde", "Veuillez choisir un portrait de moins de 2 Mo.", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = function(readerEvent) {
            currentPhotoUrl = readerEvent.target.result; // Met à jour l'avatar avec la vraie photo
            renderPreview(); // Actualise l'aperçu
        };
        reader.readAsDataURL(file);
    };

    document.getElementById('btn-cit-cancel').onclick = () => overlay.remove();

    document.getElementById('btn-cit-insert').onclick = () => {
        const finalHTML = renderPreview();
        overlay.remove();
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }
        insertHTML(finalHTML);
    };
}

function insertChiffreCle() {
    // AJOUT DE LA CLASSE 'plume-chiffre' SUR LA DIV PRINCIPALE
    insertHTML(`
        <div class="plume-chiffre" style="display: flex; align-items: center; gap: 1.5rem; margin: 2rem 0; padding: 1.5rem; background-color: var(--theme-bg); border-radius: 4px; border-left: 4px solid var(--theme-sun);" contenteditable="false">
            <div style="font-size: 3.5rem; font-weight: 800; color: var(--theme-sun); line-height: 1; min-width: max-content; outline: none;" contenteditable="true">
                +42%
            </div>
            <div style="font-size: 1.1rem; font-weight: 500; color: #1e1e1e; line-height: 1.4; outline: none;" contenteditable="true">
                <p style="margin: 0;"><strong>Libellé du chiffre clé.</strong> Expliquez ici la signification de cette statistique.</p>
            </div>
        </div>
    `);
}

function insertLink() {
    // 1. Sauvegarde du texte sélectionné et extraction du texte brut
    const selection = window.getSelection();
    let savedRange = null;
    let selectedText = "";
    
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
        selectedText = savedRange.toString().trim();
    }

    // 2. Création de la petite modale avec le double champ
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-link"></span> Insérer un lien hypertexte</h3>
            </div>
            
            <div style="padding: 1.5rem; background: #fff; display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label class="fr-label" style="font-weight:700;">URL cible (Lien)</label>
                    <input type="text" id="link-url-input" class="fr-input" placeholder="ex: https://www.gouvernement.fr" style="width: 100%;">
                </div>
                <div>
                    <label class="fr-label" style="font-weight:700;">Texte à afficher</label>
                    <input type="text" id="link-text-input" class="fr-input" value="${selectedText}" placeholder="Texte visible par le lecteur" style="width: 100%;">
                    <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem; margin-bottom: 0;">Laissez vide pour afficher l'URL brute.</p>
                </div>
            </div>
            
            <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button class="fr-btn fr-btn--secondary" id="btn-link-cancel">Annuler</button>
                <button class="fr-btn" id="btn-link-insert">Valider</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const inputUrl = document.getElementById('link-url-input');
    const inputText = document.getElementById('link-text-input');
    const btnInsert = document.getElementById('btn-link-insert');
    const btnCancel = document.getElementById('btn-link-cancel');

    // Autofocus sur le premier champ
    setTimeout(() => inputUrl.focus(), 100);

    // Navigation au clavier fluide sur les deux champs
    const handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnInsert.click();
        } else if (e.key === 'Escape') {
            btnCancel.click();
        }
    };
    inputUrl.addEventListener('keydown', handleKeydown);
    inputText.addEventListener('keydown', handleKeydown);

    // 3. Actions
    btnCancel.onclick = () => overlay.remove();

    btnInsert.onclick = () => {
        const url = inputUrl.value.trim();
        const textToDisplay = inputText.value.trim() || url; // Si pas de texte, on affiche l'URL
        
        // Si l'URL est vide, on annule
        if (!url) {
            overlay.remove();
            return;
        }

        // Sécurité contre les scripts malveillants
        if (/^\s*javascript:/i.test(url) || (/^\s*data:/i.test(url) && !url.startsWith('data:image'))) {
            if (typeof showToast !== 'undefined') {
                showToast("Lien bloqué", "Ce type de lien n'est pas autorisé par sécurité.", "warning");
            }
            return;
        }

        // Ajout automatique du "https://" si l'utilisateur l'a oublié
        let finalUrl = url;
        if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        overlay.remove();

        // 4. Restauration de la sélection
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // 5. Logique d'insertion intelligente
        if (savedRange && savedRange.collapsed) {
            // CAS 1 : Rien n'était sélectionné -> On insère le nouveau bloc HTML
            const linkHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${textToDisplay}</a>`;
            if (typeof insertHTML === 'function') {
                insertHTML(typeof sanitizeHTML === 'function' ? sanitizeHTML(linkHTML) : linkHTML);
            } else {
                document.execCommand('insertHTML', false, linkHTML);
            }
        } else {
            // CAS 2 : Du texte était sélectionné
            if (textToDisplay !== selectedText) {
                // L'utilisateur a tapé un texte différent dans la modale -> On écrase sa sélection
                const linkHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${textToDisplay}</a>`;
                if (typeof insertHTML === 'function') {
                    insertHTML(typeof sanitizeHTML === 'function' ? sanitizeHTML(linkHTML) : linkHTML);
                } else {
                    document.execCommand('insertHTML', false, linkHTML);
                }
            } else {
                // L'utilisateur a gardé le texte d'origine -> On utilise createLink pour préserver le formatage interne (ex: mots en gras dans le lien)
                if (typeof enforceFocus === 'function') enforceFocus();
                document.execCommand('createLink', false, finalUrl);
                
                // On sécurise tous les liens fraîchement créés
                const editor = document.querySelector('.content-editable');
                if (editor) {
                    const newLinks = editor.querySelectorAll(`a[href="${finalUrl}"]`);
                    newLinks.forEach(link => {
                        link.setAttribute('target', '_blank');
                        link.setAttribute('rel', 'noopener noreferrer');
                    });
                }
            }
        }
    };
}

// =====================================================================
// MODULE FRISE CHRONOLOGIQUE (TIMELINE DATA-DRIVEN)
// =====================================================================

function insertTimelineFromCSV() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, text/csv';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                const data = results.data;
                if (data.length < 1) {
                    if (typeof showToast !== 'undefined') showToast("Erreur", "Le fichier CSV est vide.", "error");
                    return;
                }
                
                const headers = Object.keys(data[0]);
                const colDate = headers[0]; // Clé principale (Filtre)
                const colTitre = headers[1] || headers[0];
                const colDesc = headers[2] || null;

                openTimelineStudio(data, colDate, colTitre, colDesc);
            }
        });
    };
    input.click();
}
function openTimelineStudio(rawData, colDate, colTitre, colDesc) {
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    // Génération dynamique des filtres (Cases à cocher) basés sur l'ordre naturel
    let filtersHTML = '';
    rawData.forEach((row, index) => {
        const val = row[colDate] || `Étape ${index + 1}`;
        filtersHTML += `
            <div class="fr-checkbox-group fr-checkbox-group--sm">
                <input type="checkbox" id="tl-filter-${index}" value="${index}" checked onchange="updateTimelinePreview()">
                <label class="fr-label" for="tl-filter-${index}">${val}</label>
            </div>
        `;
    });

    overlay.innerHTML = `
        <div class="chart-modal" style="width: 1000px; height: 80vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 300px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); display: flex; flex-direction: column; gap: 1rem; overflow-y: auto;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-time-line"></span> Studio Frise</h3>
                
                <div>
                    <label class="fr-label" style="font-weight:700;">Titre (Optionnel)</label>
                    <input type="text" id="tl-title" class="fr-input" placeholder="Ex: Déploiement du projet" oninput="updateTimelinePreview()">
                </div>
                
                <div>
                    <label class="fr-label" style="font-weight:700;">Orientation</label>
                    <select id="tl-orientation" class="fr-select" onchange="updateTimelinePreview()">
                        <option value="horizontal">Horizontale (Auto-ajustable)</option>
                        <option value="vertical">Verticale (Liste descendante)</option>
                    </select>
                </div>
                
                <div style="background: #fff; padding: 1rem; border: 1px solid var(--grey-900); border-radius: 4px;">
                    <label class="fr-label" style="font-weight:700; margin-bottom: 0.5rem;">Données à afficher</label>
                    <div style="max-height: 200px; overflow-y: auto; padding-right: 0.5rem;" id="tl-filters-container">
                        ${filtersHTML}
                    </div>
                </div>

                <div style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-tl-cancel" style="flex:1;">Annuler</button>
                    <button class="fr-btn" id="btn-tl-insert" style="flex:1;">Insérer</button>
                </div>
            </div>
            
            <div style="flex:1; background:#fff; padding:2rem; overflow:auto; display:flex; flex-direction:column;">
                <h4 style="margin-top:0; font-size:0.9rem; color:#666;">Aperçu du rendu final :</h4>
                <div id="tl-preview-area" style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; border:1px dashed var(--grey-900); padding:2rem;">
                    <!-- L'aperçu sera injecté ici -->
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Fonction de mise à jour de l'aperçu
    window.updateTimelinePreview = function() {
        const title = document.getElementById('tl-title').value;
        const orientation = document.getElementById('tl-orientation').value;
        const style = getComputedStyle(document.documentElement);
        const themeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';

        // Filtrage des données tout en respectant l'ordre naturel
        const filteredData = [];
        const checkboxes = document.querySelectorAll('#tl-filters-container input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            filteredData.push(rawData[parseInt(cb.value)]);
        });

        const html = buildTimelineHTML(filteredData, colDate, colTitre, colDesc, orientation, title, themeSun);
        document.getElementById('tl-preview-area').innerHTML = `<div style="width: 100%; max-width: 800px;">${html}</div>`;
    };

    // Premier rendu
    updateTimelinePreview();

    // Actions
    document.getElementById('btn-tl-cancel').onclick = () => overlay.remove();
    document.getElementById('btn-tl-insert').onclick = () => {
        const title = document.getElementById('tl-title').value;
        const orientation = document.getElementById('tl-orientation').value;
        
        const filteredData = [];
        document.querySelectorAll('#tl-filters-container input[type="checkbox"]:checked').forEach(cb => {
            filteredData.push(rawData[parseInt(cb.value)]);
        });

        const config = { colDate, colTitre, colDesc, orientation, title };
        
        overlay.remove();
        finalizeTimelineInsertion(filteredData, config);
    };
}
function buildTimelineHTML(data, colDate, colTitre, colDesc, orientation, title, themeSun) {
    if (data.length === 0) return '<p style="text-align:center; color:#999;">Aucune donnée sélectionnée.</p>';

    let html = `<div style="font-family: 'Marianne', Arial, sans-serif; width: 100%; text-align: left;">`;
    
    if (title) {
        html += `<h3 style="color: ${themeSun}; margin-bottom: 1.5rem; text-align: center;">${title}</h3>`;
    }

    if (orientation === 'horizontal') {
        html += `<ul class="plume-timeline-horizontal">`;
        data.forEach(row => {
            html += `
                <li>
                    <strong class="plume-timeline-title" style="color: ${themeSun};">${row[colDate]}</strong>
                    <div class="plume-timeline-event">${row[colTitre]}</div>
                    ${colDesc && row[colDesc] ? `<div class="plume-timeline-desc">${row[colDesc]}</div>` : ''}
                </li>
            `;
        });
        html += `</ul>`;
    } else {
        html += `<ul class="plume-timeline-vertical">`;
        data.forEach(row => {
            html += `
                <li>
                    <strong class="plume-timeline-title" style="color: ${themeSun};">${row[colDate]}</strong>
                    <div class="plume-timeline-event">${row[colTitre]}</div>
                    ${colDesc && row[colDesc] ? `<div class="plume-timeline-desc">${row[colDesc]}</div>` : ''}
                </li>
            `;
        });
        html += `</ul>`;
    }
    html += `</div>`;
    return html;
}
async function finalizeTimelineInsertion(timelineData, config) {
    const style = getComputedStyle(document.documentElement);
    const currentThemeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';

    // 1. Conteneur fantôme pour la capture
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.position = 'absolute';
    hiddenDiv.style.left = '-9999px';
    hiddenDiv.style.width = '800px'; // Force la largeur pour un rendu A4 parfait
    hiddenDiv.style.padding = '20px';
    hiddenDiv.style.background = '#fff';
    
    hiddenDiv.innerHTML = buildTimelineHTML(timelineData, config.colDate, config.colTitre, config.colDesc, config.orientation, config.title, currentThemeSun);
    document.body.appendChild(hiddenDiv);

    try {
        // Laisser 50ms au navigateur pour appliquer les styles CSS
        await new Promise(resolve => setTimeout(resolve, 50));

        // 2. Capture HD
        const canvas = await html2canvas(hiddenDiv, {
            scale: 2, 
            backgroundColor: "#ffffff",
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        hiddenDiv.remove();

        // 3. Emballage des métadonnées
        const payload = { data: timelineData, config: config };
        const safeConfig = encodeURIComponent(JSON.stringify(payload));

        // 4. Injection
        const finalHTML = `
            <div class="plume-timeline-container" data-timeline-config="${safeConfig}" style="margin: 2rem 0; text-align: center;" contenteditable="false">
                <img src="${imgData}" alt="Frise chronologique" style="max-width: 100%; height: auto; border: 1px solid var(--grey-900); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" />
            </div>
            <p><br></p>
        `;

        if (typeof insertHTML === 'function') {
            insertHTML(finalHTML);
        } else {
            document.execCommand('insertHTML', false, finalHTML);
        }

        if (typeof showToast !== 'undefined') showToast("Succès", "La frise a été ajoutée.", "success");

    } catch (e) {
        console.error("Erreur de génération :", e);
        if (hiddenDiv) hiddenDiv.remove();
        if (typeof showToast !== 'undefined') showToast("Erreur", "Impossible de générer l'image.", "error");
    }
}
async function refreshAllTimelines() {
    const timelineContainers = document.querySelectorAll('.plume-timeline-container[data-timeline-config]');
    if (timelineContainers.length === 0) return;

    const style = getComputedStyle(document.documentElement);
    const newThemeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';

    for (const container of timelineContainers) {
        try {
            const configStr = container.getAttribute('data-timeline-config');
            if (!configStr) continue;

            const payload = JSON.parse(decodeURIComponent(configStr));
            
            const hiddenDiv = document.createElement('div');
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.left = '-9999px';
            hiddenDiv.style.width = '800px';
            hiddenDiv.style.padding = '20px';
            hiddenDiv.style.background = '#fff';
            
            hiddenDiv.innerHTML = buildTimelineHTML(
                payload.data, 
                payload.config.colDate, 
                payload.config.colTitre, 
                payload.config.colDesc, 
                payload.config.orientation, 
                payload.config.title, 
                newThemeSun
            );
            document.body.appendChild(hiddenDiv);

            await new Promise(resolve => setTimeout(resolve, 50));

            const canvas = await html2canvas(hiddenDiv, { scale: 2, backgroundColor: "#ffffff", logging: false });
            const imgElement = container.querySelector('img');
            
            if (imgElement) {
                imgElement.src = canvas.toDataURL('image/png');
            }

            hiddenDiv.remove();
        } catch (e) {
            console.error("Impossible de rafraîchir la frise", e);
        }
    }
}

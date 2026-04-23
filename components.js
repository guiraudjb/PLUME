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

                const imgHTML = `
                    <div style="display: flex; justify-content: center; margin: 1.5rem 0;" contenteditable="false">
                        <img src="${compressedBase64}" alt="Image d'illustration" style="max-width: 100%; height: auto; object-fit: contain;">
                    </div>
                `;
                
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
        <hr style="border: none; border-top: 2px solid var(--theme-sun); margin: 2rem 0;">
    `;
    insertHTML(dividerHTML);
}

function insertPageBreak() {
    addNewPage(); // Appelle la fonction globale dans app.js
    const pages = document.querySelectorAll('.page-a4');
    const newPage = pages[pages.length - 1];
    const contentEditable = newPage.querySelector('.content-editable');
    
    newPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    setTimeout(() => {
        contentEditable.focus();
    }, 500);
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
        <div class="custom-grid" contenteditable="false" style="margin: 1.5rem 0;">
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
            html = `<div style="display: flex; gap: 1.5rem; align-items: flex-start; margin: 2rem 0 2rem 1rem;" contenteditable="false">${contentHTML}</div>`;
        } else {
            html = `
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
    insertHTML(`
        <div style="display: flex; align-items: center; gap: 1.5rem; margin: 2rem 0; padding: 1.5rem; background-color: var(--theme-bg); border-radius: 4px; border-left: 4px solid var(--theme-sun);" contenteditable="false">
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
    // 1. Sauvegarde du texte sélectionné
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    // 2. Création de la petite modale
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-link"></span> Insérer un lien hypertexte</h3>
            </div>
            <div style="padding: 2rem 1.5rem; background: #fff;">
                <label class="fr-label" style="font-weight:700;">URL cible</label>
                <input type="text" id="link-url-input" class="fr-input" placeholder="ex: https://www.gouvernement.fr" style="width: 100%;">
                <p style="font-size: 0.75rem; color: #666; margin-top: 0.5rem;">Saisissez l'adresse web vers laquelle ce texte doit pointer.</p>
            </div>
            <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button class="fr-btn fr-btn--secondary" id="btn-link-cancel">Annuler</button>
                <button class="fr-btn" id="btn-link-insert">Valider</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Autofocus sur le champ texte pour plus de rapidité
    setTimeout(() => document.getElementById('link-url-input').focus(), 100);

    // 3. Actions
    document.getElementById('btn-link-cancel').onclick = () => overlay.remove();

    document.getElementById('btn-link-insert').onclick = () => {
        const url = document.getElementById('link-url-input').value.trim();
        
        // Si vide, on annule sans rien faire
        if (!url) {
            overlay.remove();
            return;
        }

        // Sécurité contre les scripts malveillants
        if (/^\s*javascript:/i.test(url) || (/^\s*data:/i.test(url) && !url.startsWith('data:image'))) {
            showToast("Lien bloqué", "Ce type de lien n'est pas autorisé par sécurité.", "warning");
            return;
        }

        // Ajout automatique du "https://" si oublié
        let finalUrl = url;
        if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
            finalUrl = 'https://' + finalUrl;
        }

        overlay.remove();

        // 4. Restauration de la sélection et application du lien
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        if (savedRange && savedRange.collapsed) {
            // S'il n'y avait pas de texte sélectionné, on insère l'URL comme texte cliquable
            const linkHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
            insertHTML(sanitizeHTML(linkHTML));
        } else {
            // Si du texte était sélectionné, on le transforme en lien
            enforceFocus();
            document.execCommand('createLink', false, finalUrl);
            
            // Forcer l'ouverture dans un nouvel onglet pour la sécurité (A11Y)
            const currentSelection = window.getSelection();
            if (currentSelection.anchorNode && currentSelection.anchorNode.parentNode.tagName === 'A') {
                currentSelection.anchorNode.parentNode.setAttribute('target', '_blank');
                currentSelection.anchorNode.parentNode.setAttribute('rel', 'noopener noreferrer');
            }
        }
    };
}

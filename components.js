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
    const nbCols = parseInt(prompt("Nombre de colonnes :", "3"));
    const nbRows = parseInt(prompt("Nombre de lignes (hors entête) :", "2"));
    
    if (isNaN(nbCols) || isNaN(nbRows)) return;

    const choix = prompt(
        "Style d'entête :\n1 : Colonnes uniquement (Haut)\n2 : Lignes uniquement (Gauche)\n3 : Les deux (Colonnes et Lignes)\n4 : Aucun", "1"
    );

    if (choix === null) return;

    const hasColHeader = (choix === "1" || choix === "3");
    const hasRowHeader = (choix === "2" || choix === "3");

    let tableHTML = `<div class="fr-table" contenteditable="false"><table>`;

    if (hasColHeader) {
        tableHTML += `<thead><tr>`;
        for (let c = 0; c < nbCols; c++) tableHTML += `<th scope="col" contenteditable="true">Entête</th>`;
        tableHTML += `</tr></thead>`;
    }

    tableHTML += `<tbody contenteditable="true">`;
    for (let r = 0; r < nbRows; r++) {
        tableHTML += `<tr>`;
        for (let c = 0; c < nbCols; c++) {
            if (c === 0 && hasRowHeader) tableHTML += `<th scope="row">Ligne ${r+1}</th>`;
            else tableHTML += `<td>-</td>`;
        }
        tableHTML += `</tr>`;
    }
    tableHTML += `</tbody></table></div>`;

    insertHTML(tableHTML);
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
    const wantsPhoto = confirm("Voulez-vous ajouter une photo de l'auteur à cette citation ?\n(Cliquez sur OK pour choisir une image, ou Annuler pour du texte seul)");

    if (wantsPhoto) {
        const position = prompt("Position de la photo :\n1 : À gauche (par défaut)\n2 : À droite", "1");
        if (position === null) return;
        
        const photoOnRight = (position === "2");
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/png, image/jpeg, image/webp';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 2 * 1024 * 1024) {
                alert("L'image est trop lourde. Veuillez choisir une image de moins de 2 Mo.");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(readerEvent) {
                const photoUrl = readerEvent.target.result;
                const imgBlock = `<img src="${photoUrl}" alt="Portrait" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; flex-shrink: 0; border: 1px solid var(--grey-900);">`;
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
                insertHTML(`<div style="display: flex; gap: 1.5rem; align-items: flex-start; margin: 2rem 0 2rem 1rem;" contenteditable="false">${contentHTML}</div>`);
            };
            reader.readAsDataURL(file);
        };
        input.click(); 
    } else {
        insertHTML(`
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
        `);
    }
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
    const url = prompt("Veuillez saisir l'URL du lien (ex: https://www.gouvernement.fr) :");
    if (!url) return;
    
    if (/^\s*javascript:/i.test(url) || /^\s*data:/i.test(url) && !url.startsWith('data:image')) {
        alert("Ce type de lien n'est pas autorisé par sécurité.");
        return;
    }

    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl) && !/^mailto:/i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }

    const selection = window.getSelection();

    if (selection.isCollapsed) {
        const linkHTML = `<a href="${finalUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
        insertHTML(sanitizeHTML(linkHTML));
    } else {
        enforceFocus();
        document.execCommand('createLink', false, finalUrl);
        if (selection.anchorNode && selection.anchorNode.parentNode.tagName === 'A') {
            selection.anchorNode.parentNode.setAttribute('target', '_blank');
            selection.anchorNode.parentNode.setAttribute('rel', 'noopener noreferrer');
        }
    }
}

/**
 * MODULE OUTILS FLOTTANTS - PLUME
 * Gestion de la barre contextuelle (Texte, Images, Tableaux, Grilles, Corbeille)
 * Version optimisée : Déclenchement au clic, positionnement intelligent, menus intégrés.
 */

// 1. Création de l'interface de la barre flottante
const floatToolbar = document.createElement('div');
floatToolbar.style.cssText = `
    position: absolute;
    display: none;
    z-index: 10000;
    gap: 0.3rem;
    background-color: #fff;
    padding: 0.3rem;
    border: 1px solid var(--grey-900);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    align-items: center;
`;

// Bouton d'édition de lien (caché par défaut)
const editLinkBtn = document.createElement('button');
editLinkBtn.innerHTML = '<span class="fr-icon-link"></span>'; 
editLinkBtn.title = "Modifier le lien";
editLinkBtn.style.cssText = `background-color: #e3e3fd; border: 1px solid var(--theme-sun); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;

const textStyleSelect = document.createElement('select');
textStyleSelect.innerHTML = `<option value="P">Paragraphe</option><option value="H2">Titre 2</option><option value="H3">Titre 3</option><option value="H4">Titre 4</option><option value="BLOCKQUOTE">Citation</option>`;
textStyleSelect.style.cssText = `padding: 0.2rem 0.5rem; border: 1px solid var(--grey-900); border-radius: 4px; font-family: inherit; font-size: 0.85rem; background: #f5f5fe; cursor: pointer; outline: none;`;

const cleanBtn = document.createElement('button');
cleanBtn.innerHTML = '🧹'; cleanBtn.title = "Nettoyer les styles parasites";
cleanBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;`;

const resizeBtn = document.createElement('button');
resizeBtn.innerHTML = '📏'; resizeBtn.title = "Modifier la largeur des colonnes";
resizeBtn.style.cssText = `background-color: #f5f5fe; border: 1px solid var(--theme-sun); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;`;

// Nouveau selecteur pour les grilles/tableaux (caché par défaut)
const gridLayoutSelect = document.createElement('select');
gridLayoutSelect.style.cssText = `display: none; padding: 0.2rem 0.5rem; border: 1px solid var(--theme-sun); border-radius: 4px; font-family: inherit; font-size: 0.85rem; background: #fff; cursor: pointer; outline: none; color: var(--theme-sun); font-weight: bold;`;

// Champ texte pour saisie manuelle des ratios (caché par défaut)
const gridLayoutInputWrapper = document.createElement('div');
gridLayoutInputWrapper.style.cssText = `display: none; align-items: center; gap: 0.3rem;`;

const gridLayoutInput = document.createElement('input');
gridLayoutInput.type = 'text';
gridLayoutInput.placeholder = "ex: 20/40/40";
gridLayoutInput.style.cssText = `width: 90px; padding: 0.2rem 0.5rem; border: 1px solid var(--theme-sun); border-radius: 4px; font-family: inherit; font-size: 0.85rem; outline: none;`;

const gridLayoutSubmit = document.createElement('button');
gridLayoutSubmit.innerHTML = '✓';
gridLayoutSubmit.title = "Valider les largeurs";
gridLayoutSubmit.style.cssText = `background-color: var(--theme-sun); color: white; border: none; border-radius: 4px; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold;`;

gridLayoutInputWrapper.appendChild(gridLayoutInput);
gridLayoutInputWrapper.appendChild(gridLayoutSubmit);

const trashBtn = document.createElement('button');
trashBtn.innerHTML = '<span class="fr-icon-delete-bin-fill"></span>'; trashBtn.title = "Supprimer ce bloc";
trashBtn.style.cssText = `background-color: #ffe8e5; color: #e1000f; border: 1px solid #e1000f; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;`;

// État pour la confirmation de suppression
let trashConfirmState = false; 

// Outils d'Image
function createImgBtn(icon, title) {
    const btn = document.createElement('button');
    btn.innerHTML = `<span class="${icon}"></span>`; btn.title = title;
    btn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;
    return btn;
}

const imgAlignLeft = createImgBtn('fr-icon-align-left', 'Aligner à gauche (Habillage texte)');
const imgAlignCenter = createImgBtn('fr-icon-align-center', 'Centrer (Bloc)');
const imgAlignRight = createImgBtn('fr-icon-align-right', 'Aligner à droite (Habillage texte)');

// Boutons globaux de déplacement
const moveUpBtn = document.createElement('button');
moveUpBtn.innerHTML = '<span class="fr-icon-arrow-up-line"></span>'; 
moveUpBtn.title = "Monter ce bloc";
moveUpBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;

const moveDownBtn = document.createElement('button');
moveDownBtn.innerHTML = '<span class="fr-icon-arrow-down-line"></span>'; 
moveDownBtn.title = "Descendre ce bloc";
moveDownBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;

// Boutons spécifiques aux images
const imgCropBtn = createImgBtn('fr-icon-image-edit-line', 'Recadrer (Original / Carré / 16:9)');

const imgResizeSlider = document.createElement('input');
imgResizeSlider.type = 'range'; imgResizeSlider.min = '15'; imgResizeSlider.max = '100'; imgResizeSlider.value = '100';
imgResizeSlider.title = "Ajuster la taille";
imgResizeSlider.style.cssText = "width: 70px; margin: 0 0.5rem; cursor: pointer;";

const imgToolsContainer = document.createElement('div');
imgToolsContainer.style.cssText = "display: none; align-items: center; gap: 0.3rem; border-right: 1px solid var(--grey-900); padding-right: 0.5rem; margin-right: 0.2rem;";
imgToolsContainer.append(imgAlignLeft, imgAlignCenter, imgAlignRight, imgCropBtn, imgResizeSlider);

// Assemblage final
floatToolbar.appendChild(textStyleSelect);
floatToolbar.appendChild(cleanBtn);
floatToolbar.appendChild(editLinkBtn);
floatToolbar.appendChild(imgToolsContainer);
floatToolbar.appendChild(moveUpBtn);
floatToolbar.appendChild(moveDownBtn);
floatToolbar.appendChild(resizeBtn);
floatToolbar.appendChild(gridLayoutSelect);
floatToolbar.appendChild(gridLayoutInputWrapper);
floatToolbar.appendChild(trashBtn);
document.body.appendChild(floatToolbar);

let hoveredBlock = null;
let activeLinkNode = null;
const blockSelectors = '.fr-table, .custom-grid, .fr-summary, .fr-callout, hr, img, [contenteditable="false"], p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol';

// 2. Traque par sélection (au clic)
document.addEventListener('click', function(e) {
    // Si on clique dans la barre d'outils, on ne fait rien
    if (e.target === floatToolbar || floatToolbar.contains(e.target)) return;

    const editor = e.target.closest('.content-editable');
    const linkNode = e.target.closest('a');
    
    // Si on clique en dehors de l'éditeur, on cache la barre
    if (!editor) { 
        hideFloatToolbar(); 
        return; 
    }

    const block = e.target.closest(blockSelectors);

    if (block && editor.contains(block)) {
        // Seulement si c'est un nouveau bloc
        if (hoveredBlock !== block || activeLinkNode !== linkNode) {
            hideFloatToolbar(); // Cache et réinitialise l'ancienne sélection
            hoveredBlock = block;
            activeLinkNode = linkNode;
            hoveredBlock.classList.add('block-hover-focus');
            
            const tagName = hoveredBlock.tagName.toUpperCase();
            
            // Logique contextuelle
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'].includes(tagName)) {
                textStyleSelect.style.display = 'block';
                textStyleSelect.value = ['H1', 'H5', 'H6'].includes(tagName) ? 'P' : tagName; 
                cleanBtn.style.display = 'flex';
            } else {
                textStyleSelect.style.display = 'none';
                cleanBtn.style.display = 'none';
            }

            if (tagName === 'IMG') {
                imgToolsContainer.style.display = 'flex';
                const currentWidth = hoveredBlock.style.width || '100%';
                imgResizeSlider.value = parseInt(currentWidth);
            } else {
                imgToolsContainer.style.display = 'none';
            }

            if (hoveredBlock.classList.contains('custom-grid') || hoveredBlock.classList.contains('fr-table')) {
                resizeBtn.style.display = 'flex';
            } else {
                resizeBtn.style.display = 'none';
            }
            
            if (activeLinkNode) {
                editLinkBtn.style.display = 'flex';
            } else {
                editLinkBtn.style.display = 'none';
            }

            // Calcul de la position (Positionnement intelligent)
            const rect = hoveredBlock.getBoundingClientRect();
            let topPosition = window.scrollY + rect.top - 45;
            
            // Sécurité : Si le bloc est trop haut, on affiche la barre en DESSOUS
            if (rect.top < 50) {
                topPosition = window.scrollY + rect.bottom + 10;
            }

            floatToolbar.style.top = topPosition + 'px';
            floatToolbar.style.left = (window.scrollX + rect.left) + 'px';
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
    activeLinkNode = null;
    floatToolbar.style.display = 'none';
    
    // Réinitialiser les états spéciaux
    resetTrashBtn();
    resetResizeMenu();
}

// Réinitialisation de l'état du bouton poubelle
function resetTrashBtn() {
    trashConfirmState = false;
    trashBtn.innerHTML = '<span class="fr-icon-delete-bin-fill"></span>';
    trashBtn.style.backgroundColor = '#ffe8e5';
    trashBtn.style.color = '#e1000f';
    trashBtn.style.width = '30px';
}

// Réinitialisation des menus de redimensionnement
function resetResizeMenu() {
    resizeBtn.style.display = 'flex';
    gridLayoutSelect.style.display = 'none';
    gridLayoutInputWrapper.style.display = 'none';
    gridLayoutSelect.value = "";
    gridLayoutInput.value = "";
}

// 3. ACTIONS DES BOUTONS (Images)
function getImgWrapper(img) {
    return img.closest('div[contenteditable="false"]') || img;
}

imgAlignLeft.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    w.style.display = 'block'; w.style.float = 'left'; w.style.margin = '0 1.5rem 1rem 0';
};

imgAlignCenter.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    w.style.display = 'flex'; w.style.justifyContent = 'center'; w.style.float = 'none'; w.style.margin = '1.5rem 0';
};

imgAlignRight.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    w.style.display = 'block'; w.style.float = 'right'; w.style.margin = '0 0 1rem 1.5rem';
};

// Fonction pour cibler le conteneur racine absolu (déplace tout le bloc d'un coup)
function getTargetBlock(block) {
    let current = block;
    let parent = current.parentNode;
    
    // On remonte l'arbre DOM jusqu'à trouver la zone d'édition principale
    while (parent && !parent.classList.contains('content-editable')) {
        if (parent.tagName === 'BODY') break;
        current = parent;
        parent = current.parentNode;
    }
    return current;
}

// Déplacement vers le haut
moveUpBtn.onclick = () => {
    if (!hoveredBlock) return;
    const target = getTargetBlock(hoveredBlock);
    const prev = target.previousElementSibling;
    
    if (prev) {
        target.parentNode.insertBefore(target, prev);
        // Force le recalcul visuel de la barre en simulant un "dé-focus/re-focus"
        const rect = target.getBoundingClientRect();
        let topPosition = window.scrollY + rect.top - 45;
        if (rect.top < 50) topPosition = window.scrollY + rect.bottom + 10;
        floatToolbar.style.top = topPosition + 'px';
    }
};

// Déplacement vers le bas
moveDownBtn.onclick = () => {
    if (!hoveredBlock) return;
    const target = getTargetBlock(hoveredBlock);
    const next = target.nextElementSibling;
    
    if (next) {
        target.parentNode.insertBefore(target, next.nextElementSibling);
        if (!target.nextElementSibling) {
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            target.parentNode.appendChild(p);
        }
        const rect = target.getBoundingClientRect();
        let topPosition = window.scrollY + rect.top - 45;
        if (rect.top < 50) topPosition = window.scrollY + rect.bottom + 10;
        floatToolbar.style.top = topPosition + 'px';
    }
};

imgResizeSlider.oninput = (e) => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    hoveredBlock.style.width = e.target.value + '%';
    hoveredBlock.style.height = 'auto';
};

const ratios = ['auto', '1 / 1', '16 / 9', '4 / 3'];
let currentRatioIdx = 0;
imgCropBtn.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    currentRatioIdx = (currentRatioIdx + 1) % ratios.length;
    const ratio = ratios[currentRatioIdx];
    
    if (ratio === 'auto') {
        hoveredBlock.style.aspectRatio = 'auto';
        hoveredBlock.style.objectFit = 'contain';
        imgCropBtn.style.backgroundColor = '#fff';
    } else {
        hoveredBlock.style.aspectRatio = ratio;
        hoveredBlock.style.objectFit = 'cover';
        imgCropBtn.style.backgroundColor = '#e3e3fd'; 
    }
};

// 4. ACTIONS DES BOUTONS (Texte & Structure)
textStyleSelect.addEventListener('change', function(e) {
    if (!hoveredBlock) return;
    const newTag = e.target.value;
    if (hoveredBlock.tagName.toUpperCase() !== newTag) {
        const newElement = document.createElement(newTag);
        newElement.innerHTML = hoveredBlock.innerHTML;
        if (hoveredBlock.className) newElement.className = hoveredBlock.className;
        hoveredBlock.parentNode.replaceChild(newElement, hoveredBlock);
        hideFloatToolbar(); 
    }
});

cleanBtn.addEventListener('click', function() {
    if (!hoveredBlock) return;
    
    hoveredBlock.removeAttribute('style');
    if (!hoveredBlock.className.includes('fr-')) {
        hoveredBlock.removeAttribute('class');
    }
    hoveredBlock.classList.add('block-hover-focus'); 

    // Liste blanche
    const allowedAttributes = ['href', 'src', 'alt', 'class', 'id', 'target', 'rel', 'title', 'scope'];

    const children = hoveredBlock.querySelectorAll('*');
    children.forEach(child => {
        child.removeAttribute('style'); 
        
        Array.from(child.attributes).forEach(attr => {
            const attrName = attr.name.toLowerCase();
            if (!allowedAttributes.includes(attrName) && !attrName.startsWith('data-') && !attrName.startsWith('aria-')) {
                child.removeAttribute(attrName);
            }
        });

        if (child.tagName === 'FONT' || child.tagName === 'SPAN') {
            const fragment = document.createDocumentFragment();
            while (child.firstChild) fragment.appendChild(child.firstChild);
            child.parentNode.replaceChild(fragment, child);
        }
    });

    cleanBtn.innerHTML = '✨'; cleanBtn.style.backgroundColor = '#c3fad5';
    setTimeout(() => { cleanBtn.innerHTML = '🧹'; cleanBtn.style.backgroundColor = '#fff'; }, 1000);
});


// 1. On empêche le bouton de voler le focus ET on stoppe la propagation du clic
trashBtn.addEventListener('mousedown', function(e) {
    e.preventDefault();
    e.stopPropagation(); // <-- EMPÊCHE LA BARRE DE SE FERMER
});

// 2. Logique à double état (Confirmation -> Suppression)
trashBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation(); // <-- EMPÊCHE LA BARRE DE SE FERMER

    if (!hoveredBlock) return;
    
    if (!trashConfirmState) {
        // Premier clic : Demande de confirmation
        trashConfirmState = true;
        trashBtn.innerHTML = 'Confirmer ?';
        trashBtn.style.backgroundColor = '#e1000f';
        trashBtn.style.color = '#fff';
        trashBtn.style.width = 'auto';
        trashBtn.style.padding = '0 0.5rem';
        
        // Annule la confirmation après 3 secondes si pas d'action
        setTimeout(() => {
            if (trashConfirmState) resetTrashBtn(); // Assurez-vous que cette fonction existe bien dans votre fichier !
        }, 3000);
    } else {
        // Deuxième clic : Suppression effective
        const target = hoveredBlock.tagName === 'IMG' ? getImgWrapper(hoveredBlock) : hoveredBlock;
        const editor = target.closest('.content-editable') || document.querySelector('.content-editable');
        
        // On sélectionne proprement le bloc pour le moteur de l'éditeur
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNode(target);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // On rend le focus à l'éditeur et on exécute la suppression (permet le Ctrl+Z !)
        if (editor) editor.focus();
        document.execCommand('delete', false, null);
        
        // Repli de sécurité : si execCommand échoue, on le retire du DOM manuellement
        if (target && target.parentNode) {
            target.remove();
        }

        // Anti-Page Blanche : on garantit qu'il reste au moins une ligne vide
        if (editor && editor.innerHTML.trim() === '') {
            editor.innerHTML = '<p><br></p>';
        }

        // Nettoyage de l'interface
        hideFloatToolbar();
        resetTrashBtn();
        if (selection) selection.removeAllRanges();
    }
});


// Bouton Règle : Affichage des options
resizeBtn.addEventListener('click', function() {
    if (!hoveredBlock) return;
    
    let n = 0;
    if (hoveredBlock.classList.contains('custom-grid')) {
        const gridInner = hoveredBlock.querySelector('div[style*="display: flex"]');
        if (!gridInner) return;
        n = Array.from(gridInner.children).filter(c => c.tagName === 'DIV').length;
    } else if (hoveredBlock.classList.contains('fr-table')) {
        const table = hoveredBlock.querySelector('table');
        if (table && table.querySelector('tr')) {
            n = table.querySelector('tr').children.length;
        }
    }

    if (n < 2) {
        // Au lieu d'un alert, on change brièvement l'apparence du bouton
        resizeBtn.innerHTML = '❌';
        setTimeout(() => { resizeBtn.innerHTML = '📏'; }, 1000);
        return;
    }

    gridLayoutSelect.innerHTML = '<option value="" disabled selected>Répartition...</option>';
    
    if (n === 2) {
        gridLayoutSelect.innerHTML += `<option value="50/50">50% - 50%</option><option value="30/70">30% - 70%</option><option value="70/30">70% - 30%</option><option value="25/75">25% - 75%</option><option value="75/25">75% - 25%</option><option value="uniform">Uniforme (50/50)</option><option value="custom">Saisie manuelle...</option>`;
    } else if (n === 3) {
        gridLayoutSelect.innerHTML += `<option value="33/33/33">33% - 33% - 33%</option><option value="20/60/20">20% - 60% - 20%</option><option value="25/50/25">25% - 50% - 25%</option><option value="50/25/25">50% - 25% - 25%</option><option value="25/25/50">25% - 25% - 50%</option><option value="uniform">Uniforme</option><option value="custom">Saisie manuelle...</option>`;
    } else {
        gridLayoutSelect.innerHTML += `<option value="uniform">Uniforme</option><option value="custom">Saisie manuelle...</option>`;
    }

    resizeBtn.style.display = 'none';
    gridLayoutSelect.style.display = 'block';
});

// Appliquer les largeurs
function applyGridWidths(partsStr) {
    if (!hoveredBlock) return false;
    
    const parts = partsStr.split(/[\/\-\+,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
    
    let n = 0;
    if (hoveredBlock.classList.contains('custom-grid')) n = hoveredBlock.querySelector('div[style*="display: flex"]').children.length;
    else if (hoveredBlock.classList.contains('fr-table')) n = hoveredBlock.querySelector('table').querySelector('tr').children.length;

    if (parts.length !== n) {
        // Feedback erreur visuelle sur le champ texte
        gridLayoutInput.style.borderColor = 'red';
        setTimeout(() => { gridLayoutInput.style.borderColor = 'var(--theme-sun)'; }, 1000);
        return false;
    }

    if (hoveredBlock.classList.contains('custom-grid')) {
        const cols = Array.from(hoveredBlock.querySelector('div[style*="display: flex"]').children).filter(c => c.tagName === 'DIV');
        cols.forEach((col, i) => { 
            col.style.flex = `${parts[i]} 1 0%`; 
            col.style.minWidth = "0"; 
            col.style.wordBreak = "break-word"; 
        });
    } 
    else if (hoveredBlock.classList.contains('fr-table')) {
        const table = hoveredBlock.querySelector('table');
        const total = parts.reduce((sum, val) => sum + val, 0);
        let colgroup = table.querySelector('colgroup');
        if (!colgroup) { colgroup = document.createElement('colgroup'); table.insertBefore(colgroup, table.firstChild); }
        else colgroup.innerHTML = '';
        
        parts.forEach(part => {
            const col = document.createElement('col');
            col.style.width = `${((part / total) * 100).toFixed(2)}%`;
            colgroup.appendChild(col);
        });
        table.style.tableLayout = 'fixed';
    }
    return true;
}

// Changement via le sélecteur
gridLayoutSelect.addEventListener('change', function(e) {
    const val = e.target.value;
    if (!val) return;

    if (val === 'custom') {
        gridLayoutSelect.style.display = 'none';
        gridLayoutInputWrapper.style.display = 'flex';
        gridLayoutInput.focus();
        return;
    }

    if (val === 'uniform') {
        let n = 0;
        if (hoveredBlock.classList.contains('custom-grid')) n = hoveredBlock.querySelector('div[style*="display: flex"]').children.length;
        else if (hoveredBlock.classList.contains('fr-table')) n = hoveredBlock.querySelector('table').querySelector('tr').children.length;
        
        if(n>0) {
            const part = 100/n;
            const partsArr = Array(n).fill(part);
            applyGridWidths(partsArr.join('/'));
        }
    } else {
        applyGridWidths(val);
    }
    resetResizeMenu();
});

// Saisie manuelle via le champ texte
gridLayoutSubmit.addEventListener('click', () => {
    if (applyGridWidths(gridLayoutInput.value)) {
        resetResizeMenu();
    }
});

gridLayoutInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (applyGridWidths(gridLayoutInput.value)) {
            resetResizeMenu();
        }
    }
});

// =====================================================================
// ACTION : ÉDITION DE LIEN
// =====================================================================
editLinkBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!activeLinkNode) return;

    // 1. SÉCURITÉ : On "capture" le lien actuel dans une constante locale.
    // Ainsi, même si le focus global est perdu, on garde notre cible en mémoire.
    const targetLink = activeLinkNode;

    // On récupère les valeurs actuelles du lien
    const currentUrl = targetLink.getAttribute('href') || '';
    const currentText = targetLink.innerText || '';

    // On crée la modale
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    // 2. SÉCURITÉ : On empêche les clics à l'intérieur de la modale de remonter
    // jusqu'au document, ce qui fermerait la barre d'outils de façon intempestive.
    overlay.addEventListener('mousedown', (event) => event.stopPropagation());
    overlay.addEventListener('click', (event) => event.stopPropagation());
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column; overflow: hidden;">
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-edit-line"></span> Modifier le lien</h3>
            </div>
            
            <div style="padding: 1.5rem; background: #fff; display: flex; flex-direction: column; gap: 1rem;">
                <div>
                    <label class="fr-label" style="font-weight:700;">URL cible (Lien)</label>
                    <input type="text" id="edit-link-url" class="fr-input" value="${currentUrl}" style="width: 100%;">
                </div>
                <div>
                    <label class="fr-label" style="font-weight:700;">Texte à afficher</label>
                    <input type="text" id="edit-link-text" class="fr-input" value="${currentText}" style="width: 100%;">
                </div>
            </div>
            
            <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                <button class="fr-btn fr-btn--secondary" id="btn-edit-link-cancel">Annuler</button>
                <button class="fr-btn" id="btn-edit-link-save">Sauvegarder</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const inputUrl = document.getElementById('edit-link-url');
    const inputText = document.getElementById('edit-link-text');

    setTimeout(() => inputUrl.focus(), 100);

    // Annuler
    document.getElementById('btn-edit-link-cancel').onclick = () => {
        overlay.remove();
        hideFloatToolbar();
    };

    // Sauvegarder
    document.getElementById('btn-edit-link-save').onclick = () => {
        let newUrl = inputUrl.value.trim();
        const newText = inputText.value.trim() || newUrl;

        // Si l'utilisateur vide l'URL, on supprime le lien de manière propre
        if (!newUrl) {
            const textNode = document.createTextNode(newText);
            // On utilise bien notre constante `targetLink` ici
            targetLink.parentNode.replaceChild(textNode, targetLink);
            overlay.remove();
            hideFloatToolbar();
            return;
        }

        // Ajout du protocole de sécurité si manquant
        if (!/^https?:\/\//i.test(newUrl) && !/^mailto:/i.test(newUrl)) {
            newUrl = 'https://' + newUrl;
        }

        // Application des modifications via `targetLink`
        targetLink.setAttribute('href', newUrl);
        targetLink.innerText = newText;
        
        overlay.remove();
        hideFloatToolbar(); 
    };
});

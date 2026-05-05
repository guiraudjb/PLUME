/**
 * MODULE OUTILS FLOTTANTS - PLUME
 * Gestion de la barre contextuelle (Texte, Images, Tableaux, Grilles, Corbeille)
 * Version optimisée : Déclenchement au clic, positionnement intelligent, menus intégrés.
 */

// 1. Création de l'interface de la barre flottante
const floatToolbar = document.createElement('div');
floatToolbar.id = 'plume-floating-toolbar';
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

const lettrineBtn = document.createElement('button');
lettrineBtn.innerHTML = '<span class="fr-icon-font-size" style="font-size: 0.85rem;"></span>';
lettrineBtn.title = "Activer/Désactiver la lettrine";
lettrineBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;


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

// =====================================================================
// ACTION : COINS ARRONDIS (Border Radius Visuel et Intuitif)
// =====================================================================

const imgRadiusBtn = document.createElement('button');
imgRadiusBtn.innerHTML = '<span style="border-radius: 8px 2px 8px 2px; border: 2px solid currentColor; width: 14px; height: 14px; display: inline-block; box-sizing: border-box;"></span>';
imgRadiusBtn.title = "Modifier l'arrondi des coins";
imgRadiusBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;

// Nouveau conteneur avec un fond distinct pour bien regrouper l'outil
const imgRadiusInputWrapper = document.createElement('div');
imgRadiusInputWrapper.style.cssText = "display: none; align-items: center; gap: 0.5rem; background: var(--theme-bg); padding: 0.3rem; border-radius: 4px; border: 1px solid var(--theme-sun);";

// Grille 2x2 pour représenter visuellement les 4 coins
const radiusGrid = document.createElement('div');
radiusGrid.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 0.2rem;";

function createCornerInput(title, placeholder) {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.placeholder = placeholder;
    input.title = title;
    input.style.cssText = `width: 45px; padding: 0.1rem; border: 1px solid var(--grey-900); background: #fff; font-family: inherit; font-size: 0.8rem; outline: none; text-align: center;`;
    return input;
}

const inputTL = createCornerInput("Haut Gauche (px)", "0");
inputTL.style.borderTopLeftRadius = "6px"; 

const inputTR = createCornerInput("Haut Droit (px)", "0");
inputTR.style.borderTopRightRadius = "6px";

const inputBL = createCornerInput("Bas Gauche (px)", "0");
inputBL.style.borderBottomLeftRadius = "6px";

const inputBR = createCornerInput("Bas Droit (px)", "0");
inputBR.style.borderBottomRightRadius = "6px";

// Attention à l'ordre d'insertion pour respecter la grille 2x2 (HautG, HautD, BasG, BasD)
radiusGrid.append(inputTL, inputTR, inputBL, inputBR);

const imgRadiusSubmit = document.createElement('button');
imgRadiusSubmit.innerHTML = '✓';
imgRadiusSubmit.title = "Appliquer les arrondis";
imgRadiusSubmit.style.cssText = `background-color: var(--theme-sun); color: white; border: none; border-radius: 4px; width: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: bold; align-self: stretch;`;

imgRadiusInputWrapper.append(radiusGrid, imgRadiusSubmit);

const imgToolsContainer = document.createElement('div');
imgToolsContainer.style.cssText = "display: none; align-items: center; gap: 0.3rem; border-right: 1px solid var(--grey-900); padding-right: 0.5rem; margin-right: 0.2rem;";
imgToolsContainer.append(imgAlignLeft, imgAlignCenter, imgAlignRight, imgCropBtn, imgRadiusBtn, imgRadiusInputWrapper, imgResizeSlider);

// Outils de Grille (Colonnes)
function createGridBtn(iconHtml, title) {
    const btn = document.createElement('button');
    btn.innerHTML = iconHtml; btn.title = title;
    btn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;
    return btn;
}
const gridToolsContainer = document.createElement('div');
gridToolsContainer.style.cssText = "display: none; align-items: center; gap: 0.3rem; border-right: 1px solid var(--grey-900); padding-right: 0.5rem; margin-right: 0.2rem;";

// Icônes natives DSFR pour le haut, le centre et le bas + un pot de peinture pour la couleur
const gridAlignTop = createGridBtn('<span class="fr-icon-arrow-up-line" style="font-size: 0.85rem;"></span>', 'Aligner le contenu en haut');
const gridAlignCenter = createGridBtn('<span class="fr-icon-menu-line" style="font-size: 0.85rem;"></span>', 'Centrer le contenu verticalement');
const gridAlignBottom = createGridBtn('<span class="fr-icon-arrow-down-line" style="font-size: 0.85rem;"></span>', 'Aligner le contenu en bas');
const gridColorCol = createGridBtn('<span class="fr-icon-paint-fill" style="font-size: 0.85rem;"></span>', 'Colorer la colonne avec le thème');

gridToolsContainer.append(gridAlignTop, gridAlignCenter, gridAlignBottom, gridColorCol);


// --- AJOUT : Bouton pour changer la puce d'une liste ---
const bulletPictoBtn = document.createElement('button');
bulletPictoBtn.innerHTML = '<span class="fr-icon-star-fill" style="font-size: 0.85rem;"></span>';
bulletPictoBtn.title = "Remplacer la puce par un picto";
bulletPictoBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;
// -------------------------------------------------------

// Plus bas, ajoutez-le au floatToolbar
floatToolbar.appendChild(bulletPictoBtn);

// --- NOUVEAU : Bouton pour une image personnalisée ---
const customBulletBtn = document.createElement('button');
customBulletBtn.innerHTML = '<span class="fr-icon-image-add-line" style="font-size: 0.85rem;"></span>';
customBulletBtn.title = "Importer une image personnalisée pour la puce";
customBulletBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: none; align-items: center; justify-content: center; font-size: 1rem; color: var(--theme-sun);`;

floatToolbar.appendChild(customBulletBtn);

function applyCustomBullet(targetElement) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png, image/jpeg, image/webp, image/svg+xml';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(readerEvent) {
            const img = new Image();
            img.onload = function() {
                // On crée un mini-canvas (64x64 pixels suffisent largement pour une puce)
                const canvas = document.createElement('canvas');
                const size = 64; 
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                // Calcul pour centrer et garder les proportions
                const scale = Math.min(size / img.width, size / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (size - w) / 2;
                const y = (size - h) / 2;

                ctx.clearRect(0, 0, size, size);
                ctx.drawImage(img, x, y, w, h);

                // Export en PNG léger
                const base64 = canvas.toDataURL('image/png');
                
                targetElement.classList.add('plume-custom-bullet');

                // Application des styles sur la balise <li>
                targetElement.style.listStyleType = 'none';
                targetElement.style.backgroundImage = `url('${base64}')`;
                targetElement.style.backgroundRepeat = 'no-repeat';
                targetElement.style.backgroundPosition = 'left 0.3rem'; 
                targetElement.style.backgroundSize = '1.2rem';
                targetElement.style.paddingLeft = '1.8rem';

                hideFloatToolbar();
                if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
            };
            img.src = readerEvent.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}



// Assemblage final
floatToolbar.appendChild(textStyleSelect);
floatToolbar.appendChild(lettrineBtn);
floatToolbar.appendChild(cleanBtn);
floatToolbar.appendChild(editLinkBtn);
floatToolbar.appendChild(imgToolsContainer);
floatToolbar.appendChild(gridToolsContainer);
floatToolbar.appendChild(moveUpBtn);
floatToolbar.appendChild(moveDownBtn);
floatToolbar.appendChild(resizeBtn);
floatToolbar.appendChild(gridLayoutSelect);
floatToolbar.appendChild(gridLayoutInputWrapper);
floatToolbar.appendChild(trashBtn);
document.body.appendChild(floatToolbar);

let hoveredBlock = null;
let activeLinkNode = null;
const blockSelectors = '.fr-table, .plume-grid, .fr-summary, .fr-callout, hr, img, [contenteditable="false"], p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol,li';

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

    let block = e.target.closest(blockSelectors);
    if (block && block.parentNode && block.parentNode.classList && block.parentNode.classList.contains('plume-grid')) {
        block = block.parentNode;
    }

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
                if (tagName === 'P') {
                    lettrineBtn.style.display = 'flex';
                    // Met le bouton en surbrillance si la lettrine est déjà active
                    lettrineBtn.style.backgroundColor = hoveredBlock.classList.contains('plume-lettrine') ? '#e3e3fd' : '#fff';
                } else {
                    lettrineBtn.style.display = 'none';
                }
            } else {
                textStyleSelect.style.display = 'none';
                cleanBtn.style.display = 'none';
                lettrineBtn.style.display = 'none';
            }

            if (tagName === 'IMG') {
                imgToolsContainer.style.display = 'flex';
                const currentWidth = hoveredBlock.style.width || '100%';
                imgResizeSlider.value = parseInt(currentWidth);
            } else {
                imgToolsContainer.style.display = 'none';
            }
            // NOUVEAU : Affichage conditionnel des outils de grille
            if (hoveredBlock.closest('.plume-grid')) {
                gridToolsContainer.style.display = 'flex';
            } else {
                gridToolsContainer.style.display = 'none';
            }

            if (hoveredBlock.classList.contains('plume-grid') || hoveredBlock.classList.contains('fr-table')) {
                resizeBtn.style.display = 'flex';
            } else {
                resizeBtn.style.display = 'none';
            }
            
            if (activeLinkNode) {
                editLinkBtn.style.display = 'flex';
            } else {
                editLinkBtn.style.display = 'none';
            }
            if (tagName === 'LI' && hoveredBlock.closest('ul')) {
                bulletPictoBtn.style.display = 'flex';
                customBulletBtn.style.display = 'flex'; // Affiche le bouton personnalisé
                
                // Action : Picto DSFR
                bulletPictoBtn.onclick = () => {
                    openDsfrGalleryModal('bullet', hoveredBlock);
                };
                
                // Action : Image personnalisée
                customBulletBtn.onclick = () => {
                    applyCustomBullet(hoveredBlock);
                };
            } else {
                bulletPictoBtn.style.display = 'none';
                customBulletBtn.style.display = 'none'; // Cache le bouton personnalisé
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
    imgRadiusInputWrapper.style.display = 'none';
    imgRadiusBtn.style.backgroundColor = '#fff';
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
    w.style.display = 'block'; w.style.float = 'left'; w.style.margin = '0rem 0.5rem 0rem 0.5rem';
};

imgAlignCenter.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    w.style.display = 'flex'; w.style.justifyContent = 'center'; w.style.float = 'none'; w.style.margin = '1.5rem 0';
};

imgAlignRight.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    w.style.display = 'block'; w.style.float = 'right'; w.style.margin = '0rem 0.5rem 0rem 0.5rem';
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

// =====================================================================
// ACTION : COINS ARRONDIS (Border Radius Individuel)
// =====================================================================

// --- LOGIQUE D'INTERACTION ---

// Afficher/Masquer l'outil et pré-remplir les champs
imgRadiusBtn.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const isHidden = imgRadiusInputWrapper.style.display === 'none';
    
    imgRadiusInputWrapper.style.display = isHidden ? 'flex' : 'none';
    imgRadiusBtn.style.backgroundColor = isHidden ? '#e3e3fd' : '#fff';
    
    if (isHidden) {
        const currentRadius = hoveredBlock.style.borderRadius;
        let tl = '', tr = '', br = '', bl = '';
        
        // Décryptage intelligent de la propriété CSS existante
        if (currentRadius) {
            const parts = currentRadius.replace(/px/g, '').split(' ').filter(p => p !== '');
            if (parts.length === 1) {
                tl = tr = br = bl = parts[0];
            } else if (parts.length === 2) {
                tl = br = parts[0];
                tr = bl = parts[1];
            } else if (parts.length === 3) {
                tl = parts[0];
                tr = bl = parts[1];
                br = parts[2];
            } else if (parts.length === 4) {
                tl = parts[0]; tr = parts[1]; br = parts[2]; bl = parts[3];
            }
        }
        
        inputTL.value = tl;
        inputTR.value = tr;
        inputBR.value = br;
        inputBL.value = bl;
        
        inputTL.focus();
    }
};

// Application du style
const applyImgRadius = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    
    const vTL = inputTL.value.trim() || '0';
    const vTR = inputTR.value.trim() || '0';
    const vBL = inputBL.value.trim() || '0';
    const vBR = inputBR.value.trim() || '0';
    
    if (vTL === '0' && vTR === '0' && vBL === '0' && vBR === '0') {
        hoveredBlock.style.borderRadius = ''; // Réinitialisation propre
    } else {
        // Application stricte de l'ordre CSS : Top-Left, Top-Right, Bottom-Right, Bottom-Left
        hoveredBlock.style.borderRadius = `${vTL}px ${vTR}px ${vBR}px ${vBL}px`;
    }
    
    imgRadiusInputWrapper.style.display = 'none';
    imgRadiusBtn.style.backgroundColor = '#fff';
};

imgRadiusSubmit.onclick = applyImgRadius;

// Validation rapide via la touche Entrée sur n'importe quel champ
[inputTL, inputTR, inputBL, inputBR].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') applyImgRadius();
    });
});

// 4. ACTIONS DES BOUTONS (Texte & Structure)

lettrineBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!hoveredBlock || hoveredBlock.tagName !== 'P') return;
    
    // Ajoute ou retire la classe CSS
    hoveredBlock.classList.toggle('plume-lettrine');
    
    // Change l'apparence du bouton instantanément
    if (hoveredBlock.classList.contains('plume-lettrine')) {
        lettrineBtn.style.backgroundColor = '#e3e3fd';
    } else {
        lettrineBtn.style.backgroundColor = '#fff';
    }
});


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
    if (hoveredBlock.classList.contains('plume-grid')) {
        const gridInner = hoveredBlock.querySelector(':scope > div');
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
    let gridInner = null;

    if (hoveredBlock.classList.contains('plume-grid')) {
        gridInner = hoveredBlock.querySelector(':scope > div');
        if (gridInner) n = Array.from(gridInner.children).filter(c => c.tagName === 'DIV').length;
    } else if (hoveredBlock.classList.contains('fr-table')) {
        n = hoveredBlock.querySelector('table').querySelector('tr').children.length;
    }

    if (parts.length !== n) {
        // Feedback erreur visuelle sur le champ texte
        gridLayoutInput.style.borderColor = 'red';
        setTimeout(() => { gridLayoutInput.style.borderColor = 'var(--theme-sun)'; }, 1000);
        return false;
    }

    if (hoveredBlock.classList.contains('plume-grid') && gridInner) {
        const cols = Array.from(gridInner.children).filter(c => c.tagName === 'DIV');
        cols.forEach((col, i) => { 
            // Séparation propre du flex pour forcer le navigateur
            col.style.flexGrow = parts[i];
            col.style.flexShrink = '1';
            col.style.flexBasis = '0%';
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
        if (hoveredBlock.classList.contains('plume-grid')) {
            const gridInner = hoveredBlock.querySelector(':scope > div');
            if (gridInner) n = Array.from(gridInner.children).filter(c => c.tagName === 'DIV').length;
        } else if (hoveredBlock.classList.contains('fr-table')) {
            n = hoveredBlock.querySelector('table').querySelector('tr').children.length;
        }
        
        if(n > 0) {
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
// ACTIONS DES BOUTONS DE GRILLE (Colonnes et Alignements)
// =====================================================================
gridAlignTop.onclick = () => {
    const grid = hoveredBlock.closest('.plume-grid');
    if (grid) grid.firstElementChild.style.alignItems = 'flex-start';
};

gridAlignCenter.onclick = () => {
    const grid = hoveredBlock.closest('.plume-grid');
    if (grid) grid.firstElementChild.style.alignItems = 'center';
};

gridAlignBottom.onclick = () => {
    const grid = hoveredBlock.closest('.plume-grid');
    if (grid) grid.firstElementChild.style.alignItems = 'flex-end';
};

gridColorCol.onclick = () => {
    // 1. On cherche d'abord si l'utilisateur est dans une colonne spécifique
    let target = hoveredBlock.closest('.plume-grid > div > div');
    
    // 2. Sinon, s'il a cliqué sur la bordure de la grille, on cible la grille entière
    if (!target && hoveredBlock.classList.contains('plume-grid')) {
        target = hoveredBlock; 
    }
    
    if (target) {
        // Effet "Bascule" (Toggle)
        if (target.style.backgroundColor) {
            target.style.backgroundColor = '';
            target.style.padding = target.classList.contains('plume-grid') ? '' : '5px';
            target.style.borderRadius = '';
        } else {
            // Utilisation magique de la variable CSS du thème !
            target.style.backgroundColor = 'var(--theme-bg)';
            target.style.padding = '1.5rem';
            target.style.borderRadius = '4px';
        }
    }
};


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

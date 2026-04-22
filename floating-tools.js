/**
 * MODULE OUTILS FLOTTANTS - PLUME
 * Gestion de la barre contextuelle (Texte, Images, Tableaux, Grilles, Corbeille)
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

const textStyleSelect = document.createElement('select');
textStyleSelect.innerHTML = `<option value="P">Paragraphe</option><option value="H2">Titre 2</option><option value="H3">Titre 3</option><option value="H4">Titre 4</option><option value="BLOCKQUOTE">Citation</option>`;
textStyleSelect.style.cssText = `padding: 0.2rem 0.5rem; border: 1px solid var(--grey-900); border-radius: 4px; font-family: inherit; font-size: 0.85rem; background: #f5f5fe; cursor: pointer; outline: none;`;

const cleanBtn = document.createElement('button');
cleanBtn.innerHTML = '🧹'; cleanBtn.title = "Nettoyer les styles parasites";
cleanBtn.style.cssText = `background-color: #fff; border: 1px solid var(--grey-900); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;`;

const resizeBtn = document.createElement('button');
resizeBtn.innerHTML = '📏'; resizeBtn.title = "Modifier la largeur des colonnes";
resizeBtn.style.cssText = `background-color: #f5f5fe; border: 1px solid var(--theme-sun); border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.1rem;`;

const trashBtn = document.createElement('button');
trashBtn.innerHTML = '<span class="fr-icon-delete-bin-fill"></span>'; trashBtn.title = "Supprimer ce bloc";
trashBtn.style.cssText = `background-color: #ffe8e5; color: #e1000f; border: 1px solid #e1000f; border-radius: 4px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center;`;

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
const imgMoveUp = createImgBtn('fr-icon-arrow-up-line', 'Monter l\'image');
const imgMoveDown = createImgBtn('fr-icon-arrow-down-line', 'Descendre l\'image');
const imgCropBtn = createImgBtn('fr-icon-image-edit-line', 'Recadrer (Original / Carré / 16:9)');

const imgResizeSlider = document.createElement('input');
imgResizeSlider.type = 'range'; imgResizeSlider.min = '15'; imgResizeSlider.max = '100'; imgResizeSlider.value = '100';
imgResizeSlider.title = "Ajuster la taille";
imgResizeSlider.style.cssText = "width: 70px; margin: 0 0.5rem; cursor: pointer;";

const imgToolsContainer = document.createElement('div');
imgToolsContainer.style.cssText = "display: none; align-items: center; gap: 0.3rem; border-right: 1px solid var(--grey-900); padding-right: 0.5rem; margin-right: 0.2rem;";
imgToolsContainer.append(imgAlignLeft, imgAlignCenter, imgAlignRight, imgMoveUp, imgMoveDown, imgCropBtn, imgResizeSlider);

// Assemblage final
floatToolbar.appendChild(textStyleSelect);
floatToolbar.appendChild(cleanBtn);
floatToolbar.appendChild(imgToolsContainer);
floatToolbar.appendChild(resizeBtn);
floatToolbar.appendChild(trashBtn);
document.body.appendChild(floatToolbar);

let hoveredBlock = null;
const blockSelectors = '.fr-table, .custom-grid, .fr-summary, .fr-callout, hr, img, [contenteditable="false"], p, h1, h2, h3, h4, h5, h6, blockquote, ul, ol';

// 2. Traque de la souris
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

            const rect = hoveredBlock.getBoundingClientRect();
            floatToolbar.style.top = (window.scrollY + rect.top - 40) + 'px';
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
    floatToolbar.style.display = 'none';
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

imgMoveUp.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    const prev = w.previousElementSibling;
    if (prev) w.parentNode.insertBefore(w, prev);
    hideFloatToolbar();
};

imgMoveDown.onclick = () => {
    if (!hoveredBlock || hoveredBlock.tagName !== 'IMG') return;
    const w = getImgWrapper(hoveredBlock);
    const next = w.nextElementSibling;
    if (next) w.parentNode.insertBefore(w, next.nextElementSibling);
    hideFloatToolbar();
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
        hoveredBlock.classList.add('block-hover-focus'); 
    }
    const children = hoveredBlock.querySelectorAll('*');
    children.forEach(child => {
        child.removeAttribute('style');
        Array.from(child.attributes).forEach(attr => {
            if (attr.name !== 'href' && attr.name !== 'src' && attr.name !== 'alt') {
                child.removeAttribute(attr.name);
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

trashBtn.addEventListener('click', function() {
    if (hoveredBlock) {
        const target = hoveredBlock.tagName === 'IMG' ? getImgWrapper(hoveredBlock) : hoveredBlock;
        target.remove();
        hideFloatToolbar();
    }
});

resizeBtn.addEventListener('click', function() {
    if (!hoveredBlock) return;
    if (hoveredBlock.classList.contains('custom-grid')) {
        const gridInner = hoveredBlock.querySelector('div[style*="display: flex"]');
        if (!gridInner) return;
        const cols = Array.from(gridInner.children).filter(c => c.tagName === 'DIV');
        const n = cols.length;
        const input = prompt(`Répartition de vos ${n} colonnes.\nEntrez les proportions (ex: 30/70) :`, n === 2 ? "50/50" : "33/33/33");
        if (!input) return;
        const parts = input.split(/[\/\-\+,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        if (parts.length === n) cols.forEach((col, i) => { col.style.flex = parts[i]; col.style.maxWidth = "none"; });
        else alert("Format invalide.");
    }
    else if (hoveredBlock.classList.contains('fr-table')) {
        const table = hoveredBlock.querySelector('table');
        if (!table) return;
        const firstRow = table.querySelector('tr');
        if (!firstRow) return;
        const n = firstRow.children.length;
        const input = prompt(`Répartition des ${n} colonnes.\nEntrez les proportions (ex: 30/70) :`, n === 2 ? "50/50" : "33/33/33");
        if (!input) return;
        const parts = input.split(/[\/\-\+,;\s]+/).map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
        if (parts.length === n) {
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
        } else { alert("Format invalide."); }
    }
});


/**
 * MODULE ARBRE DÉCISIONNEL - PLUME
 * Interface de création et d'intégration d'arbres de décision vectoriels.
 */

const TREE_PALETTE_GRADIENTS = {
    categorical: "linear-gradient(to right, #5C68E5, #82B5F2, #29598F, #31A7AE, #81EEF5, #B478F1, #CFB1F5, #CECECE)",
    emeraudeAscending: "linear-gradient(to right, #00A95F, #e3fdeb)",
    cumulusAscending: "linear-gradient(to right, #417DC4, #f3f6fe)",
    tuileAscending: "linear-gradient(to right, #CE614A, #fef4f3)",
    tournesolAscending: "linear-gradient(to right, #C8AA39, #fef6e3)",
    grisGaletAscending: "linear-gradient(to right, #AEA397, #f9f8f6)",
    jauneCitronAscending: "linear-gradient(to right, #FEE902, #fffef0)",
    vertVifAscending: "linear-gradient(to right, #A2D929, #f6fdf1)",
    orangeEclatantAscending: "linear-gradient(to right, #FF732C, #fef5f0)",
    roseFuschiaAscending: "linear-gradient(to right, #FF4B8A, #fef1f6)",
    turquoiseAscending: "linear-gradient(to right, #00B9B7, #e6fdfd)",
    brunTerreAscending: "linear-gradient(to right, #A76E4B, #f6f0ec)"
};

const TREE_DSFR_ICONS = {
    "buildings": ["building-fill", "hospital-fill", "bank-fill"],
    "business": ["briefcase-fill", "pie-chart-fill", "bar-chart-fill"],
    "design": ["hammer-fill", "edit-fill", "tools-fill"],
    "document": ["article-fill", "file-text-fill", "folder-2-fill"],
    "system": ["settings-5-fill", "alert-fill", "check-line", "close-circle-fill", "search-fill", "question-fill"],
    "user": ["user-fill", "team-fill", "admin-fill"]
};

// --- Variables d'état globales de l'arbre ---
let treeData = null;
let treeNodeCounter = 10;
let treeFlatNodeList = [];

// Pan & Zoom
let treeVbX = 0, treeVbY = 0, treeVbWidth = 1600, treeVbHeight = 1200;
let isTreePanning = false;
let treeStartPanX = 0, treeStartPanY = 0;
let treeStartVbX = 0, treeStartVbY = 0;

const TREE_DEFAULT_TYPO = { fontFamily: "'Marianne', system-ui, sans-serif", fontSize: 24, isBold: false, isItalic: false };
const TREE_LIB_PREFIX = "../libs/dsfr-v1.14.3/dist/icons/";
const TREE_HORIZ_GAP = 60;
const TREE_VERT_GAP = 140;

function initTreeData(existingConfig = null) {
    if (existingConfig) {
        treeData = existingConfig.treeData;
        treeNodeCounter = existingConfig.treeNodeCounter || 100;
    } else {
        treeData = {
            id: "root",
            text: "Le projet est-il\nstratégique ?",
            color: "cumulusAscending",
            textColor: "#FFFFFF",
            shape: "diamond",
            size: 280,
            edgeLabel: "",
            icon: null, // Par défaut pas d'icône pour éviter les dépendances de chemin absentes
            ...TREE_DEFAULT_TYPO,
            isBold: true,
            children: [
                {
                    id: "node_1", text: "Déploiement\nImmédiat", color: "vertVifAscending", textColor: "#000000", shape: "rect", size: 240, edgeLabel: "Oui", icon: null, ...TREE_DEFAULT_TYPO, children: []
                },
                {
                    id: "node_2", text: "Analyse des\nrisques", color: "tournesolAscending", textColor: "#000000", shape: "rect", size: 240, edgeLabel: "Non", icon: null, ...TREE_DEFAULT_TYPO, children: [
                        { id: "node_3", text: "Projet Rejeté", color: "roseFuschiaAscending", textColor: "#000000", shape: "rect", size: 200, edgeLabel: "Risque Élevé", icon: null, ...TREE_DEFAULT_TYPO, children: [] },
                        { id: "node_4", text: "Validation\nComité", color: "grisGaletAscending", textColor: "#000000", shape: "rect", size: 200, edgeLabel: "Risque Modéré", icon: null, ...TREE_DEFAULT_TYPO, children: [] }
                    ]
                }
            ]
        };
        treeNodeCounter = 10;
    }
}

// Fonction principale d'ouverture
function insertArbreDecision() {
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <style>
            .tree-sidebar { width: 380px; background: #fff; border-right: 1px solid var(--grey-900); padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; overflow-x: hidden; flex-shrink: 0; }
            .tree-workspace { flex-grow: 1; position: relative; overflow: hidden; background-color: #f6f6f6; background-image: radial-gradient(#d0d0d0 1px, transparent 1px); background-size: 24px 24px; touch-action: none; cursor: grab;}
            .tree-workspace:active { cursor: grabbing; }
            .tree-control-group { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; width: 100%; box-sizing: border-box; }
            .tree-row-group { display: flex; gap: 0.5rem; align-items: flex-end; width: 100%; }
            .tree-control-group .fr-input, .tree-control-group .fr-select { width: 100%; margin: 0; box-sizing: border-box; }
            
            .tree-sidebar details { background: var(--theme-bg); border: 1px solid var(--grey-900); border-radius: 4px; margin-bottom: 0.5rem; }
            .tree-sidebar summary { font-weight: 700; font-size: 0.95rem; padding: 0.75rem; cursor: pointer; color: var(--theme-sun); list-style: none; display: flex; justify-content: space-between; align-items: center; }
            .tree-sidebar summary::-webkit-details-marker { display: none; }
            .tree-sidebar summary::after { content: '▼'; font-size: 0.75em; transition: transform 0.3s ease; }
            .tree-sidebar details[open] summary::after { transform: rotate(-180deg); }
            .tree-sidebar details[open] summary { border-bottom: 1px solid var(--grey-900); }
            .tree-details-content { padding: 1rem; display: flex; flex-direction: column; }
            
            .tree-zoom-controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 100; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
            
            .tree-node-group { cursor: pointer; }
            .tree-node-group rect, .tree-node-group circle, .tree-node-group polygon { transition: stroke-width 0.2s, stroke 0.2s; }
            .tree-node-group:hover rect, .tree-node-group:hover circle, .tree-node-group:hover polygon { stroke: #000091; stroke-width: 4px; }
            .tree-edge-group path.tree-visible-edge { transition: stroke 0.2s, stroke-width 0.2s; }
            .tree-edge-group rect.tree-label-bg { transition: stroke 0.2s; }
        </style>

        <div class="chart-modal" style="width: 1400px; max-width: 95vw; height: 85vh; display: flex; overflow: hidden;">
            <div class="tree-sidebar">
                <h3 style="margin:0 0 1rem 0; color:var(--theme-sun); font-size:1.1rem;">
                    <span class="fr-icon-git-branch-line"></span> Studio Arbre de Décision
                </h3>

                <div class="tree-control-group">
                    <label class="fr-label">Élément sélectionné :</label>
                    <select id="tree-node-select" class="fr-select"></select>
                </div>

                <details open>
                    <summary>Contenu & Typographie</summary>
                    <div class="tree-details-content">
                        <div class="tree-control-group">
                            <label class="fr-label" style="font-size: 0.8rem;">Texte du bloc</label>
                            <textarea id="tree-node-text" class="fr-input" rows="3"></textarea>
                        </div>
                        <div class="tree-control-group" id="tree-edge-label-group">
                            <label class="fr-label" style="font-size: 0.8rem; color: #000091;">Texte du lien (venant du parent)</label>
                            <input type="text" id="tree-node-edge-label" class="fr-input" placeholder="Ex: Oui, Non, > 50...">
                        </div>
                        
                        <div class="tree-control-group" style="margin-top: 0.5rem;">
                        <select id="tree-node-font-family" class="fr-select" style="margin-bottom: 0.5rem;">
                                <option value="'Marianne', system-ui, sans-serif">Marianne</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="Georgia, serif">Georgia</option>
                            </select>
                            <div class="tree-row-group">
                                <div style="flex: 1;">
                                    <label class="fr-label" style="font-size: 0.8rem;">Taille</label>
                                    <input type="number" id="tree-node-font-size" class="fr-input" value="24" min="8" max="72">
                                </div>
                                <div style="flex: 2;">
                                    <label class="fr-label" style="font-size: 0.8rem;">Couleur texte</label>
                                    <select id="tree-node-text-color" class="fr-select">
                                        <option value="#000000">Noir</option>
                                        <option value="#FFFFFF">Blanc</option>
                                        <option value="#000091">Bleu France</option>
                                    </select>
                                </div>
                            </div>
                            <div class="tree-row-group" style="margin-top: 0.5rem;">
                                <button id="tree-btn-bold" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex:1; justify-content:center; font-weight:bold;">Gras</button>
                                <button id="tree-btn-italic" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex:1; justify-content:center; font-style:italic;">Italique</button>
                            </div>
                        </div>
                    </div>
                </details>

                <details>
                    <summary>Forme & Apparence</summary>
                    <div class="tree-details-content">
                        <div class="tree-control-group">
                            <label class="fr-label">Forme de la bulle :</label>
                            <select id="tree-node-shape" class="fr-select">
                                <option value="rect">Rectangle (Instruction)</option>
                                <option value="diamond">Losange (Décision)</option>
                                <option value="circle">Cercle / Ovale</option>
                            </select>
                        </div>
                        <div class="tree-control-group">
                            <label class="fr-label">Couleur de fond :</label>
                            <select id="tree-node-color" class="fr-select"></select>
                        </div>
                        <div class="tree-control-group">
                            <label class="fr-label" style="margin-bottom: 0.5rem;">Largeur : <span id="tree-size-val">250</span>px</label>
                            <input type="range" id="tree-node-size" min="120" max="600" value="250" style="width: 100%; cursor: pointer;">
                        </div>
                    </div>
                </details>

                <details>
                    <summary>Icône DSFR (Optionnel)</summary>
                    <div class="tree-details-content">
                        <div class="tree-control-group">
                            <div class="tree-row-group">
                                <select id="tree-icon-theme-select" class="fr-select" style="flex: 1; padding: 0.25rem; font-size: 0.8rem;"></select>
                                <select id="tree-icon-select" class="fr-select" style="flex: 1; padding: 0.25rem; font-size: 0.8rem;"></select>
                            </div>
                            <div class="tree-row-group" style="margin-top: 0.5rem; justify-content: center;">
                                <img id="tree-icon-preview" src="" alt="" style="display: none; width: 32px; height: 32px; border: 1px solid #ccc; padding: 2px; border-radius: 4px; margin-right: 0.5rem;">
                                <button id="tree-btn-apply-icon" class="fr-btn fr-btn--sm" style="flex: 1; justify-content: center;">Appliquer</button>
                                <button id="tree-btn-remove-icon" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex: 1; justify-content: center;">Retirer</button>
                            </div>
                        </div>
                    </div>
                </details>

                <div class="tree-control-group" style="margin-top: 1rem;">
                    <div class="tree-row-group">
                        <button id="tree-btn-add-cond" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex: 1; justify-content: center; font-size: 0.8rem;" title="Ajoute un losange">+ Condition</button>
                        <button id="tree-btn-add-inst" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex: 1; justify-content: center; font-size: 0.8rem;" title="Ajoute un rectangle">+ Instruction</button>
                    </div>
                    <button id="tree-btn-delete" class="fr-btn fr-btn--sm" style="margin-top: 0.5rem; background-color: #ffe8e5; color: #e1000f; width: 100%; justify-content: center;"><span class="fr-icon-delete-bin-line fr-mr-1w"></span> Supprimer ce bloc</button>
                </div>

                <div style="margin-top:auto; padding-top: 1rem; border-top: 1px solid var(--grey-900); display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-tree-cancel" style="flex:1; justify-content: center;">Annuler</button>
                    <button class="fr-btn" id="btn-tree-insert" style="flex:1; justify-content: center;">Insérer</button>
                </div>
            </div>

            <!-- ZONE DE PRÉVISUALISATION -->
            <div class="tree-workspace" id="tree-preview-container">
                <svg id="tree-canvas" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                    <defs id="tree-gradient-defs"></defs>
                    <g id="tree-connectors"></g>
                    <g id="tree-nodes"></g>
                </svg>
                
                <div class="tree-zoom-controls">
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="tree-btn-zoom-out" title="Dézoomer">-</button>
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="tree-btn-zoom-reset" title="Recadrer la vue">Centrer</button>
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="tree-btn-zoom-in" title="Zoomer">+</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);

    // Initialisation
    initTreeData();
    initTreeGradients();
    initTreeIconMenu();
    updateTreeSelectMenu();
    loadTreeNodeData();
    renderTreeSVG();
    resetTreeZoom();

    // --- CÂBLAGE DES ÉVÉNEMENTS ---

    // Caméra (Pan & Zoom)
    document.getElementById('tree-btn-zoom-in').onclick = zoomTreeIn;
    document.getElementById('tree-btn-zoom-out').onclick = zoomTreeOut;
    document.getElementById('tree-btn-zoom-reset').onclick = resetTreeZoom;

    const workspace = document.getElementById('tree-preview-container');
    workspace.addEventListener('wheel', (e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.08 : 0.92;
        const svg = document.getElementById('tree-canvas');
        const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const ctm = svg.getScreenCTM(); if (!ctm) return;
        const svgP = pt.matrixTransform(ctm.inverse());
        const dw = treeVbWidth * factor - treeVbWidth;
        const dh = treeVbHeight * factor - treeVbHeight;
        treeVbX -= dw * ((svgP.x - treeVbX) / treeVbWidth);
        treeVbY -= dh * ((svgP.y - treeVbY) / treeVbHeight);
        treeVbWidth *= factor; treeVbHeight *= factor;
        applyTreeViewBox();
    }, { passive: false });

    workspace.addEventListener('pointerdown', (e) => {
        if (e.target.tagName === 'svg' || e.target.id === 'tree-preview-container') {
            isTreePanning = true;
            treeStartPanX = e.clientX; treeStartPanY = e.clientY;
            treeStartVbX = treeVbX; treeStartVbY = treeVbY;
        }
    });

    const pointerMoveHandler = (e) => {
        if (isTreePanning) {
            const svg = document.getElementById('tree-canvas');
            const svgRect = svg.getBoundingClientRect();
            const ratioX = treeVbWidth / svgRect.width;
            const ratioY = treeVbHeight / svgRect.height;
            treeVbX = treeStartVbX - ((e.clientX - treeStartPanX) * ratioX);
            treeVbY = treeStartVbY - ((e.clientY - treeStartPanY) * ratioY);
            applyTreeViewBox();
        }
    };
    const pointerUpHandler = () => { isTreePanning = false; };

    window.addEventListener('pointermove', pointerMoveHandler);
    window.addEventListener('pointerup', pointerUpHandler);

    // Interface Formulaire
    document.getElementById('tree-node-select').onchange = () => {
        loadTreeNodeData();
        renderTreeSVG();
    };

    const textInputs = ['tree-node-text', 'tree-node-edge-label', 'tree-node-font-size'];
    textInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateTreeNode);
    });

    const selectInputs = ['tree-node-color', 'tree-node-text-color', 'tree-node-shape', 'tree-node-font-family'];
    selectInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateTreeNode);
    });

    document.getElementById('tree-node-size').addEventListener('input', updateTreeNode);
    document.getElementById('tree-btn-bold').onclick = () => { toggleTreeTextStyle('bold'); };
    document.getElementById('tree-btn-italic').onclick = () => { toggleTreeTextStyle('italic'); };

    // Icônes
    document.getElementById('tree-icon-theme-select').onchange = populateTreeIconSelect;
    document.getElementById('tree-icon-select').onchange = updateTreeIconPreview;
    document.getElementById('tree-btn-apply-icon').onclick = applyTreeIcon;
    document.getElementById('tree-btn-remove-icon').onclick = removeTreeIcon;

    // Structure
    document.getElementById('tree-btn-add-cond').onclick = () => addTreeChildNode('condition');
    document.getElementById('tree-btn-add-inst').onclick = () => addTreeChildNode('instruction');
    document.getElementById('tree-btn-delete').onclick = removeTreeSelectedNode;

    // Fermeture
    document.getElementById('btn-tree-cancel').onclick = () => {
        window.removeEventListener('pointermove', pointerMoveHandler);
        window.removeEventListener('pointerup', pointerUpHandler);
        overlay.remove();
    };

    // Export et Insertion
    document.getElementById('btn-tree-insert').onclick = () => {
        const { source, w, h } = getCleanTreeSVGSource();
        const exportScale = 2; 
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
        
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = w * exportScale; 
            canvas.height = h * exportScale; 
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');

            const payload = { treeData: treeData, treeNodeCounter: treeNodeCounter };
            const safeConfig = encodeURIComponent(JSON.stringify(payload));

            const finalHTML = `
                <div class="plume-tree-container" data-tree-config="${safeConfig}" style="display: flex; justify-content: center; margin: 2.5rem 0;" contenteditable="false">
                    <img src="${imgData}" alt="Arbre décisionnel" style="max-width: 100%; height: auto; border: 1px solid var(--grey-900); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
                </div>
                <p><br></p>
            `;

            window.removeEventListener('pointermove', pointerMoveHandler);
            window.removeEventListener('pointerup', pointerUpHandler);
            overlay.remove(); 

            if (savedRange) {
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }
            if (typeof insertHTML === 'function') {
                insertHTML(finalHTML);
            } else {
                document.execCommand('insertHTML', false, finalHTML);
            }
        };
    };
}


// --- CAMÉRA ET VUE ---

function applyTreeViewBox() { 
    const canvas = document.getElementById('tree-canvas');
    if(canvas) canvas.setAttribute('viewBox', `${treeVbX} ${treeVbY} ${treeVbWidth} ${treeVbHeight}`); 
}

function zoomTreeIn() { treeVbX += (treeVbWidth * 0.1); treeVbY += (treeVbHeight * 0.1); treeVbWidth *= 0.8; treeVbHeight *= 0.8; applyTreeViewBox(); }
function zoomTreeOut() { treeVbX -= (treeVbWidth * 0.1); treeVbY -= (treeVbHeight * 0.1); treeVbWidth *= 1.2; treeVbHeight *= 1.2; applyTreeViewBox(); }
function resetTreeZoom() {
    calculateTreeLayout(treeData);
    const bounds = getTreeBounds(treeData);
    const padding = 100;
    treeVbWidth = (bounds.maxX - bounds.minX) + padding * 2;
    treeVbHeight = (bounds.maxY - bounds.minY) + padding * 2;
    treeVbX = bounds.minX - padding;
    treeVbY = bounds.minY - padding;
    if(treeVbHeight < 800) treeVbHeight = 800;
    if(treeVbWidth < 1000) { treeVbX -= (1000 - treeVbWidth)/2; treeVbWidth = 1000; }
    applyTreeViewBox();
}

// --- UTILITAIRES DE DONNÉES ---

function generateTreeId() { return 'node_' + (treeNodeCounter++); }

function flattenTree(node, prefix = "", list = []) {
    list.push({ id: node.id, text: prefix + (node.text.split('\n')[0] || "Bloc"), ref: node });
    if (node.children) {
        node.children.forEach(c => flattenTree(c, prefix + "— ", list));
    }
    return list;
}

function findNodeAndParent(id, currentNode = treeData, parent = null, index = -1) {
    if (currentNode.id === id) return { node: currentNode, parent, index };
    if (currentNode.children) {
        for (let i = 0; i < currentNode.children.length; i++) {
            const result = findNodeAndParent(id, currentNode.children[i], currentNode, i);
            if (result) return result;
        }
    }
    return null;
}

// --- INTERFACE (UI) ---

function initTreeGradients() {
    const defs = document.getElementById('tree-gradient-defs');
    const colorSelect = document.getElementById('tree-node-color');
    
    // SÉCURITÉ : On ne touche au <select> que s'il est présent à l'écran (modale ouverte)
    if (colorSelect) {
        colorSelect.innerHTML = '<option value="#FFFFFF">Blanc (Uni)</option>';
    }

    for (const [key, cssGradient] of Object.entries(TREE_PALETTE_GRADIENTS)) {
        const colors = cssGradient.match(/#[a-fA-F0-9]{3,6}/gi);
        if (colors) {
            const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
            linearGradient.setAttribute('id', 'tree-grad-' + key);
            linearGradient.setAttribute('x1', '0%'); linearGradient.setAttribute('y1', '0%');
            linearGradient.setAttribute('x2', '100%'); linearGradient.setAttribute('y2', '100%');
            colors.forEach((color, index) => {
                const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                stop.setAttribute('offset', (colors.length > 1 ? (index / (colors.length - 1)) * 100 : 0) + '%');
                stop.setAttribute('stop-color', color);
                linearGradient.appendChild(stop);
            });
            defs.appendChild(linearGradient);
            
            // SÉCURITÉ : On n'ajoute l'option que si le select existe
            if (colorSelect) {
                const opt = document.createElement('option'); opt.value = key; opt.textContent = key;
                colorSelect.appendChild(opt);
            }
        }
    }
}
function initTreeIconMenu() {
    const themeSelect = document.getElementById('tree-icon-theme-select');
    themeSelect.innerHTML = '<option value="">-- Thème --</option>';
    for (const theme in TREE_DSFR_ICONS) {
        const opt = document.createElement('option');
        opt.value = theme; opt.textContent = theme.charAt(0).toUpperCase() + theme.slice(1);
        themeSelect.appendChild(opt);
    }
}

function populateTreeIconSelect() {
    const themeVal = document.getElementById('tree-icon-theme-select').value;
    const iconSelect = document.getElementById('tree-icon-select');
    iconSelect.innerHTML = '<option value="">-- Icône --</option>';
    document.getElementById('tree-icon-preview').style.display = 'none';
    if (themeVal && TREE_DSFR_ICONS[themeVal]) {
        TREE_DSFR_ICONS[themeVal].forEach(iconName => {
            const opt = document.createElement('option'); opt.value = iconName; opt.textContent = iconName;
            iconSelect.appendChild(opt);
        });
    }
}

function updateTreeIconPreview() {
    const theme = document.getElementById('tree-icon-theme-select').value;
    const icon = document.getElementById('tree-icon-select').value;
    const preview = document.getElementById('tree-icon-preview');
    if (theme && icon && !icon.includes('[object')) {
        preview.src = `${TREE_LIB_PREFIX}${theme}/${icon}.svg`;
        preview.style.display = 'block';
    } else { preview.style.display = 'none'; }
}

async function loadTreeIconAsBase64(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return null;
        const svgText = await response.text();
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
    } catch (e) { return null; }
}

async function applyTreeIcon() {
    const { node } = findNodeAndParent(document.getElementById('tree-node-select').value);
    const theme = document.getElementById('tree-icon-theme-select').value;
    const icon = document.getElementById('tree-icon-select').value;
    if (theme && icon && !icon.includes('[object')) {
        const path = `${TREE_LIB_PREFIX}${theme}/${icon}.svg`;
        node.icon = path; 
        node.iconBase64 = await loadTreeIconAsBase64(path);
        renderTreeSVG(); 
    }
}

function removeTreeIcon() { 
    const { node } = findNodeAndParent(document.getElementById('tree-node-select').value);
    node.icon = null; node.iconBase64 = null;
    renderTreeSVG(); 
}

function updateTreeSelectMenu() {
    const select = document.getElementById('tree-node-select');
    const currentVal = select.value;
    treeFlatNodeList = flattenTree(treeData);
    select.innerHTML = '';
    treeFlatNodeList.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id; opt.textContent = item.text;
        select.appendChild(opt);
    });
    if (treeFlatNodeList.find(i => i.id === currentVal)) select.value = currentVal;
    else select.value = "root";
    toggleTreeContextButtons();
}

function toggleTreeContextButtons() {
    const isRoot = document.getElementById('tree-node-select').value === 'root';
    document.getElementById('tree-btn-delete').disabled = isRoot;
    document.getElementById('tree-edge-label-group').style.display = isRoot ? 'none' : 'flex';
}

function loadTreeNodeData() {
    toggleTreeContextButtons();
    const id = document.getElementById('tree-node-select').value;
    const { node } = findNodeAndParent(id);
    if(!node) return;

    document.getElementById('tree-node-text').value = node.text || "";
    document.getElementById('tree-node-edge-label').value = node.edgeLabel || "";
    document.getElementById('tree-node-color').value = node.color || "#FFFFFF";
    document.getElementById('tree-node-text-color').value = node.textColor || "#000000";
    document.getElementById('tree-node-shape').value = node.shape || "rect";
    document.getElementById('tree-node-font-size').value = node.fontSize || 24; 
    document.getElementById('tree-node-font-family').value = node.fontFamily || "'Marianne', system-ui, sans-serif";
    document.getElementById('tree-node-size').value = node.size || 250;
    document.getElementById('tree-size-val').textContent = node.size || 250;
    
    document.getElementById('tree-btn-bold').className = node.isBold ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary';
    document.getElementById('tree-btn-italic').className = node.isItalic ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary';

    const themeSelect = document.getElementById('tree-icon-theme-select');
    const iconSelect = document.getElementById('tree-icon-select');
    themeSelect.value = ""; iconSelect.innerHTML = '<option value="">-- Icône --</option>';
    document.getElementById('tree-icon-preview').style.display = 'none';

    if (node.icon) {
        const parts = node.icon.split('/');
        if (parts.length >= 2) {
            const iconName = parts.pop().replace('.svg', ''); 
            const themeName = parts.pop();
            if (TREE_DSFR_ICONS[themeName]) {
                themeSelect.value = themeName; populateTreeIconSelect(); 
                iconSelect.value = iconName; updateTreeIconPreview();
            }
        }
    }
}

function updateTreeNode() {
    const { node } = findNodeAndParent(document.getElementById('tree-node-select').value);
    const oldText = node.text;

    node.text = document.getElementById('tree-node-text').value;
    node.edgeLabel = document.getElementById('tree-node-edge-label').value;
    node.color = document.getElementById('tree-node-color').value;
    node.textColor = document.getElementById('tree-node-text-color').value;
    node.shape = document.getElementById('tree-node-shape').value;
    node.fontSize = Number(document.getElementById('tree-node-font-size').value) || 24;
    node.fontFamily = document.getElementById('tree-node-font-family').value;
    node.size = Number(document.getElementById('tree-node-size').value) || 250;
    document.getElementById('tree-size-val').textContent = node.size;
    
    if (oldText !== node.text) { updateTreeSelectMenu(); }
    renderTreeSVG();
}

function toggleTreeTextStyle(style) {
    const { node } = findNodeAndParent(document.getElementById('tree-node-select').value);
    if(style === 'bold') node.isBold = !node.isBold;
    if(style === 'italic') node.isItalic = !node.isItalic;
    loadTreeNodeData(); renderTreeSVG();
}

// --- ACTIONS SUR L'ARBRE ---

function addTreeChildNode(type) {
    const id = document.getElementById('tree-node-select').value;
    const { node } = findNodeAndParent(id);
    if(!node.children) node.children = [];
    
    let newNode;
    if (type === 'condition') {
        newNode = { id: generateTreeId(), text: "Nouvelle\nCondition", color: "tournesolAscending", textColor: "#000000", shape: "diamond", size: 240, edgeLabel: "Lien", icon: null, ...TREE_DEFAULT_TYPO, children: [] };
    } else {
        newNode = { id: generateTreeId(), text: "Nouvelle\nInstruction", color: "grisGaletAscending", textColor: "#000000", shape: "rect", size: 240, edgeLabel: "Lien", icon: null, ...TREE_DEFAULT_TYPO, children: [] };
    }
    
    node.children.push(newNode);
    updateTreeSelectMenu(); 
    document.getElementById('tree-node-select').value = newNode.id;
    loadTreeNodeData(); 
    renderTreeSVG();
    resetTreeZoom();
}

function removeTreeSelectedNode() {
    const id = document.getElementById('tree-node-select').value;
    if (id === 'root') return;
    const { parent, index } = findNodeAndParent(id);
    if(parent && index > -1) {
        parent.children.splice(index, 1);
        updateTreeSelectMenu(); loadTreeNodeData(); renderTreeSVG();
    }
}

function selectTreeNodeFromCanvas(id) {
    document.getElementById('tree-node-select').value = id;
    loadTreeNodeData(); renderTreeSVG(); 
}

// --- MOTEUR SVG (RENDU) ---

function calculateTreeLayout(node) {
    const nodeWidth = Number(node.size) || 200;
    if (!node.children || node.children.length === 0) {
        node.treeWidth = nodeWidth + TREE_HORIZ_GAP;
        return;
    }
    let childrenWidth = 0;
    node.children.forEach(child => {
        calculateTreeLayout(child);
        childrenWidth += child.treeWidth;
    });
    node.treeWidth = Math.max(nodeWidth + TREE_HORIZ_GAP, childrenWidth);
}

function positionTree(node, x, y) {
    node.x = x; node.y = y;
    if (!node.children || node.children.length === 0) return;
    let startX = x - (node.treeWidth / 2);
    const parentHeight = node.shape === 'rect' ? (node.size / 1.5) : node.size;
    node.children.forEach(child => {
        let childX = startX + (child.treeWidth / 2);
        let childY = y + parentHeight/2 + TREE_VERT_GAP + (child.shape === 'rect' ? child.size/3 : child.size/2);
        positionTree(child, childX, childY);
        startX += child.treeWidth;
    });
}

function getTreeBounds(node, bounds = {minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity}) {
    const size = Number(node.size) || 200;
    const safeRadius = size * 0.8;
    if(node.x - safeRadius < bounds.minX) bounds.minX = node.x - safeRadius;
    if(node.x + safeRadius > bounds.maxX) bounds.maxX = node.x + safeRadius;
    if(node.y - safeRadius < bounds.minY) bounds.minY = node.y - safeRadius;
    if(node.y + safeRadius > bounds.maxY) bounds.maxY = node.y + safeRadius;
    
    if (node.children && node.children.length > 0) {
        node.children.forEach(c => getTreeBounds(c, bounds));
    }
    return bounds;
}

function drawTreeEdge(parentGrp, parentNode, childNode) {
    const pW = parentNode.size/2;
    const pH = parentNode.shape === 'rect' ? pW/1.5 : pW;
    const cW = childNode.size/2;
    const cH = childNode.shape === 'rect' ? cW/1.5 : cW;

    const startX = parentNode.x;
    const startY = parentNode.y + pH;
    const endX = childNode.x;
    const endY = childNode.y - cH;
    const midY = startY + (endY - startY) / 2;

    const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    edgeGroup.setAttribute('class', 'tree-edge-group');
    edgeGroup.style.cursor = 'pointer';
    
    edgeGroup.onpointerdown = (e) => {
        e.stopPropagation();
        if (!isTreePanning) selectTreeNodeFromCanvas(childNode.id);
    };

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#666666');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('class', 'tree-visible-edge');
    
    const hitBoxPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitBoxPath.setAttribute('d', `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`);
    hitBoxPath.setAttribute('fill', 'none');
    hitBoxPath.setAttribute('stroke', 'transparent');
    hitBoxPath.setAttribute('stroke-width', '20');

    const arrowId = `tree-arrow-${childNode.id}`;
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', arrowId);
    marker.setAttribute('markerWidth', '10'); marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9'); marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    arrowPath.setAttribute('fill', '#666666');
    marker.appendChild(arrowPath);
    document.getElementById('tree-gradient-defs').appendChild(marker);
    path.setAttribute('marker-end', `url(#${arrowId})`);
    
    edgeGroup.appendChild(path);
    edgeGroup.appendChild(hitBoxPath);

    let bgRect = null;

    if(childNode.edgeLabel && childNode.edgeLabel.trim() !== "") {
        const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        let lx = startX + (endX - startX)*0.2;
        let ly = midY;
        
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', lx); textEl.setAttribute('y', ly);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'central');
        textEl.setAttribute('font-size', '16px');
        textEl.setAttribute('font-weight', 'bold');
        textEl.setAttribute('fill', '#000091');
        textEl.textContent = childNode.edgeLabel;
        
        bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const bgW = childNode.edgeLabel.length * 10 + 14; 
        bgRect.setAttribute('class', 'tree-label-bg');
        bgRect.setAttribute('x', lx - bgW/2);
        bgRect.setAttribute('y', ly - 12);
        bgRect.setAttribute('width', bgW);
        bgRect.setAttribute('height', '24');
        bgRect.setAttribute('fill', '#FFFFFF');
        bgRect.setAttribute('rx', '4'); 
        
        labelG.appendChild(bgRect);
        labelG.appendChild(textEl);
        edgeGroup.appendChild(labelG);
    }

    edgeGroup.onmouseenter = () => {
        path.setAttribute('stroke', '#000091');
        path.setAttribute('stroke-width', '5');
        if (bgRect) bgRect.setAttribute('stroke', '#000091');
    };
    edgeGroup.onmouseleave = () => {
        path.setAttribute('stroke', '#666666');
        path.setAttribute('stroke-width', '3');
        if (bgRect) bgRect.removeAttribute('stroke');
    };

    parentGrp.appendChild(edgeGroup);
}

function drawTreeShape(group, node, isSelected) {
    const size = Number(node.size) || 200;
    const w = size;
    const fillValue = node.color === '#FFFFFF' ? '#FFFFFF' : `url(#tree-grad-${node.color})`;
    const strokeColor = isSelected ? '#000091' : '#1E1E1E';
    const strokeWidth = isSelected ? '5' : '1.5';

    if (node.shape === 'diamond') {
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const half = w/2;
        polygon.setAttribute('points', `0,-${half} ${half},0 0,${half} -${half},0`);
        polygon.setAttribute('fill', fillValue);
        polygon.setAttribute('stroke', strokeColor);
        polygon.setAttribute('stroke-width', strokeWidth);
        group.appendChild(polygon);
    } 
    else if (node.shape === 'circle') {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', w/2);
        circle.setAttribute('fill', fillValue);
        circle.setAttribute('stroke', strokeColor);
        circle.setAttribute('stroke-width', strokeWidth);
        group.appendChild(circle);
    }
    else { 
        const h = w / 1.5;
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', -w/2); rect.setAttribute('y', -h/2);
        rect.setAttribute('width', w); rect.setAttribute('height', h);
        rect.setAttribute('rx', '8');
        rect.setAttribute('fill', fillValue);
        rect.setAttribute('stroke', strokeColor);
        rect.setAttribute('stroke-width', strokeWidth);
        group.appendChild(rect);
    }
}

function drawTreeNodeContent(group, node) {
    const size = Number(node.size) || 200;
    const hasIcon = node.iconBase64 && node.iconBase64 !== "";
    const fSize = Number(node.fontSize) || 24;
    const lineHeight = fSize * 1.25;

    if (hasIcon) {
        const iconSize = size * 0.30;
        const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        img.setAttribute('x', -iconSize / 2);
        let imgY = (node.shape === 'rect') ? -(size/1.5)/2 + 15 : -(size)/2 + size*0.15;
        img.setAttribute('y', imgY);
        img.setAttribute('width', iconSize);
        img.setAttribute('height', iconSize);
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', node.iconBase64);
        img.setAttribute('style', `filter: ${node.textColor === '#FFFFFF' ? 'invert(1) brightness(2)' : (node.textColor === '#000091' ? 'invert(0)' : 'none')}; pointer-events: none;`);
        group.appendChild(img);
    }

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('fill', node.textColor);
    textEl.setAttribute('font-family', node.fontFamily || "'Marianne', system-ui, sans-serif"); 
    textEl.setAttribute('font-size', fSize + 'px');
    textEl.setAttribute('style', 'pointer-events: none;');
    if (node.isBold) textEl.setAttribute('font-weight', 'bold');
    if (node.isItalic) textEl.setAttribute('font-style', 'italic');

    const textContent = node.text || "";
    const lines = textContent.split('\n');

    let startY = 0;
    if (hasIcon) {
        const iconBaseY = (node.shape === 'rect') ? -(size/1.5)/2 + 15 + (size*0.30) : -(size)/2 + size*0.15 + (size*0.30);
        startY = iconBaseY + (fSize * 0.8) + (lineHeight / 2);
    } else {
        startY = -((lines.length - 1) * lineHeight) / 2;
    }

    lines.forEach((lineText, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', 0); 
        tspan.setAttribute('y', startY + (index * lineHeight));
        tspan.setAttribute('dominant-baseline', 'central');
        tspan.textContent = lineText; 
        textEl.appendChild(tspan);
    });
    group.appendChild(textEl);
}

function renderTreeRecursive(node, nodesGroup, connectorsGroup) {
    if (node.children) {
        node.children.forEach(child => {
            drawTreeEdge(connectorsGroup, node, child);
            renderTreeRecursive(child, nodesGroup, connectorsGroup);
        });
    }

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'tree-node-group');
    g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
    
    g.onpointerdown = (e) => {
        e.stopPropagation();
        if (!isTreePanning) selectTreeNodeFromCanvas(node.id);
    };

    const isSelected = (node.id === document.getElementById('tree-node-select').value);
    drawTreeShape(g, node, isSelected);
    drawTreeNodeContent(g, node);

    nodesGroup.appendChild(g);
}

function renderTreeSVG() {
    const connectorsGroup = document.getElementById('tree-connectors');
    const nodesGroup = document.getElementById('tree-nodes');
    connectorsGroup.innerHTML = ''; nodesGroup.innerHTML = '';
    document.querySelectorAll('marker[id^="tree-arrow-"]').forEach(m => m.remove());

    calculateTreeLayout(treeData);
    positionTree(treeData, 0, 0);

    renderTreeRecursive(treeData, nodesGroup, connectorsGroup);
}

function getCleanTreeSVGSource() {
    const selectEl = document.getElementById('tree-node-select');
    const currentSelection = selectEl.value;
    selectEl.value = "none_for_export"; 
    renderTreeSVG();
    
    const svg = document.getElementById('tree-canvas');
    
    const bounds = getTreeBounds(treeData);
    const padding = 60;
    const w = (bounds.maxX - bounds.minX) + padding * 2;
    const h = (bounds.maxY - bounds.minY) + padding * 2;
    const x = bounds.minX - padding;
    const y = bounds.minY - padding;
    
    const oldViewBox = svg.getAttribute('viewBox');
    svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    
    let source = new XMLSerializer().serializeToString(svg);
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    svg.setAttribute('viewBox', oldViewBox);
    selectEl.value = currentSelection;
    renderTreeSVG();
    return { source, w, h };
}

// --- MISE À JOUR DYNAMIQUE (THÈME GLOBAL PLUME) ---

async function refreshAllTrees() {
    const treeContainers = document.querySelectorAll('.plume-tree-container[data-tree-config]');
    if (treeContainers.length === 0) return;

    for (const container of treeContainers) {
        try {
            const rawConfig = container.getAttribute('data-tree-config');
            const payload = JSON.parse(decodeURIComponent(rawConfig));
            
            // 1. Création d'un environnement fantôme sécurisé (car la modale est fermée)
            const hiddenDiv = document.createElement('div');
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.left = '-9999px';
            hiddenDiv.style.width = '1000px';
            
            hiddenDiv.innerHTML = `
                <svg id="tree-canvas" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
                    <defs id="tree-gradient-defs"></defs>
                    <g id="tree-connectors"></g>
                    <g id="tree-nodes"></g>
                </svg>
            `;
            document.body.appendChild(hiddenDiv);

            // Mock du selecteur (pour tromper intelligemment la fonction renderTreeSVG)
            const mockSelect = document.createElement('input');
            mockSelect.id = 'tree-node-select';
            mockSelect.value = 'none';
            document.body.appendChild(mockSelect);

            // 2. Initialisation et Rendu
            initTreeGradients();
            treeData = payload.treeData; // On charge les données sauvegardées
            renderTreeSVG();

            // 3. Capture et Cadrage
            const svg = document.getElementById('tree-canvas');
            const bounds = getTreeBounds(treeData);
            const padding = 60;
            const w = (bounds.maxX - bounds.minX) + padding * 2;
            const h = (bounds.maxY - bounds.minY) + padding * 2;
            const x = bounds.minX - padding;
            const y = bounds.minY - padding;
            
            svg.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
            svg.setAttribute('width', w);
            svg.setAttribute('height', h);
            
            let source = new XMLSerializer().serializeToString(svg);
            if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            // 4. Conversion et injection asynchrone
            const exportScale = 2; 
            const img = new Image();
            
            await new Promise((resolve) => {
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    canvas.width = w * exportScale; 
                    canvas.height = h * exportScale; 
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const imgElement = container.querySelector('img');
                    if (imgElement) {
                        imgElement.src = canvas.toDataURL('image/png'); // Mise à jour de l'image
                    }
                    resolve();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(source)));
            });

            // 5. Nettoyage
            hiddenDiv.remove();
            mockSelect.remove();

        } catch (e) {
            console.error("Impossible de rafraîchir l'arbre décisionnel", e);
        }
    }
}

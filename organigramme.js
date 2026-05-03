/**
 * MODULE ORGANIGRAMMES CIRCULAIRES - PLUME
 * Interface de création et d'intégration d'organigrammes vectoriels.
 */

const PALETTE_GRADIENTS = {
    sequentialDescending: "linear-gradient(to right, #e3e3fd, #000091)",
    sequentialAscending: "linear-gradient(to right, #000091, #e3e3fd)",
    divergentDescending: "linear-gradient(to right, #298641, #EFB900, #E91719)",
    divergentAscending: "linear-gradient(to right, #E91719, #EFB900, #298641)",
    categorical: "linear-gradient(to right, #5C68E5, #82B5F2, #29598F, #31A7AE, #81EEF5, #B478F1, #CFB1F5, #CECECE)",
    bleuFranceDescending: "linear-gradient(to right, #f5f5fe, #000091)",
    bleuFranceAscending: "linear-gradient(to right, #000091, #f5f5fe)",
    rougeMarianneDescending: "linear-gradient(to right, #fef4f4, #e1000f)",
    rougeMarianneAscending: "linear-gradient(to right, #e1000f, #fef4f4)",
    grisDescending: "linear-gradient(to right, #f6f6f6, #7b7b7b)",
    grisAscending: "linear-gradient(to right, #7b7b7b, #f6f6f6)",
    infoDescending: "linear-gradient(to right, #f4f6ff, #0078f3)",
    infoAscending: "linear-gradient(to right, #0078f3, #f4f6ff)",
    succesDescending: "linear-gradient(to right, #dffee6, #1f8d49)",
    succesAscending: "linear-gradient(to right, #1f8d49, #dffee6)",
    avertissementDescending: "linear-gradient(to right, #fff4f3, #d64d00)",
    avertissementAscending: "linear-gradient(to right, #d64d00, #fff4f3)",
    erreurDescending: "linear-gradient(to right, #fff4f4, #f60700)",
    erreurAscending: "linear-gradient(to right, #f60700, #fff4f4)",
    tilleulVerveineDescending: "linear-gradient(to right, #fef7da, #B7A73F)",
    tilleulVerveineAscending: "linear-gradient(to right, #B7A73F, #fef7da)",
    bourgeonDescending: "linear-gradient(to right, #e6feda, #68A532)",
    bourgeonAscending: "linear-gradient(to right, #68A532, #e6feda)",
    emeraudeDescending: "linear-gradient(to right, #e3fdeb, #00A95F)",
    emeraudeAscending: "linear-gradient(to right, #00A95F, #e3fdeb)",
    mentheDescending: "linear-gradient(to right, #dffdf7, #009081)",
    mentheAscending: "linear-gradient(to right, #009081, #dffdf7)",
    archipelDescending: "linear-gradient(to right, #e5fbfd, #009099)",
    archipelAscending: "linear-gradient(to right, #009099, #e5fbfd)",
    ecumeDescending: "linear-gradient(to right, #f4f6fe, #465F9D)",
    ecumeAscending: "linear-gradient(to right, #465F9D, #f4f6fe)",
    cumulusDescending: "linear-gradient(to right, #f3f6fe, #417DC4)",
    cumulusAscending: "linear-gradient(to right, #417DC4, #f3f6fe)",
    glycineDescending: "linear-gradient(to right, #fef3fd, #A558A0)",
    glycineAscending: "linear-gradient(to right, #A558A0, #fef3fd)",
    macaronDescending: "linear-gradient(to right, #fef4f2, #E18B76)",
    macaronAscending: "linear-gradient(to right, #E18B76, #fef4f2)",
    tuileDescending: "linear-gradient(to right, #fef4f3, #CE614A)",
    tuileAscending: "linear-gradient(to right, #CE614A, #fef4f3)",
    terreBattueDescending: "linear-gradient(to right, #fef4f2, #E4794A)",
    terreBattueAscending: "linear-gradient(to right, #E4794A, #fef4f2)",
    tournesolDescending: "linear-gradient(to right, #fef6e3, #C8AA39)",
    tournesolAscending: "linear-gradient(to right, #C8AA39, #fef6e3)",
    moutardeDescending: "linear-gradient(to right, #fef5e8, #C3992A)",
    moutardeAscending: "linear-gradient(to right, #C3992A, #fef5e8)",
    cafeCremeDescending: "linear-gradient(to right, #fbf6ed, #D1B781)",
    cafeCremeAscending: "linear-gradient(to right, #D1B781, #fbf6ed)",
    caramelDescending: "linear-gradient(to right, #fbf5f2, #C08C65)",
    caramelAscending: "linear-gradient(to right, #C08C65, #fbf5f2)",
    operaDescending: "linear-gradient(to right, #fbf5f2, #BD987A)",
    operaAscending: "linear-gradient(to right, #BD987A, #fbf5f2)",
    grisGaletDescending: "linear-gradient(to right, #f9f6f2, #AEA397)",
    grisGaletAscending: "linear-gradient(to right, #AEA397, #f9f6f2)"
};

// --- MOTEUR DE L'ORGANIGRAMME ---
let diagramData = null;
let customImageRegistry = {};
let historyPast = [];
let historyFuture = [];

// Variables globales de Drag & Drop
let isDraggingNode = false;
let dragItemId = null;
let dragGhost = null;
let hoverItemId = null;
let dragOriginX = 0;
let dragOriginY = 0;

// Variables globales de Pan & Zoom
let vbX = 0, vbY = 0, vbWidth = 1600, vbHeight = 1200;
let isPanningView = false, startPanClientX = 0, startPanClientY = 0, startVbX = 0, startVbY = 0;

const defaultTypography = { 
    fontFamily: "'Marianne', system-ui, sans-serif", 
    fontSize: 26, 
    isBold: false, 
    isItalic: false, 
    isStrike: false 
};

// Fonctions de vue (Caméra)
function applyViewBox() { 
    const canvas = document.getElementById('org-canvas');
    if(canvas) canvas.setAttribute('viewBox', `${vbX} ${vbY} ${vbWidth} ${vbHeight}`); 
}

function resetZoom() { 
    const { maxExtent } = calculateMaxExtent(); 
    const p = 80; 
    vbWidth = (maxExtent * 2) + (p * 2); 
    vbHeight = vbWidth; 
    vbX = -maxExtent - p; 
    vbY = vbX; 
    applyViewBox(); 
}

function zoomIn() { 
    const f = 0.8; 
    vbX -= (vbWidth * f - vbWidth) / 2; vbY -= (vbHeight * f - vbHeight) / 2; 
    vbWidth *= f; vbHeight *= f; 
    applyViewBox(); 
}

function zoomOut() { 
    const f = 1.2; 
    vbX -= (vbWidth * f - vbWidth) / 2; vbY -= (vbHeight * f - vbHeight) / 2; 
    vbWidth *= f; vbHeight *= f; 
    applyViewBox(); 
}

function initOrgChartData(existingConfig = null) {
    if (existingConfig) {
        diagramData = existingConfig.diagramData;
        customImageRegistry = existingConfig.customImageRegistry || {};
    } else {
        diagramData = {
            direction: 'clockwise',
            center: { text: "BLOC\nCENTRAL", color: "#000091", shape: "rect", size: 300, manualSize: true, textColor: "#FFFFFF", ...defaultTypography, isBold: true, fontSize: 36, icon: null },
            bubbles: [
                { text: "Niveau 1", color: "cumulusAscending", shape: "circle", size: 280, manualSize: false, textColor: "#000000", icon: null, children: [], ...defaultTypography },
                { text: "Niveau 1", color: "emeraudeAscending", shape: "circle", size: 280, manualSize: false, textColor: "#000000", icon: null, children: [], ...defaultTypography }
            ]
        };
        customImageRegistry = {};
    }
    historyPast = [];
    historyFuture = [];
}

// Fonction principale pour ouvrir la modale
function insertOrgChart() {
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    // Correction de l'UI pour respecter le DSFR (suppression des conflits flex/margin)
    overlay.innerHTML = `
        <style>
            .org-sidebar { width: 380px; background: #fff; border-right: 1px solid var(--grey-900); padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; overflow-x: hidden; flex-shrink: 0; }
            .org-workspace { flex-grow: 1; position: relative; overflow: hidden; background-color: #f6f6f6; background-image: radial-gradient(#d0d0d0 1px, transparent 1px); background-size: 24px 24px; touch-action: none;}
            .org-control-group { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; width: 100%; box-sizing: border-box; }
            .org-row-group { display: flex; gap: 0.5rem; align-items: flex-end; width: 100%; }
            .org-control-group .fr-input, .org-control-group .fr-select { width: 100%; margin: 0; box-sizing: border-box; }
            
            .org-sidebar details { background: var(--theme-bg); border: 1px solid var(--grey-900); border-radius: 4px; margin-bottom: 0.5rem; }
            .org-sidebar summary { font-weight: 700; font-size: 0.95rem; padding: 0.75rem; cursor: pointer; color: var(--theme-sun); list-style: none; display: flex; justify-content: space-between; align-items: center; }
            .org-sidebar summary::-webkit-details-marker { display: none; }
            .org-sidebar summary::after { content: '▼'; font-size: 0.75em; transition: transform 0.3s ease; }
            .org-sidebar details[open] summary::after { transform: rotate(-180deg); }
            .org-sidebar details[open] summary { border-bottom: 1px solid var(--grey-900); }
            .org-details-content { padding: 1rem; display: flex; flex-direction: column; }
            
            .org-zoom-controls { position: absolute; bottom: 20px; right: 20px; display: flex; gap: 8px; z-index: 100; background: white; padding: 8px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        </style>

        <div class="chart-modal" style="width: 1400px; max-width: 95vw; height: 85vh; display: flex; overflow: hidden;">
            
            <!-- BARRE LATÉRALE DE CONTRÔLES -->
            <div class="org-sidebar">
                <h3 style="margin:0 0 1rem 0; color:var(--theme-sun); font-size:1.1rem;">
                    <span class="fr-icon-mind-map"></span> Studio Organigramme
                </h3>

                <div class="org-control-group">
                    <label class="fr-label">Élément sélectionné :</label>
                    <select id="org-node-select" class="fr-select"></select>
                </div>

                <details open>
                    <summary>Texte & Typographie</summary>
                    <div class="org-details-content">
                        <div class="org-control-group">
                            <textarea id="org-node-text" class="fr-input" rows="3" placeholder="Texte de la bulle..."></textarea>
                        </div>
                        <div class="org-control-group">
                            <select id="org-node-font-family" class="fr-select" style="margin-bottom: 0.5rem;">
                                <option value="'Marianne', system-ui, sans-serif">Marianne</option>
                                <option value="Arial, sans-serif">Arial</option>
                                <option value="'Times New Roman', serif">Times New Roman</option>
                            </select>
                            
                            <div class="org-row-group">
                                <div style="flex: 1;">
                                    <label class="fr-label" style="font-size: 0.8rem;">Taille</label>
                                    <input type="number" id="org-node-font-size" class="fr-input" value="30" min="8" max="72">
                                </div>
                                <div style="flex: 2;">
                                    <label class="fr-label" style="font-size: 0.8rem;">Couleur texte</label>
                                    <select id="org-node-text-color" class="fr-select">
                                        <option value="#000000">Noir</option>
                                        <option value="#FFFFFF">Blanc</option>
                                        <option value="#000091">Bleu France</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="org-row-group" style="margin-top: 0.5rem;">
                                <button id="org-btn-bold" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex:1; justify-content:center; font-weight:bold;">Gras</button>
                                <button id="org-btn-italic" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex:1; justify-content:center; font-style:italic;">Ital</button>
                                <button id="org-btn-strike" class="fr-btn fr-btn--sm fr-btn--secondary" style="flex:1; justify-content:center; text-decoration:line-through;">Barré</button>
                            </div>
                        </div>
                    </div>
                </details>

                <details>
                    <summary>Forme & Apparence</summary>
                    <div class="org-details-content">
                        <div class="org-control-group">
                            <label class="fr-label">Forme de la bulle :</label>
                            <select id="org-node-shape" class="fr-select">
                                <option value="circle">Cercle classique</option>
                                <option value="rect">Rectangle</option>
                                <option value="rhombus">Losange</option>
                            </select>
                        </div>
                        <div class="org-control-group">
                            <label class="fr-label">Couleur de fond :</label>
                            <select id="org-node-color" class="fr-select"></select>
                        </div>
                        <div class="org-control-group">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <label class="fr-label" style="margin: 0;">Taille bulle : <span id="org-size-val">250</span>px</label>
                                <button class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline" id="org-btn-autofit" style="padding: 0 0.5rem;">Ajuster auto</button>
                            </div>
                            <input type="range" id="org-node-size" min="120" max="800" value="250" style="width: 100%; cursor: pointer;">
                        </div>
                    </div>
                </details>

                <div class="org-control-group" style="margin-top: 1rem;">
                    <button id="org-btn-add-main" class="fr-btn fr-btn--sm" style="width: 100%; justify-content: center;"><span class="fr-icon-add-line fr-mr-1w"></span> Bulle principale</button>
                    <button id="org-btn-add-sub" class="fr-btn fr-btn--sm fr-btn--secondary" style="width: 100%; justify-content: center; margin-top: 0.5rem;"><span class="fr-icon-add-circle-line fr-mr-1w"></span> Sous-bulle</button>
                    <button id="org-btn-delete" class="fr-btn fr-btn--sm" style="margin-top: 0.5rem; background-color: #ffe8e5; color: #e1000f; width: 100%; justify-content: center;"><span class="fr-icon-delete-bin-line fr-mr-1w"></span> Supprimer sélection</button>
                </div>

                <!-- BOUTONS D'ACTION PLUME -->
                <div style="margin-top:auto; padding-top: 1rem; border-top: 1px solid var(--grey-900); display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-org-cancel" style="flex:1; justify-content: center;">Annuler</button>
                    <button class="fr-btn" id="btn-org-insert" style="flex:1; justify-content: center;">Insérer</button>
                </div>
            </div>

            <!-- ZONE DE PRÉVISUALISATION -->
            <div class="org-workspace" id="org-preview-container">
                <svg id="org-canvas" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; touch-action: none; cursor: grab;">
                    <defs id="org-gradient-defs"></defs>
                    <g id="org-connectors"></g>
                    <g id="org-nodes"></g>
                </svg>
                
                <div class="org-zoom-controls">
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="org-btn-zoom-out" title="Dézoomer">-</button>
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="org-btn-zoom-reset" title="Recadrer la vue">Centrer</button>
                    <button class="fr-btn fr-btn--secondary fr-btn--sm" id="org-btn-zoom-in" title="Zoomer">+</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // --- INITIALISATION DE L'ÉTAT ET DU RENDU ---
    initOrgChartData(); 
    initOrgGradientsAndSelect(); 
    updateOrgSelectMenu(); 
    loadOrgNodeData();     
    renderSVG();
    resetZoom();           
    
    // --- ÉVÉNEMENTS DE CAMÉRA (PAN & ZOOM) ---
    document.getElementById('org-btn-zoom-in').onclick = zoomIn;
    document.getElementById('org-btn-zoom-out').onclick = zoomOut;
    document.getElementById('org-btn-zoom-reset').onclick = resetZoom;

    document.getElementById('org-canvas').addEventListener('pointerdown', e => {
        if (e.target.tagName === 'svg' || e.target.id === 'org-canvas') {
            isPanningView = true;
            startPanClientX = e.clientX;
            startPanClientY = e.clientY;
            startVbX = vbX;
            startVbY = vbY;
            document.getElementById('org-canvas').style.cursor = 'grabbing';
        }
    });

    document.getElementById('org-preview-container').addEventListener('wheel', e => {
        e.preventDefault();
        const f = e.deltaY > 0 ? 1.08 : 0.92;
        const s = document.getElementById('org-canvas');
        const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const ctm = s.getScreenCTM();
        if(!ctm) return;
        const svgP = pt.matrixTransform(ctm.inverse());
        
        vbX -= (vbWidth * f - vbWidth) * ((svgP.x - vbX) / vbWidth);
        vbY -= (vbHeight * f - vbHeight) * ((svgP.y - vbY) / vbHeight);
        vbWidth *= f; vbHeight *= f;
        applyViewBox();
    }, {passive: false});

    // --- Événements globaux D&D gérés au niveau de la modale ---
    const pointerMoveHandler = e => {
        const s = document.getElementById('org-canvas');
        if(!s) return;
        
        if (isPanningView) {
            const r = s.getBoundingClientRect();
            vbX = startVbX - (e.clientX - startPanClientX) * (vbWidth / r.width);
            vbY = startVbY - (e.clientY - startPanClientY) * (vbHeight / r.height);
            applyViewBox();
            return; 
        }

        const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
        const ctm = s.getScreenCTM(); if(!ctm) return;
        const svgP = pt.matrixTransform(ctm.inverse());

        if (isDraggingNode && dragGhost) {
            dragGhost.setAttribute('transform',`translate(${svgP.x-dragOriginX}, ${svgP.y-dragOriginY})`);
        } 
    };

    const pointerUpHandler = () => {
        if (isPanningView) {
            isPanningView = false;
            const canvas = document.getElementById('org-canvas');
            if(canvas) canvas.style.cursor = 'grab';
        }
        
        if (isDraggingNode) {
            isDraggingNode = false; 
            if (dragGhost) { 
                if (hoverItemId !== null && dragItemId !== null && hoverItemId !== dragItemId && !hoverItemId.startsWith(dragItemId + '-')) { 
                    saveOrgState();
                    let draggedNode;
                    const dragPath = dragItemId.split('-');
                    
                    let targetArray;
                    if (hoverItemId === 'center') {
                        targetArray = diagramData.bubbles;
                    } else {
                        const hoverNode = getOrgNodeById(hoverItemId);
                        if (!hoverNode.children) hoverNode.children = [];
                        targetArray = hoverNode.children;
                    }
                    
                    if (dragPath.length === 1) {
                        draggedNode = diagramData.bubbles.splice(parseInt(dragPath[0]), 1)[0];
                    } else {
                        const dragIdx = dragPath.pop();
                        const dragParent = getOrgNodeById(dragPath.join('-'));
                        draggedNode = dragParent.children.splice(parseInt(dragIdx), 1)[0];
                    }
                    targetArray.push(draggedNode);
                    updateOrgSelectMenu(); 
                }
                dragGhost.remove(); 
                dragGhost = null; 
            }
            dragItemId = null; 
            hoverItemId = null;
            renderSVG();
        } 
    };

    window.addEventListener('pointermove', pointerMoveHandler);
    window.addEventListener('pointerup', pointerUpHandler);
    
    // --- CÂBLAGE DE L'INTERFACE EN TEMPS RÉEL ---
    document.getElementById('org-node-select').onchange = () => {
        loadOrgNodeData();
        renderSVG();
    };

    // Textes mis à jour en temps réel (événement 'input')
    const textInputs = ['org-node-text', 'org-node-font-size'];
    textInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => updateOrgNode(false)); // Temps réel
            el.addEventListener('change', () => saveOrgState()); // Sauvegarde historique
        }
    });

    // Menus déroulants (événement 'change')
    const selectInputs = ['org-node-color', 'org-node-text-color', 'org-node-shape', 'org-node-font-family'];
    selectInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', () => {
            saveOrgState();
            updateOrgNode(false);
        });
    });

    document.getElementById('org-node-size').addEventListener('input', () => updateOrgNode(true));
    document.getElementById('org-node-size').addEventListener('change', saveOrgState);

    document.getElementById('org-btn-bold').onclick = () => { saveOrgState(); toggleOrgTextStyle('bold'); };
    document.getElementById('org-btn-italic').onclick = () => { saveOrgState(); toggleOrgTextStyle('italic'); };
    document.getElementById('org-btn-strike').onclick = () => { saveOrgState(); toggleOrgTextStyle('strike'); };

    document.getElementById('org-btn-add-main').onclick = () => { saveOrgState(); addOrgMainBubble(); };
    document.getElementById('org-btn-add-sub').onclick = () => { saveOrgState(); addOrgSubBubble(); };
    document.getElementById('org-btn-delete').onclick = () => { saveOrgState(); removeOrgSelectedNode(); };
    document.getElementById('org-btn-autofit').onclick = () => { saveOrgState(); autoFitOrgCurrentNode(); };
    
    document.getElementById('btn-org-cancel').onclick = () => {
        window.removeEventListener('pointermove', pointerMoveHandler);
        window.removeEventListener('pointerup', pointerUpHandler);
        overlay.remove();
    };

    document.getElementById('btn-org-insert').onclick = () => {
        const svg = document.getElementById('org-canvas');
        
        const extent = calculateMaxExtent(); 
        const padding = 60;
        const exportSize = (extent.maxExtent * 2) + (padding * 2);

        const originalViewBox = svg.getAttribute('viewBox');
        svg.setAttribute('viewBox', `${-extent.maxExtent - padding} ${-extent.maxExtent - padding} ${exportSize} ${exportSize}`);

        let svgSource = new XMLSerializer().serializeToString(svg);
        if (!svgSource.match(/xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
            svgSource = svgSource.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        
        svg.setAttribute('viewBox', originalViewBox);

        const scale = 2;
        const canvas = document.createElement('canvas');
        canvas.width = exportSize * scale;
        canvas.height = exportSize * scale;
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = canvas.toDataURL('image/png');

            const payload = { 
                version: 2, 
                diagramData: diagramData, 
                customImageRegistry: customImageRegistry 
            };
            const safeConfig = encodeURIComponent(JSON.stringify(payload));

            const finalHTML = `
                <div class="plume-orgchart-container" data-orgchart-config="${safeConfig}" style="margin: 2.5rem 0; text-align: center;" contenteditable="false">
                    <img src="${imgData}" alt="Organigramme" style="max-width: 100%; height: auto; border: 1px solid var(--grey-900); border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
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
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgSource)));
    };
}

function renderSVG() {
    const cG = document.getElementById('org-connectors'), nG = document.getElementById('org-nodes');
    cG.innerHTML = ''; nG.innerHTML = '';
    
    const dir = diagramData.direction === 'clockwise' ? 1 : -1;
    
    let layoutNodes = [];
    let connections = [];

    layoutNodes.push({
        id: 'center', data: diagramData.center,
        x: 0, y: 0, 
        r: (Number(diagramData.center.size) || 300) / 2, 
        level: 0
    });

    function computeBranch(node, idPath, cx, cy, startAngle, angleSpread, level, parentId) {
        const bSize = Number(node.size) || 250;
        
        layoutNodes.push({
            id: idPath, data: node,
            x: cx, y: cy, 
            r: (bSize / 2),
            level: level, parentId: parentId
        });

        connections.push({ source: parentId, target: idPath, color: node.color });

        if (node.children && node.children.length > 0) {
            const count = node.children.length;
            const nextRadius = (bSize / 2) + 150 + (level * 30); 
            const nextSpread = angleSpread * 0.7; 
            
            let sAngle = startAngle - (dir * nextSpread / 2);
            let step = count > 1 ? (dir * nextSpread) / (count - 1) : 0;
            if (count === 1) sAngle = startAngle;

            node.children.forEach((sub, j) => {
                let a = sAngle + (j * step);
                let subX = cx + nextRadius * Math.cos(a);
                let subY = cy + nextRadius * Math.sin(a);
                computeBranch(sub, `${idPath}-${j}`, subX, subY, a, nextSpread, level + 1, idPath);
            });
        }
    }

    if (diagramData.bubbles.length > 0) {
        const count = diagramData.bubbles.length;
        const { orbitRadius } = calculateMaxExtent();
        const mStep = dir * (2 * Math.PI) / count;
        const start = -Math.PI / 2; 
        
        diagramData.bubbles.forEach((b, i) => {
            const a = start + i * mStep;
            const bx = orbitRadius * Math.cos(a);
            const by = orbitRadius * Math.sin(a);
            computeBranch(b, i.toString(), bx, by, a, Math.PI * 0.5, 1, 'center'); 
        });
    }

    const ITERATIONS = 50;  
    const PADDING = 40;     

    for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < layoutNodes.length; i++) {
            for (let j = i + 1; j < layoutNodes.length; j++) {
                let n1 = layoutNodes[i];
                let n2 = layoutNodes[j];
                
                let dx = n2.x - n1.x;
                let dy = n2.y - n1.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                let minDist = n1.r + n2.r + PADDING;

                if (dist < minDist) {
                    if (dist === 0) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; dist = Math.sqrt(dx*dx + dy*dy); }
                    
                    let overlap = minDist - dist;
                    let pushX = (dx / dist) * overlap * 0.5;
                    let pushY = (dy / dist) * overlap * 0.5;

                    if (n1.id === 'center') {
                        n2.x += pushX * 2; n2.y += pushY * 2;
                    } else if (n2.id === 'center') {
                        n1.x -= pushX * 2; n1.y -= pushY * 2;
                    } else {
                        n1.x -= pushX; n1.y -= pushY;
                        n2.x += pushX; n2.y += pushY;
                    }
                }
            }
        }
    }

    connections.forEach(conn => {
        const sourceNode = layoutNodes.find(n => n.id === conn.source);
        const targetNode = layoutNodes.find(n => n.id === conn.target);
        if (sourceNode && targetNode) {
            drawCurve(cG, sourceNode.x, sourceNode.y, targetNode.x, targetNode.y, conn.color);
        }
    });

    layoutNodes.forEach(n => {
        const isSelected = (n.id === document.getElementById('org-node-select').value);
        const g = drawNode(nG, n.data, n.x, n.y, n.id);
        g.setAttribute('class', 'node-group draggable');
        
        g.onpointerdown = e => { 
            if(e.target.classList.contains('resize-handle')) return; 
            e.stopPropagation(); if(e.button!==0)return; 
            isDraggingNode=true; dragItemId=n.id; dragOriginX=n.x; dragOriginY=n.y; hoverItemId=null; 
            g.style.opacity='0.4'; dragGhost=g.cloneNode(true); dragGhost.style.opacity='0.7'; dragGhost.style.pointerEvents='none'; 
            document.getElementById('org-canvas').appendChild(dragGhost); orgSelectNodeFromCanvas(n.id); 
        };
        g.onpointerenter = () => { 
            if(isDraggingNode && dragItemId && dragItemId !== n.id && !n.id.startsWith(dragItemId)){ 
                hoverItemId = n.id; 
                const s = g.querySelector('.node-shape'); 
                if(s) { s.setAttribute('stroke', '#00A95F'); s.setAttribute('stroke-width', '6'); g.style.transform = 'scale(1.05)'; } 
            } 
        };
        g.onpointerleave = () => { 
            if(isDraggingNode && dragItemId && dragItemId !== n.id){ 
                if(hoverItemId === n.id) hoverItemId = null; 
                const s = g.querySelector('.node-shape'); 
                if(s) { s.setAttribute('stroke', isSelected ? '#000091' : 'rgba(0,0,0,0.1)'); s.setAttribute('stroke-width', isSelected ? '4' : '1'); g.style.transform = ''; } 
            } 
        };
    });
}

function drawCurve(parent, x1, y1, x2, y2, strokeColor) {
    if (Math.abs(x1 - x2) < 0.1) x2 += 0.1;
    if (Math.abs(y1 - y2) < 0.1) y2 += 0.1;

    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const c1x=x1+(x2-x1)*0.4, c1y=y1+(y2-y1)*0.1, c2x=x2-(x2-x1)*0.1, c2y=y2-(y2-y1)*0.4;
    p.setAttribute('d', `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`);
    
    let finalColor = '#A0A0A0';
    if (strokeColor) {
        if (strokeColor === '#FFFFFF') finalColor = '#A0A0A0'; 
        else if (strokeColor.startsWith('#')) finalColor = strokeColor;
        else finalColor = `url(#grad-${strokeColor})`;
    }

    p.setAttribute('stroke', finalColor); 
    p.setAttribute('stroke-width', '4'); 
    p.setAttribute('fill', 'none'); 
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('opacity', '0.7'); 
    parent.appendChild(p);
}

function drawNode(parent, nodeData, x, y, nodeId) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'node-group');
    group.onclick = function(e) { if(!isDraggingNode && !e.target.classList.contains('resize-handle')) orgSelectNodeFromCanvas(nodeId); };
    
    const cx = Number(x) || 0, cy = Number(y) || 0, bSize = Number(nodeData.size) || 200, bRadius = bSize / 2;
    const fSize = Number(nodeData.fontSize) || 30, lineHeight = fSize * 1.25, shapeType = nodeData.shape || "circle";
    const isSelected = (nodeId === document.getElementById('org-node-select').value);
    
    const lines = (nodeData.text || "").split('\n');
    const padding = 15;

    let contentHeight = (lines.length * lineHeight);

    let shapeEl;
    let shapeTopY, shapeBottomY;
    
    if (shapeType === "rect") {
        let rectHeight = Math.max(bSize * 0.5, contentHeight + padding * 2);
        shapeTopY = cy - rectHeight / 2; 
        shapeBottomY = cy + rectHeight / 2;
        
        shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        shapeEl.setAttribute('x', cx - bSize / 2); shapeEl.setAttribute('y', shapeTopY);
        shapeEl.setAttribute('width', bSize); shapeEl.setAttribute('height', rectHeight); 
        shapeEl.setAttribute('rx', '12');
    } else if (shapeType === "rhombus") {
        shapeTopY = cy - bRadius; shapeBottomY = cy + bRadius;
        shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        shapeEl.setAttribute('points', `${cx},${shapeTopY} ${cx + bRadius},${cy} ${cx},${shapeBottomY} ${cx - bRadius},${cy}`);
    } else {
        shapeTopY = cy - bRadius; shapeBottomY = cy + bRadius;
        shapeEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        shapeEl.setAttribute('cx', cx); shapeEl.setAttribute('cy', cy); shapeEl.setAttribute('r', bRadius);
    }
    
    shapeEl.setAttribute('class', 'node-shape'); 
    shapeEl.setAttribute('fill', (nodeData.color && nodeData.color.startsWith('#')) ? nodeData.color : `url(#grad-${nodeData.color})`);
    shapeEl.setAttribute('stroke', isSelected ? '#000091' : 'rgba(0,0,0,0.1)');
    shapeEl.setAttribute('stroke-width', isSelected ? '4' : '1');
    shapeEl.setAttribute('filter', 'url(#shadow)');
    group.appendChild(shapeEl);

    let currentDrawY = cy - (contentHeight / 2);

    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textEl.setAttribute('text-anchor', 'middle'); textEl.setAttribute('fill', nodeData.textColor);
    textEl.setAttribute('font-family', nodeData.fontFamily); textEl.setAttribute('font-size', fSize + 'px');
    if (nodeData.isBold) textEl.setAttribute('font-weight', 'bold');
    if (nodeData.isItalic) textEl.setAttribute('font-style', 'italic');
    if (nodeData.isStrike) textEl.setAttribute('text-decoration', 'line-through');

    lines.forEach((lineText, index) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', cx); 
        tspan.setAttribute('y', currentDrawY + (index * lineHeight) + (lineHeight / 2));
        tspan.setAttribute('dominant-baseline', 'central'); 
        tspan.textContent = lineText; 
        textEl.appendChild(tspan);
    });
    
    group.appendChild(textEl); parent.appendChild(group); return group;
}

function calculateMaxExtent() {
    let totalMainCircumferenceRequired = 0; let maxMainBubbleSize = 0;
    diagramData.bubbles.forEach(b => {
        const bSize = Number(b.size) || 250;
        totalMainCircumferenceRequired += bSize + 50;
        if(bSize > maxMainBubbleSize) maxMainBubbleSize = bSize;
    });
    const centerSize = Number(diagramData.center.size) || 300;
    let minRadiusByCenter = (centerSize / 2) + (maxMainBubbleSize / 2) + 40; 
    let radiusByCircumference = totalMainCircumferenceRequired / (2 * Math.PI);
    const orbitRadius = Math.max(minRadiusByCenter, radiusByCircumference);
    let maxExtent = orbitRadius + (maxMainBubbleSize / 2);
    diagramData.bubbles.forEach(bubble => {
        let bSize = Number(bubble.size) || 250;
        let bubbleExtent = orbitRadius + (bSize / 2);
        if (bubbleExtent > maxExtent) maxExtent = bubbleExtent;
        if (bubble.children.length > 0) {
            let maxSubSize = Math.max(...bubble.children.map(s => Number(s.size) || 160));
            let subOrbit = (bSize / 2) + (maxSubSize / 2) + 80;
            let subExtent = orbitRadius + subOrbit + (maxSubSize / 2);
            if (subExtent > maxExtent) maxExtent = subExtent;
        }
    });
    return { orbitRadius, maxExtent };
}

// --- FONCTIONS UTILITAIRES DE L'INTERFACE ET D'ACTION ---

function orgSelectNodeFromCanvas(id) { 
    document.getElementById('org-node-select').value = id; 
    loadOrgNodeData(); 
    renderSVG(); 
}

function calculateOrgOptimalSize(node) {
    const fSize = node.fontSize || 30; const lines = (node.text || "").split('\n');
    let maxChars = 5, numLines = 0;
    lines.forEach(l => { maxChars = Math.max(maxChars, l.length > 22 ? 22 : l.length); numLines += Math.ceil(l.length / 22) || 1; });
    const W = maxChars * (fSize * 0.55); 
    let H = numLines * (fSize * 1.25);
    let optimalSize = node.shape === 'rect' ? Math.ceil(Math.max(W / 0.75, H / 0.40)) : Math.ceil(Math.sqrt(W * W + H * H) / 0.75);
    return optimalSize < 120 ? 120 : (optimalSize > 800 ? 800 : optimalSize);
}

function autoFitOrgCurrentNode() { 
    const n = getOrgSelectedNode(); 
    n.manualSize = false; 
    n.size = calculateOrgOptimalSize(n); 
    document.getElementById('org-node-size').value = n.size; 
    document.getElementById('org-size-val').textContent = n.size; 
    renderSVG(); 
}

function addOrgMainBubble() { 
    diagramData.bubbles.push({text:"NOUVELLE BULLE", color:"tournesolAscending", textColor:"#000000", shape:"circle", size:250, manualSize:false, icon:null, isCustomImage:false, iconSizeScale:0.35, children:[], ...defaultTypography}); 
    updateOrgSelectMenu(); 
    document.getElementById('org-node-select').value = (diagramData.bubbles.length-1).toString(); 
    const n = diagramData.bubbles[diagramData.bubbles.length-1]; 
    n.size = calculateOrgOptimalSize(n); 
    loadOrgNodeData(); 
    renderSVG(); 
}

function addOrgSubBubble() { 
    const v = document.getElementById('org-node-select').value; 
    if (v === 'center') return; 
    const parentNode = getOrgNodeById(v);
    if (!parentNode.children) parentNode.children = []; 
    parentNode.children.push({text: "Détail", color: "grisGaletAscending", textColor: "#000000", shape: "circle", size: 160, manualSize: false, icon: null, isCustomImage: false, iconSizeScale: 0.35, children: [], ...defaultTypography, fontSize: 20}); 
    updateOrgSelectMenu(); 
    document.getElementById('org-node-select').value = `${v}-${parentNode.children.length - 1}`; 
    const newNode = parentNode.children[parentNode.children.length - 1]; 
    newNode.size = calculateOrgOptimalSize(newNode); 
    loadOrgNodeData(); 
    renderSVG(); 
}

function removeOrgSelectedNode() { 
    const v = document.getElementById('org-node-select').value; 
    if (v === 'center') return; 
    const p = v.split('-'); 
    if (p.length === 1) {
        diagramData.bubbles.splice(parseInt(p[0]), 1); 
    } else {
        const indexToRemove = parseInt(p.pop()); 
        const parentId = p.join('-'); 
        const parentNode = getOrgNodeById(parentId);
        parentNode.children.splice(indexToRemove, 1);
    }
    updateOrgSelectMenu(); 
    loadOrgNodeData(); 
    renderSVG(); 
}

function getOrgSelectedNode() { 
    const v = document.getElementById('org-node-select').value; 
    return getOrgNodeById(v); 
}

function getOrgNodeById(id) {
    if (id === 'center') return diagramData.center;
    const path = id.split('-');
    let current = diagramData.bubbles[parseInt(path[0])];
    for (let i = 1; i < path.length; i++) {
        current = current.children[parseInt(path[i])];
    }
    return current;
}

function saveOrgState() { 
    historyPast.push(JSON.stringify(diagramData)); 
    if(historyPast.length > 30) historyPast.shift(); 
    historyFuture = []; 
}

function updateOrgSelectMenu() { 
    const s = document.getElementById('org-node-select'), c = s.value; 
    s.innerHTML = '<option value="center">Bloc Central</option>'; 
    
    function buildOptions(nodes, parentId, depth) {
        nodes.forEach((b, i) => { 
            const currentId = parentId ? `${parentId}-${i}` : `${i}`;
            const prefix = " ↳ ".repeat(depth);
            const o = document.createElement('option'); 
            o.value = currentId; 
            o.textContent = `${prefix}${depth === 0 ? 'Bulle '+(i+1) : 'Sous-bulle'}: ${b.text.substring(0,15).replace(/\n/g,' ')}`; 
            s.appendChild(o); 
            if (b.children && b.children.length > 0) buildOptions(b.children, currentId, depth + 1);
        });
    }
    buildOptions(diagramData.bubbles, "", 0);
    
    s.value = Array.from(s.options).some(o => o.value === c) ? c : 'center'; 
    document.getElementById('org-btn-add-sub').disabled = (s.value === 'center');
}

function loadOrgNodeData() { 
    const selectValue = document.getElementById('org-node-select').value;
    const isCenter = selectValue === 'center';
    
    document.getElementById('org-btn-add-sub').disabled = isCenter;
    document.getElementById('org-btn-delete').disabled = isCenter;

    const n = getOrgSelectedNode(); 
    if (!n) return;

    document.getElementById('org-node-text').value = n.text || ""; 
    document.getElementById('org-node-color').value = n.color || "#FFFFFF"; 
    document.getElementById('org-node-text-color').value = n.textColor || "#000000"; 
    document.getElementById('org-node-shape').value = n.shape || "circle"; 
    document.getElementById('org-node-font-size').value = n.fontSize || 30; 
    document.getElementById('org-node-font-family').value = n.fontFamily || "'Marianne', system-ui, sans-serif"; 
    
    // Classes DSFR pour indiquer l'état actif/inactif des boutons typo
    document.getElementById('org-btn-bold').className = n.isBold ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary';
    document.getElementById('org-btn-italic').className = n.isItalic ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary';
    document.getElementById('org-btn-strike').className = n.isStrike ? 'fr-btn fr-btn--sm' : 'fr-btn fr-btn--sm fr-btn--secondary';
    
    if (n.size) {
        document.getElementById('org-node-size').value = n.size; 
        document.getElementById('org-size-val').textContent = n.size;
    } 
}

function updateOrgNode(isSlider) { 
    const n = getOrgSelectedNode(); 
    const oldText = n.text;
    
    n.text = document.getElementById('org-node-text').value; 
    n.color = document.getElementById('org-node-color').value; 
    n.textColor = document.getElementById('org-node-text-color').value; 
    n.shape = document.getElementById('org-node-shape').value; 
    n.fontSize = Number(document.getElementById('org-node-font-size').value); 
    n.fontFamily = document.getElementById('org-node-font-family').value; 
    
    if (isSlider) { 
        n.size = Number(document.getElementById('org-node-size').value); 
        n.manualSize = true; 
    } else if (!n.manualSize) {
        // Redimensionnement automatique si le texte change en mode "Ajustement auto"
        n.size = calculateOrgOptimalSize(n);
        document.getElementById('org-node-size').value = n.size;
    }
    
    document.getElementById('org-size-val').textContent = n.size; 
    
    // Actualisation ciblée de la liste déroulante (évite les pertes de focus au clavier)
    if (oldText !== n.text) {
        const select = document.getElementById('org-node-select');
        const selectedOption = select.options[select.selectedIndex];
        const depth = (selectedOption.text.match(/↳/g) || []).length;
        const prefix = " ↳ ".repeat(depth);
        const label = depth === 0 && select.value !== 'center' ? 'Bulle '+(parseInt(select.value)+1) : (select.value === 'center' ? 'Bloc Central' : 'Sous-bulle');
        selectedOption.textContent = `${prefix}${label}: ${n.text.substring(0,15).replace(/\n/g,' ')}`;
    }
    
    renderSVG(); 
}

function toggleOrgTextStyle(t) { 
    const n = getOrgSelectedNode(); 
    if(t === 'bold') n.isBold = !n.isBold; 
    if(t === 'italic') n.isItalic = !n.isItalic; 
    if(t === 'strike') n.isStrike = !n.isStrike; 
    loadOrgNodeData(); 
    renderSVG(); 
}

function initOrgGradientsAndSelect() { 
    const d = document.getElementById('org-gradient-defs');
    const s = document.getElementById('org-node-color'); 
    
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    filter.setAttribute('id', 'shadow'); filter.setAttribute('x', '-20%'); filter.setAttribute('y', '-20%'); filter.setAttribute('width', '140%'); filter.setAttribute('height', '140%');
    filter.innerHTML = '<feDropShadow dx="0" dy="6" stdDeviation="6" flood-opacity="0.1" flood-color="#000000"/>';
    d.appendChild(filter);
    
    s.innerHTML = ''; 

    const optGroupSolid = document.createElement('optgroup');
    optGroupSolid.label = "Couleurs de base";
    const baseColors = {"Blanc": "#ffffff", "Noir": "#161616", "Bleu France": "#000091", "Gris": "#7b7b7b"};
    for(const [name, hex] of Object.entries(baseColors)) {
        const o = document.createElement('option'); o.value = hex; o.textContent = name; optGroupSolid.appendChild(o);
    }
    s.appendChild(optGroupSolid);

    const optGroupGrad = document.createElement('optgroup');
    optGroupGrad.label = "Dégradés DSFR";
    for(const [k, g] of Object.entries(PALETTE_GRADIENTS)){ 
        const c = g.match(/#[a-fA-F0-9]{3,6}/gi); 
        if(c){ 
            const lg = document.createElementNS('http://www.w3.org/2000/svg','linearGradient'); 
            lg.setAttribute('id', 'grad-' + k); lg.setAttribute('x1', '0%'); lg.setAttribute('y1', '0%'); lg.setAttribute('x2', '100%'); lg.setAttribute('y2', '100%'); 
            c.forEach((col, i) => { 
                const st = document.createElementNS('http://www.w3.org/2000/svg','stop'); 
                st.setAttribute('offset', (i / (c.length - 1)) * 100 + '%'); st.setAttribute('stop-color', col); lg.appendChild(st); 
            }); 
            d.appendChild(lg); 
            const o = document.createElement('option'); o.value = k; o.textContent = k; optGroupGrad.appendChild(o); 
        } 
    }
    s.appendChild(optGroupGrad);
}

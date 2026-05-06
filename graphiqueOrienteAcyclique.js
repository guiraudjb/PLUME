/**
* MODULE GRAPHIQUE ORIENTÉ ACYCLIQUE (DAG) - PLUME
* Rendu passif et capture HD optimisée avec rognage automatique selon le contenu.
* Inclut la gestion du thème dynamique (CSS variables).
*/

const DAG_THEMES = {
    "defaut": { name: "Bleu France (Défaut)", start: "#000091", process: "#EEEEEE", decision: "#FEE902", end: "#00A95F", textProcess: "#161616" },
    "emeraude": { name: "Émeraude (Vert)", start: "#00A95F", process: "#e3fdeb", decision: "#c3fad5", end: "#00A95F", textProcess: "#161616" },
    "tuile": { name: "Tuile (Rouge/Orange)", start: "#CE614A", process: "#fef4f3", decision: "#fcdad3", end: "#CE614A", textProcess: "#161616" },
    "cumulus": { name: "Cumulus (Bleu clair)", start: "#417DC4", process: "#f3f6fe", decision: "#dce6fd", end: "#417DC4", textProcess: "#161616" },
    "tournesol": { name: "Tournesol (Jaune)", start: "#C8AA39", process: "#fef6e3", decision: "#fceea8", end: "#C8AA39", textProcess: "#161616" }
};

// --- NOUVEAU : Résolveur de thème dynamique ---
function resolveDAGTheme(themeId) {
    if (themeId === "dynamique") {
        const style = getComputedStyle(document.documentElement);
        const themeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';
        const themeBg = style.getPropertyValue('--theme-bg').trim() || '#f5f5fe';
        
        return {
            name: "Couleurs du thème (Dynamique)",
            start: themeSun, 
            process: themeBg, 
            decision: `color-mix(in srgb, ${themeSun}, white 85%)`, 
            end: themeSun, 
            textProcess: "#161616"
        };
    }
    return DAG_THEMES[themeId] || DAG_THEMES["defaut"];
}

let currentDAGConfig = { nodes: [], links: [], theme: "dynamique" };
let dagNodeCounter = 1;
let isLinkModeActive = false;
let selectedSourceNodeId = null;
let savedRange = null;
let currentZoomState = null;

function measureTextSize(text) {
    const dummy = document.createElement('div');
    document.body.appendChild(dummy);
    dummy.style.position = 'absolute'; dummy.style.visibility = 'hidden';
    dummy.style.width = 'max-content'; dummy.style.maxWidth = '220px';
    dummy.style.fontFamily = 'Marianne, sans-serif'; dummy.style.fontSize = '13px';
    dummy.style.lineHeight = '1.3'; dummy.style.padding = '10px 16px';
    dummy.style.boxSizing = 'border-box'; dummy.style.whiteSpace = 'pre-wrap'; dummy.style.wordBreak = 'break-word';
    dummy.innerText = text || " ";
    const rect = dummy.getBoundingClientRect();
    document.body.removeChild(dummy);
    return { width: Math.max(120, Math.ceil(rect.width)), height: Math.max(40, Math.ceil(rect.height)) };
}

function openDAGStudio() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) savedRange = selection.getRangeAt(0);
    currentZoomState = d3.zoomIdentity;
    // --- MODIFIÉ : Thème par défaut défini sur "dynamique" ---
    currentDAGConfig = { nodes: [{ id: "node_1", text: "Début", type: "start" }], links: [], theme: "dynamique" };
    dagNodeCounter = 1; isLinkModeActive = false; selectedSourceNodeId = null;

    // --- MODIFIÉ : Ajout de l'option dynamique ---
    const themeOptions = `<option value="dynamique">✨ Couleur du Thème (Dynamique)</option>` + 
        Object.keys(DAG_THEMES).map(key =>
            `<option value="${key}">${DAG_THEMES[key].name}</option>`
        ).join('');

    const modalHTML = `
        <div id="dag-modal" class="fr-modal fr-modal--opened">
            <div class="fr-container fr-container--fluid">
                <div class="fr-grid-row fr-grid-row--center">
                    <div class="fr-col-12 fr-col-md-11">
                        <div class="fr-modal__body">
                            <div class="fr-modal__header">
                                <button class="fr-btn--close fr-btn" onclick="closeDAGStudio()">Fermer</button>
                            </div>
                            <div class="fr-modal__content">
                                <h1 class="fr-modal__title">Créateur de Logigramme</h1>
                                <div class="fr-grid-row fr-grid-row--gutters">
                                    <div class="fr-col-3">
                                        <div class="fr-p-3v" style="background: var(--grey-975); border-radius: 4px;">
                                            <h6>Graphique global</h6>
                                            <div class="fr-select-group fr-mb-2w">
                                                <label class="fr-label fr-text--sm">Palette initiale</label>
                                                <select class="fr-select fr-text--sm" onchange="changeDAGTheme(this.value)">
                                                    ${themeOptions}
                                                </select>
                                            </div>
                                            <hr class="fr-pb-1w">
                                            <h6>Structure</h6>
                                            <button class="fr-btn fr-btn--sm fr-btn--secondary fr-mb-1w fr-mr-1w" onclick="addDAGNode()">+ Nouveau bloc</button>
                                            <button id="btn-toggle-link" class="fr-btn fr-btn--sm fr-btn--secondary fr-mb-1w" onclick="toggleLinkMode()">Relier blocs</button>
                                            <p id="dag-helper-text" class="fr-text--xs fr-mt-1v" style="color: #666; min-height: 40px;">
                                                Double-cliquez sur un texte pour l'éditer. L'image insérée sera parfaitement cadrée.
                                            </p>
                                            <hr class="fr-pb-1w">
                                            <div id="dag-node-editor">
                                                <p class="fr-text--xs">Sélectionnez un bloc pour ses options.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="fr-col-9">
                                        <div id="dag-canvas-container" style="width:100%; height:600px; border:1px solid #ddd; background: #fff; overflow:hidden; position:relative; border-radius: 4px; cursor: grab;">
                                            <svg id="dag-svg" width="100%" height="100%"></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="fr-modal__footer">
                                <div class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse">
                                    <button class="fr-btn" onclick="finalizeAndInsertDAG()">Générer et Insérer</button>
                                    <button class="fr-btn fr-btn--secondary" onclick="closeDAGStudio()">Annuler</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    renderDAG(currentDAGConfig);
}

function closeDAGStudio() {
    const modal = document.getElementById('dag-modal');
    if (modal) modal.remove();
    savedRange = null;
}

function changeDAGTheme(newTheme) {
    currentDAGConfig.theme = newTheme;
    renderDAG(currentDAGConfig);
}

function renderDAG(config) {
    const svg = d3.select("#dag-svg");
    svg.selectAll("*").remove();
    if (config.nodes.length === 0) return;
    
    // --- MODIFIÉ : Utilisation du résolveur ---
    const theme = resolveDAGTheme(config.theme);
    
    const g = new dagre.graphlib.Graph().setGraph({ rankdir: "TB", nodesep: 70, ranksep: 80 }).setDefaultEdgeLabel(() => ({}));
    config.nodes.forEach(n => {
        const size = measureTextSize(n.text);
        g.setNode(n.id, { label: n.text, width: size.width, height: size.height, type: n.type });
    });
    config.links.forEach(l => g.setEdge(l.source, l.target));
    dagre.layout(g);
    const innerSvg = svg.append("g");
    const zoomBehavior = d3.zoom().scaleExtent([0.2, 3]).on("zoom", (e) => {
        currentZoomState = e.transform; innerSvg.attr("transform", e.transform);
    });
    svg.call(zoomBehavior); svg.call(zoomBehavior.transform, currentZoomState);
    svg.append("defs").append("marker")
        .attr("id", "arrowhead").attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0)
        .attr("orient", "auto").attr("markerWidth", 6).attr("markerHeight", 6)
        .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", theme.start);
    const lineGenerator = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis);
    innerSvg.selectAll(".edgePath").data(config.links).enter().append("path")
        .attr("d", d => lineGenerator(g.edge(d.source, d.target).points))
        .attr("stroke", theme.start).attr("stroke-width", 3).attr("fill", "none")
        .attr("marker-end", "url(#arrowhead)").style("cursor", "crosshair")
        .on("click", (event, linkData) => { event.stopPropagation(); removeLink(linkData.source, linkData.target); });
    const nodes = innerSvg.selectAll(".node").data(g.nodes()).enter().append("g")
        .attr("transform", v => `translate(${g.node(v).x - g.node(v).width/2}, ${g.node(v).y - g.node(v).height/2})`)
        .on("click", (event, id) => handleNodeInteraction(id));
    nodes.append("rect")
        .attr("width", v => g.node(v).width).attr("height", v => g.node(v).height).attr("rx", 4)
        .attr("fill", v => (selectedSourceNodeId === v) ? "#E3E3FD" : (theme[g.node(v).type] || theme.process))
        .attr("stroke", v => (selectedSourceNodeId === v) ? "#000091" : (g.node(v).type === "process" ? "#CCC" : "none"));
    nodes.append("foreignObject")
        .attr("x", 0).attr("y", 0).attr("width", v => g.node(v).width).attr("height", v => g.node(v).height)
        .append("xhtml:div").attr("contenteditable", isLinkModeActive ? "false" : "true")
        .style("width", "100%").style("height", "100%").style("display", "flex").style("align-items", "center")
        .style("justify-content", "center").style("text-align", "center").style("font-family", "Marianne, sans-serif")
        .style("font-size", "13px").style("line-height", "1.3").style("padding", "10px 16px")
        .style("box-sizing", "border-box").style("white-space", "pre-wrap").style("word-break", "break-word")
        .style("outline", "none").style("cursor", isLinkModeActive ? "pointer" : "text")
        .style("color", v => (g.node(v).type === "start" || g.node(v).type === "end") ? "#FFFFFF" : theme.textProcess)
        .text(v => g.node(v).label)
        .on("mousedown", function(event) { if (!isLinkModeActive) event.stopPropagation(); })
        .on("blur", function(event, v) {
            const newText = this.innerText.trim();
            const node = currentDAGConfig.nodes.find(n => n.id === v);
            if (node && node.text !== newText) { node.text = newText || " "; renderDAG(currentDAGConfig); }
        });
}

function removeLink(s, t) {
    currentDAGConfig.links = currentDAGConfig.links.filter(l => !(l.source === s && l.target === t));
    renderDAG(currentDAGConfig);
}

function handleNodeInteraction(nodeId) {
    if (isLinkModeActive) {
        if (!selectedSourceNodeId) { selectedSourceNodeId = nodeId; renderDAG(currentDAGConfig); }
        else {
            if (selectedSourceNodeId !== nodeId && isSafeToAddLink(selectedSourceNodeId, nodeId)) {
                currentDAGConfig.links.push({ source: selectedSourceNodeId, target: nodeId });
            }
            selectedSourceNodeId = null; renderDAG(currentDAGConfig);
        }
    } else { openNodeEditorPanel(nodeId); }
}

function isSafeToAddLink(s, t) {
    if (s === t) return false;
    let visited = new Set();
    function check(curr) {
        if (curr === s) return true;
        if (visited.has(curr)) return false;
        visited.add(curr);
        return currentDAGConfig.links.filter(l => l.source === curr).some(l => check(l.target));
    }
    return !check(t);
}

function toggleLinkMode() {
    isLinkModeActive = !isLinkModeActive; selectedSourceNodeId = null;
    document.getElementById("btn-toggle-link").className = isLinkModeActive ? "fr-btn fr-btn--sm fr-btn--primary fr-mb-1w" : "fr-btn fr-btn--sm fr-btn--secondary fr-mb-1w";
    renderDAG(currentDAGConfig);
}

function addDAGNode() {
    dagNodeCounter++;
    currentDAGConfig.nodes.push({ id: `node_${dagNodeCounter}`, text: "Nouveau", type: "process" });
    renderDAG(currentDAGConfig);
}

function openNodeEditorPanel(id) {
    const n = currentDAGConfig.nodes.find(x => x.id === id);
    if (!n) return;
    document.getElementById("dag-node-editor").innerHTML = `
        <div class="fr-input-group fr-mb-2w">
            <label class="fr-label fr-text--sm">Fonction du bloc</label>
            <select id="ed-ty" class="fr-select fr-text--sm" onchange="saveNodeType('${id}')">
                <option value="process" ${n.type==='process'?'selected':''}>Action standard</option>
                <option value="decision" ${n.type==='decision'?'selected':''}>Décision / Alternative</option>
                <option value="start" ${n.type==='start'?'selected':''}>Point de départ</option>
                <option value="end" ${n.type==='end'?'selected':''}>Conclusion / Fin</option>
            </select>
        </div>
        <button class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--icon-left fr-icon-delete-line" onclick="delN('${id}')">Supprimer</button>`;
}

function saveNodeType(id) {
    const n = currentDAGConfig.nodes.find(x => x.id === id);
    if (n) { n.type = document.getElementById("ed-ty").value; renderDAG(currentDAGConfig); }
}

function delN(id) {
    currentDAGConfig.nodes = currentDAGConfig.nodes.filter(x => x.id !== id);
    currentDAGConfig.links = currentDAGConfig.links.filter(l => l.source !== id && l.target !== id);
    document.getElementById("dag-node-editor").innerHTML = `<p class="fr-text--xs">Bloc supprimé.</p>`;
    renderDAG(currentDAGConfig);
}

async function finalizeAndInsertDAG() {
    isLinkModeActive = false;
    selectedSourceNodeId = null;
    renderDAG(currentDAGConfig);

    try {
        // --- MODIFIÉ : Utilisation du résolveur ---
        const theme = resolveDAGTheme(currentDAGConfig.theme);
        
        const g = new dagre.graphlib.Graph().setGraph({ rankdir: "TB", nodesep: 70, ranksep: 80 }).setDefaultEdgeLabel(() => ({}));

        currentDAGConfig.nodes.forEach(n => {
            const size = measureTextSize(n.text);
            g.setNode(n.id, { label: n.text, width: size.width, height: size.height, type: n.type });
        });
        currentDAGConfig.links.forEach(l => g.setEdge(l.source, l.target));
        dagre.layout(g);

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        g.nodes().forEach(v => {
            const node = g.node(v);
            minX = Math.min(minX, node.x - node.width / 2); minY = Math.min(minY, node.y - node.height / 2);
            maxX = Math.max(maxX, node.x + node.width / 2); maxY = Math.max(maxY, node.y + node.height / 2);
        });

        const padding = 20; 
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        const totalWidth = contentWidth + padding * 2;
        const totalHeight = contentHeight + padding * 2;

        const shadowContainer = document.createElement('div');
        shadowContainer.style.position = 'absolute';
        shadowContainer.style.left = '-9999px'; 
        shadowContainer.style.top = '0';
        shadowContainer.style.width = totalWidth + 'px';
        shadowContainer.style.height = totalHeight + 'px';
        shadowContainer.style.background = '#ffffff';
        shadowContainer.style.overflow = 'hidden';
        document.body.appendChild(shadowContainer);

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("width", "100%");
        svgElement.setAttribute("height", "100%");
        shadowContainer.appendChild(svgElement);
       
        const svg = d3.select(svgElement);
        const innerSvg = svg.append("g").attr("transform", `translate(${-minX + padding}, ${-minY + padding})`);

        svg.append("defs").append("marker")
            .attr("id", "arrowhead-final").attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0)
            .attr("orient", "auto").attr("markerWidth", 6).attr("markerHeight", 6)
            .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", theme.start);

        const lineGenerator = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis);
        innerSvg.selectAll(".edgePath").data(currentDAGConfig.links).enter().append("path")
            .attr("d", d => lineGenerator(g.edge(d.source, d.target).points))
            .attr("stroke", theme.start).attr("stroke-width", 3).attr("fill", "none")
            .attr("marker-end", "url(#arrowhead-final)");

        const nodes = innerSvg.selectAll(".node").data(g.nodes()).enter().append("g")
            .attr("transform", v => `translate(${g.node(v).x - g.node(v).width/2}, ${g.node(v).y - g.node(v).height/2})`);

        nodes.append("rect")
            .attr("width", v => g.node(v).width).attr("height", v => g.node(v).height).attr("rx", 4)
            .attr("fill", v => theme[g.node(v).type] || theme.process)
            .attr("stroke", v => g.node(v).type === "process" ? "#CCC" : "none");

        nodes.append("foreignObject")
            .attr("x", 0).attr("y", 0).attr("width", v => g.node(v).width).attr("height", v => g.node(v).height)
            .append("xhtml:div")
            .style("width", "100%").style("height", "100%").style("display", "flex").style("align-items", "center")
            .style("justify-content", "center").style("text-align", "center").style("font-family", "Marianne, sans-serif")
            .style("font-size", "13px").style("line-height", "1.3").style("padding", "10px 16px")
            .style("box-sizing", "border-box").style("white-space", "pre-wrap").style("word-break", "break-word")
            .style("color", v => (g.node(v).type === "start" || g.node(v).type === "end") ? "#FFFFFF" : theme.textProcess)
            .text(v => g.node(v).label);

        await new Promise(resolve => setTimeout(resolve, 50)); 
        const canvas = await html2canvas(shadowContainer, { backgroundColor: "#ffffff", scale: 4, useCORS: true, logging: false });
       
        const base64Image = canvas.toDataURL("image/png");
        const configJSON = JSON.stringify(currentDAGConfig).replace(/'/g, "&#39;");

        const html = `
            <div class="plume-component-wrapper fr-my-3w" contenteditable="false" style="text-align:center;">
                <img src="${base64Image}"
                     data-dag-config='${configJSON}'
                     class="plume-dag-image"
                     style="max-width:100%; height:auto; box-shadow: 0 2px 6px rgba(0,0,0,0.05);"
                     alt="Logigramme">
            </div><p><br></p>`;

        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
            document.execCommand('insertHTML', false, html);
        } else {
            document.querySelector('.content-editable').insertAdjacentHTML('beforeend', html);
        }

        document.body.removeChild(shadowContainer);
        closeDAGStudio();

    } catch (e) {
        console.error("Erreur lors de la capture optimisée du DAG :", e);
        const sc = document.querySelector('body > div[style*="-9999px"]');
        if (sc) document.body.removeChild(sc);
    }
}

// --- MODIFIÉ : Moteur de rafraîchissement global sans paramètre ---
async function updateAllDAGThemes() {
    const dagImages = document.querySelectorAll('.plume-dag-image');
   
    for (let img of dagImages) {
        try {
            const rawConfig = img.getAttribute('data-dag-config');
            if (!rawConfig) continue;
           
            let config = JSON.parse(rawConfig);
            
            // On ne met à jour QUE si le graphique a été configuré avec le thème dynamique
            if (config.theme !== "dynamique") continue;

            const shadowContainer = document.createElement('div');
            shadowContainer.style.position = 'absolute';
            shadowContainer.style.left = '-9999px';
            shadowContainer.style.top = '0';
            shadowContainer.style.background = '#ffffff';
            shadowContainer.style.overflow = 'hidden';
            document.body.appendChild(shadowContainer);

            const g = new dagre.graphlib.Graph().setGraph({ rankdir: "TB", nodesep: 70, ranksep: 80 }).setDefaultEdgeLabel(() => ({}));
            config.nodes.forEach(n => {
                const size = measureTextSize(n.text);
                g.setNode(n.id, { label: n.text, width: size.width, height: size.height, type: n.type });
            });
            config.links.forEach(l => g.setEdge(l.source, l.target));
            dagre.layout(g);

            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            g.nodes().forEach(v => {
                const node = g.node(v);
                minX = Math.min(minX, node.x - node.width / 2); minY = Math.min(minY, node.y - node.height / 2);
                maxX = Math.max(maxX, node.x + node.width / 2); maxY = Math.max(maxY, node.y + node.height / 2);
            });
           
            const padding = 20;
            const contentWidth = maxX - minX;
            const contentHeight = maxY - minY;
            const finalWidth = contentWidth + padding * 2;
            const finalHeight = contentHeight + padding * 2;
           
            shadowContainer.style.width = finalWidth + 'px';
            shadowContainer.style.height = finalHeight + 'px';

            const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.setAttribute("width", "100%");
            svgElement.setAttribute("height", "100%");
            shadowContainer.appendChild(svgElement);
           
            const svg = d3.select(svgElement);
            
            // --- MODIFIÉ : Utilisation du résolveur avec la config relue ---
            const theme = resolveDAGTheme(config.theme);
            
            const innerSvg = svg.append("g").attr("transform", `translate(${-minX + padding}, ${-minY + padding})`);

            svg.append("defs").append("marker")
                .attr("id", "arrowhead-shadow").attr("viewBox", "0 -5 10 10").attr("refX", 8).attr("refY", 0)
                .attr("orient", "auto").attr("markerWidth", 6).attr("markerHeight", 6)
                .append("path").attr("d", "M0,-5L10,0L0,5").attr("fill", theme.start);

            const lineGenerator = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveBasis);
            innerSvg.selectAll(".edgePath").data(config.links).enter().append("path")
                .attr("d", d => lineGenerator(g.edge(d.source, d.target).points))
                .attr("stroke", theme.start).attr("stroke-width", 3).attr("fill", "none")
                .attr("marker-end", "url(#arrowhead-shadow)");

            const nodes = innerSvg.selectAll(".node").data(g.nodes()).enter().append("g")
                .attr("transform", v => `translate(${g.node(v).x - g.node(v).width/2}, ${g.node(v).y - g.node(v).height/2})`);

            nodes.append("rect")
                .attr("width", v => g.node(v).width).attr("height", v => g.node(v).height).attr("rx", 4)
                .attr("fill", v => theme[g.node(v).type] || theme.process)
                .attr("stroke", v => g.node(v).type === "process" ? "#CCC" : "none");

            nodes.append("foreignObject")
                .attr("x", 0).attr("y", 0).attr("width", v => g.node(v).width).attr("height", v => g.node(v).height)
                .append("xhtml:div")
                .style("width", "100%").style("height", "100%").style("display", "flex").style("align-items", "center")
                .style("justify-content", "center").style("text-align", "center").style("font-family", "Marianne, sans-serif")
                .style("font-size", "13px").style("line-height", "1.3").style("padding", "10px 16px")
                .style("box-sizing", "border-box").style("white-space", "pre-wrap").style("word-break", "break-word")
                .style("color", v => (g.node(v).type === "start" || g.node(v).type === "end") ? "#FFFFFF" : theme.textProcess)
                .text(v => g.node(v).label);

            await new Promise(resolve => setTimeout(resolve, 50));
            const canvas = await html2canvas(shadowContainer, { backgroundColor: "#ffffff", scale: 4, useCORS: true, logging: false });
           
            img.src = canvas.toDataURL("image/png");
            img.setAttribute('data-dag-config', JSON.stringify(config).replace(/'/g, "&#39;"));
           
            document.body.removeChild(shadowContainer);

        } catch (e) {
            console.error("Erreur lors de l'application du thème au DAG :", e);
        }
    }
}

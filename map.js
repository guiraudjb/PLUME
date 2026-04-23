/**
 * MODULE CARTOGRAPHIQUE - PLUME & VALOR (Luminance & Formatage Pro)
 */

// =====================================================================
// 1. RÉFÉRENTIELS ET MÉMOIRE
// =====================================================================
let geoReferential = { loaded: false, communes: [], epci: [], worldRegions: [], comToDep: new Map(), comToEpci: new Map() };

const REGIONS_DICT = {
    "11": "Île-de-France", "24": "Centre-Val de Loire", "27": "Bourgogne-Franche-Comté",
    "28": "Normandie", "32": "Hauts-de-France", "44": "Grand Est", "52": "Pays de la Loire",
    "53": "Bretagne", "75": "Nouvelle-Aquitaine", "76": "Occitanie", "84": "Auvergne-Rhône-Alpes",
    "93": "Provence-Alpes-Côte d'Azur", "94": "Corse", "01": "Guadeloupe", "02": "Martinique",
    "03": "Guyane", "04": "La Réunion", "06": "Mayotte"
};

function getSafeCol(row, expectedKey) {
    if (!row) return "";
    if (row[expectedKey] !== undefined) return String(row[expectedKey]).trim();
    const keys = Object.keys(row);
    const matchingKey = keys.find(k => k.includes(expectedKey));
    if (matchingKey) return String(row[matchingKey]).trim();
    return String(Object.values(row)[0] || "").trim(); 
}

// Formatage des nombres (Espaces pour les milliers, virgule pour les décimales)
const frenchNumberFormat = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2
});

/**
 * Calcule si le texte doit être noir ou blanc en fonction de la couleur de fond
 * @param {string} color - Couleur au format hexadécimal ou RGB
 * @returns {string} - '#FFFFFF' ou '#161616'
 */
function getContrastingColor(color) {
    const rgb = d3.rgb(color);
    // Formule de luminance relative (WCAG)
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#161616' : '#FFFFFF';
}

async function loadMapReferentials() {
    if (geoReferential.loaded) return; 
    try {
        // CORRECTION ICI : Ajout de worldData dans les crochets
        const [communesData, epciData, worldData] = await Promise.all([
            fetchCSV('./data/v_commune_2025.csv', ','),
            fetchCSV('./data/EPCI_2025.csv', ';'),
            d3.json('./data/world_region_list.json')
        ]);
        geoReferential.communes = communesData;
        geoReferential.epci = epciData;
        geoReferential.worldRegions = worldData || [];
        communesData.forEach(c => geoReferential.comToDep.set(getSafeCol(c, 'COM'), getSafeCol(c, 'DEP')));
        epciData.forEach(e => geoReferential.comToEpci.set(getSafeCol(e, 'CODGEO'), getSafeCol(e, 'EPCI')));
        geoReferential.loaded = true;
    } catch (error) { console.error("Erreur référentiels:", error); }
}

function fetchCSV(url, delimiter = ",") {
    return new Promise((resolve, reject) => {
        Papa.parse(url, { download: true, header: true, delimiter: delimiter, skipEmptyLines: true, complete: res => resolve(res.data), error: err => reject(err) });
    });
}

// =====================================================================
// 2. MOTEUR DE CALCUL (VALOR)
// =====================================================================
function computeValorAggregation(rawData, targetScale, calcMode, colCode, col1, col2) {
    const aggregatedData = new Map();
    let globalTotalCol1 = 0;

    rawData.forEach(row => {
        let sourceCode = String(row[colCode] || "").trim();
        if (!sourceCode) return;
        if (sourceCode.length === 1) sourceCode = "0" + sourceCode;
        else if (sourceCode.length === 4) sourceCode = "0" + sourceCode;
        
        let targetCode = sourceCode;
        if (targetScale === 'national' || targetScale === 'region') {
            targetCode = sourceCode.length >= 4 ? geoReferential.comToDep.get(sourceCode) : sourceCode;
        }
        
        if (!targetCode) return;
        if (!aggregatedData.has(targetCode)) aggregatedData.set(targetCode, { val1: 0, val2: 0 });
        
        const acc = aggregatedData.get(targetCode);
        const v1 = parseFloat(String(row[col1]).replace(',', '.')) || 0;
        const v2 = col2 ? (parseFloat(String(row[col2]).replace(',', '.')) || 0) : 0;
        acc.val1 += v1; acc.val2 += v2; globalTotalCol1 += v1;
    });

    const finalMap = new Map();
    aggregatedData.forEach((acc, code) => {
        let val = 0;
        if (calcMode === 'simple' || calcMode === 'sum') val = acc.val1;
        else if (calcMode === 'ratio') val = acc.val2 !== 0 ? acc.val1 / acc.val2 : 0;
        else if (calcMode === 'growth') val = acc.val1 !== 0 ? ((acc.val2 - acc.val1) / acc.val1) * 100 : 0;
        else if (calcMode === 'share') val = globalTotalCol1 !== 0 ? (acc.val1 / globalTotalCol1) * 100 : 0;
        finalMap.set(String(code), val);
    });
    return finalMap;
}

// =====================================================================
// 3. MOTEUR DE RENDU D3.JS (International & Anti-Collision)
// =====================================================================
async function drawD3Map(container, config, dataMap) {
    const width = container.clientWidth, height = container.clientHeight;
    
    // Récupération des paramètres physiques (avec fallbacks)
    const pStrength = config.physStrength !== undefined ? config.physStrength : 0.15;
    const pPadding = config.physPadding !== undefined ? config.physPadding : 4;
    const pRatio = config.physRatio !== undefined ? config.physRatio : 0.62;
    
    // Sélection du fichier TopoJSON/GeoJSON
    let jsonFile = './data/commune_2025.json'; // Par défaut
    if (config.scale === 'national' || config.scale === 'region') jsonFile = './data/departement_2025.json';
    if (config.scale === 'europe') jsonFile = './data/europe_2025.json';
    if (config.scale === 'world') jsonFile = './data/world_2025.json';
    
    let geoJSON;
    try { 
        geoJSON = await d3.json(jsonFile); 
    } catch (e) {
        container.innerHTML = `<p style="color:red; text-align:center;">Fichier ${jsonFile} introuvable.</p>`;
        return false;
    }

    // On vide le conteneur juste avant de dessiner (Évite les glitchs de superposition)
    container.innerHTML = '';

    // Extraction des polygones (Features)
    let features = [];
    if (geoJSON && geoJSON.type === "Topology" && geoJSON.objects) {
        const objKey = Object.keys(geoJSON.objects)[0];
        const obj = topojson.feature(geoJSON, geoJSON.objects[objKey]);
        features = obj.features ? obj.features : [obj];
    } else if (geoJSON && geoJSON.type === "FeatureCollection") {
        features = geoJSON.features || [];
    }

    // Filtrage spécifique pour les EPCI français
    let validEpciCommunes = new Set();
    if (config.scale === 'epci' && config.epci) {
        const targetEpci = String(config.epci).trim();
        geoReferential.epci.forEach(e => {
            if (getSafeCol(e, 'EPCI') === targetEpci) validEpciCommunes.add(getSafeCol(e, 'CODGEO'));
        });
    }

    // Filtrage des territoires selon l'échelle choisie
    features = features.filter(f => {
        const p = f.properties;
        if (!p) return false;
        if (config.scale === 'region' && config.region) return String(p.code_insee_de_la_region) === String(config.region);
        if (config.scale === 'departement' && config.dept) return String(p.code_insee_du_departement) === String(config.dept);
        if (config.scale === 'epci' && config.epci) return validEpciCommunes.has(String(p.code_insee).trim());
        if (config.scale === 'commune' && config.commune) return String(p.code_insee) === String(config.commune);
        return true; 
    });

    // Sécurité anti-plantage si aucune zone n'est sélectionnée
    if (features.length === 0 || (!['national', 'world', 'europe'].includes(config.scale) && !config.region && !config.epci && !config.commune)) {
        container.innerHTML = `<div style="text-align:center; color:#999; padding:2rem;"><span class="fr-icon-map-pin-2-fill" style="font-size:3rem; display:block; margin-bottom:1rem;"></span><p>Veuillez préciser la zone géographique.</p></div>`;
        return false;
    }

    const svg = d3.select(container).append("svg").attr("width", width).attr("height", height);
    
    // --- 1. DÉFINITION DE LA PROJECTION ---
    let projection;
    if (config.scale === 'world') {
        projection = d3.geoMercator().scale(1).translate([0,0]);
    } else if (config.scale === 'europe') {
        projection = d3.geoMercator().center([15, 50]).scale(1).translate([0,0]);
    } else {
        projection = d3.geoConicConformal().center([2.45, 46.2]).scale(1).translate([0,0]);
    }
    const path = d3.geoPath().projection(projection);

    // --- 2. SYSTÈME DE CADRAGE DYNAMIQUE (AUTO-ZOOM) ---
    let targetFeatures = features; 

    if (config.scale === 'world' && config.worldRegion && config.worldRegion !== 'all') {
        const getIso = (d) => String(d.id || d.properties.iso_a3 || d.properties.ISO3 || d.properties.ADM0_A3 || "");

       if (config.worldRegion === 'auto' && dataMap && dataMap.size > 0) {
            targetFeatures = features.filter(f => dataMap.has(getIso(f)));
        } else {
            // RECHERCHE DYNAMIQUE DANS LE RÉFÉRENTIEL
            const selectedRegion = geoReferential.worldRegions.find(r => r.code === config.worldRegion);
            if (selectedRegion && selectedRegion.countries) {
                targetFeatures = features.filter(f => selectedRegion.countries.includes(getIso(f)));
            }
        }

        // Sécurité
        if (targetFeatures.length === 0) targetFeatures = features;
    }

    const bounds = path.bounds({type: "FeatureCollection", features: targetFeatures});
    const dx = bounds[1][0] - bounds[0][0], dy = bounds[1][1] - bounds[0][1];
    const s = .85 / Math.max(dx / width, dy / height);
    const t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height - 40) - s * (bounds[1][1] + bounds[0][1])) / 2];
    
    projection.scale(s).translate(t);

    // --- 3. GESTION DES COULEURS ---
    const rootStyle = getComputedStyle(document.documentElement);
    const mainColor = rootStyle.getPropertyValue('--theme-sun').trim() || '#000091';
    const bgColor = rootStyle.getPropertyValue('--theme-bg').trim() || '#f5f5fe';
    
    const vals = dataMap && dataMap.size > 0 ? Array.from(dataMap.values()) : [0];
    let minVal = d3.min(vals) || 0, maxVal = d3.max(vals) || 0;
    if (minVal === maxVal) { minVal = 0; maxVal = maxVal || 100; }
    
    const colorScale = d3.scaleLinear().domain([minVal, maxVal]).range([bgColor, mainColor]);

    const g = svg.append("g");
    
    // --- 4. DESSIN DES POLYGONES ---
    g.selectAll("path").data(features).enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            // NOUVEAU : Si on a un cadrage spécifique, on ignore les pays hors-cadre
            if (config.scale === 'world' && config.worldRegion && config.worldRegion !== 'all') {
                if (!targetFeatures.includes(d)) return "#e5e5e5";
            }

            const code = String(
                (config.scale === 'world' || config.scale === 'europe') 
                ? (d.id || d.properties.iso_a3 || d.properties.ISO3 || d.properties.ADM0_A3 || "") 
                : (d.properties.code_insee || "")
            );
            return dataMap && dataMap.has(code) ? colorScale(dataMap.get(code)) : "#e5e5e5";
        })
        .attr("stroke", "#ffffff").attr("stroke-width", 0.5);

    // --- 5. MOTEUR D'ÉTIQUETTES ANTI-COLLISION ---
    if (config.labelType !== 'none') {
        
        const labelNodes = [];
        targetFeatures.forEach(d => {
            const centroid = path.centroid(d);
            if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
                
                // Identification unifiée
                const code = String(
                    (config.scale === 'world' || config.scale === 'europe') 
                    ? (d.id || d.properties.iso_a3 || d.properties.ISO3 || d.properties.ADM0_A3 || "") 
                    : (d.properties.code_insee || "")
                );
                
                // Noms unifiés
                let name = "";
                if (config.scale === 'world' || config.scale === 'europe') {
                    name = d.properties.name_fr || d.properties.name || d.properties.NAME || d.properties.admin || d.properties.ADMIN || "";
                } else {
                    name = d.properties.nom_officiel || d.properties.nom || "";
                }
                
                // Valeurs
                let valStr = "";
                if (dataMap && dataMap.has(code) && dataMap.get(code) !== undefined) {
                    valStr = frenchNumberFormat.format(dataMap.get(code));
                }

                // Calcul taille boîte
                let textLen = 0;
                if (config.labelType === 'name') textLen = name.length;
                else if (config.labelType === 'value') textLen = valStr.length;
                else textLen = Math.max(name.length, valStr.length);
                
                const estimatedWidth = textLen * (config.labelSize * pRatio);
                const estimatedHeight = config.labelSize * (config.labelType === 'both' ? 2.4 : 1.2);

                if (textLen > 0) {
                    labelNodes.push({
                        feature: d, code: code, name: name, valStr: valStr,
                        cx: centroid[0], cy: centroid[1],
                        x: centroid[0], y: centroid[1],
                        width: estimatedWidth, 
                        height: estimatedHeight
                    });
                }
            }
        });

        // Force de collision rectangulaire
        function rectCollide() {
            let nodes;
            function force(alpha) {
                const padding = pPadding; 
                const quad = d3.quadtree().x(d => d.x).y(d => d.y).addAll(nodes);
                
                for (const d of nodes) {
                    quad.visit((q, x1, y1, x2, y2) => {
                        if (!q.length && q.data !== d) {
                            const d2 = q.data;
                            const w = (d.width + d2.width) / 2 + padding * 2;
                            const h = (d.height + d2.height) / 2 + padding * 2;
                            let x = d.x - d2.x;
                            let y = d.y - d2.y;
                            const absX = Math.abs(x) || 0.01; 
                            const absY = Math.abs(y) || 0.01;

                            if (absX < w && absY < h) {
                                const lx = (w - absX) / w;
                                const ly = (h - absY) / h;
                                if (lx < ly) {
                                    x *= lx * alpha;
                                    d.x += x; d2.x -= x;
                                } else {
                                    y *= ly * alpha;
                                    d.y += y; d2.y -= y;
                                }
                            }
                        }
                        const nx1 = d.x - d.width / 2 - padding,
                              ny1 = d.y - d.height / 2 - padding,
                              nx2 = d.x + d.width / 2 + padding,
                              ny2 = d.y + d.height / 2 + padding;
                        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                    });
                }
            }
            force.initialize = _ => nodes = _;
            return force;
        }

        // Exécution physique
        const simulation = d3.forceSimulation(labelNodes)
            .force("x", d3.forceX(d => d.cx).strength(pStrength)) 
            .force("y", d3.forceY(d => d.cy).strength(pStrength))
            .force("collide", rectCollide()) 
            .stop();

        for (let i = 0; i < 250; ++i) simulation.tick();

        labelNodes.forEach(d => {
            d.x = Math.max(20, Math.min(width - 20, d.x));
            d.y = Math.max(20, Math.min(height - 20, d.y));
        });

        // Traits de liaison
        g.selectAll("line.leader")
            .data(labelNodes)
            .enter()
            .append("line")
            .attr("class", "leader")
            .attr("x1", d => d.cx)
            .attr("y1", d => d.cy)
            .attr("x2", d => d.x)
            .attr("y2", d => d.y)
            .attr("stroke", d => {
                const dist = Math.sqrt(Math.pow(d.x - d.cx, 2) + Math.pow(d.y - d.cy, 2));
                return dist > (d.height * 0.8) ? mainColor : "none";
            })
            .attr("stroke-width", 0.8)
            .attr("stroke-dasharray", "2,2")
            .attr("opacity", 0.7);

        // Dessin du texte
        g.selectAll("text.label")
            .data(labelNodes)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", "middle")
            .style("font-size", `${config.labelSize}px`)
            .style("font-family", "Marianne")
            .style("pointer-events", "none")
            .style("text-shadow", "-1.5px -1.5px 0 #fff, 1.5px -1.5px 0 #fff, -1.5px 1.5px 0 #fff, 1.5px 1.5px 0 #fff, 0px 0px 6px #fff") 
            .style("fill", mainColor)
            .style("font-weight", "700")
            .each(function(d) {
                const el = d3.select(this);
                
                if (config.labelType === 'name' && d.name) {
                    el.text(d.name);
                } 
                else if (config.labelType === 'value' && d.valStr) {
                    el.text(d.valStr);
                } 
                else if (config.labelType === 'both') {
                    if (d.name) {
                        el.append("tspan").attr("x", d.x).attr("dy", "-0.2em").text(d.name);
                    }
                    if (d.valStr) {
                        el.append("tspan").attr("x", d.x).attr("dy", d.name ? "1.1em" : "0").text(d.valStr);
                    }
                }
            });
    }
    
    // --- 6. HABILLAGE (Titre & Légende) ---
    svg.append("text").attr("x", 20).attr("y", 35).style("font-weight", "bold").style("font-size", "1.1rem").style("fill", mainColor).text(config.title);

    if (dataMap && dataMap.size > 0 && minVal !== maxVal) {
        const legendWidth = 200, legendHeight = 12;
        const legendX = width - legendWidth - 30, legendY = height - 30;
        const defs = svg.append("defs");
        const grad = defs.append("linearGradient").attr("id", "map-grad").attr("x1","0%").attr("x2","100%");
        grad.append("stop").attr("offset", "0%").attr("stop-color", bgColor);
        grad.append("stop").attr("offset", "100%").attr("stop-color", mainColor);
        const leg = svg.append("g").attr("transform", `translate(${legendX}, ${legendY})`);
        leg.append("rect").attr("width", legendWidth).attr("height", legendHeight).style("fill", "url(#map-grad)").style("stroke", "#ccc");
        leg.append("text").attr("x", 0).attr("y", -6).style("font-size", "0.75rem").text(frenchNumberFormat.format(minVal));
        leg.append("text").attr("x", legendWidth).attr("y", -6).attr("text-anchor", "end").style("font-size", "0.75rem").text(frenchNumberFormat.format(maxVal));
    }

    return true;
}
// =====================================================================
// 4. INTERFACE
// =====================================================================
// =====================================================================
// 4. INTERFACE UTILISATEUR (MODALE) - INSERTION DYNAMIQUE
// =====================================================================
async function insertCarte() {
    const selection = window.getSelection();
    let savedRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    if (!geoReferential.loaded) await loadMapReferentials();

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 1150px; max-width: 95vw; height: 85vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 350px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.2rem;"><span class="fr-icon-france-line"></span> Studio Cartographique</h3>
                <div class="fr-input-group"><label class="fr-label">Titre</label><input class="fr-input" type="text" id="map-title" value="Répartition statistique"></div>
                <div class="geo-selection">
                    <label class="fr-label" style="font-weight:700">Échelle</label>
                    <select class="fr-select" id="map-scale">
                        <option value="world">Monde entier</option>
                        <option value="europe">Europe</option>
                        <option value="national">France entière</option>
                        <option value="region">Région (FR)</option>
                        <option value="departement">Département (FR)</option>
                        <option value="epci">EPCI (FR)</option>
                        <option value="commune">Commune unique (FR)</option>
                    </select>
                    <div id="cascade-menus" style="margin-top:1rem; display:flex; flex-direction:column; gap:0.75rem;"></div>
                </div>
                <hr style="border:none; border-top:1px solid var(--grey-900);">
                <div>
                    <label class="fr-label" style="font-weight:700">Données (.csv)</label>
                    <input type="file" id="map-csv-file" accept=".csv" style="display:none">
                    <button class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-upload-line fr-btn--icon-left" onclick="document.getElementById('map-csv-file').click()" style="width:100%">Importer CSV</button>
                    <div id="csv-status" style="font-size:0.75rem; margin-top:0.5rem; color:#666;"></div>
                    <div id="calc-engine-ui" style="display:none; margin-top:1rem; background:#e3e3fd; padding:1rem; border-radius:4px;">
                        <p style="font-size:0.8rem; color:var(--theme-sun); font-weight: bold;">
                            📍 Identifiant (Col 1) : <span id="label-insee-col" style="font-weight: normal; color: #161616;"></span>
                        </p>
                        <label class="fr-label" style="font-size:0.8rem">Mode</label>
                        <select id="calc-mode" class="fr-select fr-mb-2v">
                            <option value="simple">Somme brute</option>
                            <option value="share">Poids (%)</option>
                            <option value="ratio">Ratio (C1/C2)</option>
                            <option value="growth">Évolution (C1/C2)</option>
                        </select>
                        <label class="fr-label" style="font-size:0.8rem">Donnée principale (Col 2)</label>
                        <select id="calc-col1" class="fr-select fr-mb-2v"></select>
                        <div id="wrap-col2" style="display:none;"><label class="fr-label" style="font-size:0.8rem">Référence (Col 3)</label><select id="calc-col2" class="fr-select"></select></div>
                    </div>
                </div>
                <div style="background:#fff; padding:1rem; border:1px solid var(--grey-900);">
                    <label class="fr-label" style="font-weight:700">Étiquettes</label>
                    <select class="fr-select fr-mb-2v" id="label-type">
                        <option value="name">Nom</option>
                        <option value="value">Valeur</option>
                        <option value="both">Nom + Valeur</option>
                        <option value="none">Aucune</option>
                    </select>
                    
                    <label class="fr-label" style="font-size:0.8rem; display:flex; justify-content:space-between;">
                        Taille <span id="label-size-display" style="color:var(--theme-main); font-weight:bold;">10px</span>
                    </label>
                    <input type="range" id="label-size" min="6" max="30" value="10" style="width:100%">

                    <details style="margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--grey-900);">
                        <summary style="font-size:0.85rem; font-weight:700; cursor:pointer; color:var(--theme-main); outline:none; user-select:none;">
                            ⚙️ Moteur anti-collision
                        </summary>
                        <div style="margin-top:1rem; display:flex; flex-direction:column; gap:1rem;">
                            
                            <div>
                                <label class="fr-label" style="font-size:0.75rem; display:flex; justify-content:space-between; margin-bottom:0.2rem;">
                                    Tension de l'élastique <span id="phys-strength-display" style="font-weight:bold;">0.15</span>
                                </label>
                                <input type="range" id="phys-strength" min="0" max="1" step="0.05" value="0.15" style="width:100%">
                            </div>

                            <div>
                                <label class="fr-label" style="font-size:0.75rem; display:flex; justify-content:space-between; margin-bottom:0.2rem;">
                                    Marge entre les mots <span id="phys-padding-display" style="font-weight:bold;">4px</span>
                                </label>
                                <input type="range" id="phys-padding" min="0" max="15" step="1" value="4" style="width:100%">
                            </div>

                            <div>
                                <label class="fr-label" style="font-size:0.75rem; display:flex; justify-content:space-between; margin-bottom:0.2rem;">
                                    Largeur de la boîte <span id="phys-ratio-display" style="font-weight:bold;">0.62</span>
                                </label>
                                <input type="range" id="phys-ratio" min="0.3" max="1.5" step="0.02" value="0.62" style="width:100%">
                            </div>

                            <button class="fr-btn fr-btn--sm fr-btn--tertiary fr-icon-refresh-line fr-btn--icon-left" id="btn-phys-reset" style="width:100%; justify-content:center; margin-top:0.5rem;">
                                Réinitialiser le moteur
                            </button>

                        </div>
                    </details>
                </div>
                <div style="margin-top:auto; display:flex; gap:0.5rem;"><button class="fr-btn fr-btn--secondary" id="btn-map-cancel">Annuler</button><button class="fr-btn" id="btn-map-insert" disabled>Insérer</button></div>
            </div>
            <div id="map-preview-area" style="flex:1; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const scaleSelect = document.getElementById('map-scale');
    document.getElementById('btn-phys-reset').onclick = () => {
        // Valeurs par défaut définies
        const defaults = {
            'phys-strength': 0.15,
            'phys-padding': 4,
            'phys-ratio': 0.62
        };

        // On remet les curseurs et les affichages à zéro
        Object.keys(defaults).forEach(id => {
            const val = defaults[id];
            const input = document.getElementById(id);
            input.value = val;
            
            let unit = id === 'phys-padding' ? 'px' : '';
            document.getElementById(`${id}-display`).innerText = `${val}${unit}`;
        });

        // On relance le rendu de la carte
        renderPreview();
    };
    const cascadeContainer = document.getElementById('cascade-menus');
    let rawCsvData = [];
    let mapData = null;

    const createSelect = (id, label, options) => {
        const sel = document.createElement('select');
        sel.id = id; sel.className = 'fr-select';
        sel.innerHTML = `<option value="">-- ${label} --</option>`;
        options.forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.code; o.textContent = opt.name;
            sel.appendChild(o);
        });
        cascadeContainer.appendChild(sel);
        return sel;
    };

    async function renderPreview() {
        const preview = document.getElementById('map-preview-area');
        mapData = null;
        if (rawCsvData.length > 0) {
            const codeCol = Object.keys(rawCsvData[0])[0];
            mapData = computeValorAggregation(rawCsvData, scaleSelect.value, document.getElementById('calc-mode').value, codeCol, document.getElementById('calc-col1').value, document.getElementById('calc-col2').value);
        }
        const config = {
            scale: scaleSelect.value,
            worldRegion: document.getElementById('sel-world-region')?.value, // <-- AJOUTEZ CETTE LIGNE
            region: document.getElementById('sel-region')?.value,
            dept: document.getElementById('sel-dept')?.value,
            epci: document.getElementById('sel-epci')?.value,
            commune: document.getElementById('sel-com')?.value,
            labelType: document.getElementById('label-type').value,
            labelSize: document.getElementById('label-size').value,
            title: document.getElementById('map-title').value,
            physStrength: parseFloat(document.getElementById('phys-strength').value),
            physPadding: parseInt(document.getElementById('phys-padding').value),
            physRatio: parseFloat(document.getElementById('phys-ratio').value)
            
        };
        const success = await drawD3Map(preview, config, mapData);
        document.getElementById('btn-map-insert').disabled = !success;
    }

    const updateCascade = () => {
        cascadeContainer.innerHTML = '';
        
        // CORRECTION ICI : On inclut 'world' et 'europe' dans les échelles qui ne nécessitent pas de sous-menus !
       if (scaleSelect.value === 'world') {
            // Options de base immuables
            const options = [
                {code: 'all', name: '🌍 Planisphère complet'},
                {code: 'auto', name: '✨ Auto-cadrage (sur le CSV)'}
            ];

            // Ajout dynamique des régions chargées depuis le JSON
            geoReferential.worldRegions.forEach(reg => {
                options.push({ code: reg.code, name: reg.name });
            });

            const worldSel = createSelect('sel-world-region', 'Centrage', options);
            worldSel.onchange = renderPreview;
            worldSel.value = 'all';
            renderPreview();
            return;
        }

        if (['national', 'europe'].includes(scaleSelect.value)) { 
            renderPreview(); 
            return; 
        }
        // Étape 1 : Choix de la Région (pour les échelles locales)
        const regSel = createSelect('sel-region', 'Région', getUniqueRegions());
        
        regSel.onchange = () => {
            Array.from(cascadeContainer.children).slice(Array.from(cascadeContainer.children).indexOf(regSel) + 1).forEach(c => c.remove());
            
            if (scaleSelect.value === 'region') {
                renderPreview();
            } else if (['departement', 'commune', 'epci'].includes(scaleSelect.value)) {
                
                // Étape 2 : Choix du Département
                const depSel = createSelect('sel-dept', 'Département', getDeptsByRegion(regSel.value));
                
                depSel.onchange = () => {
                    Array.from(cascadeContainer.children).slice(Array.from(cascadeContainer.children).indexOf(depSel) + 1).forEach(c => c.remove());
                    
                    if (scaleSelect.value === 'departement') {
                        renderPreview();
                    } else if (scaleSelect.value === 'commune') {
                        createSelect('sel-com', 'Commune', getCommunesByDept(depSel.value)).onchange = renderPreview;
                    } else if (scaleSelect.value === 'epci') {
                        createSelect('sel-epci', 'EPCI', getEPCIsByDept(depSel.value)).onchange = renderPreview;
                    }
                };
            }
        };
        renderPreview();
    };
    
    scaleSelect.onchange = updateCascade;
    updateCascade();

    document.getElementById('map-csv-file').onchange = (e) => {
        Papa.parse(e.target.files[0], { header: true, skipEmptyLines: true, complete: (res) => {
            rawCsvData = res.data;
            const headers = res.meta.fields;
            document.getElementById('csv-status').innerText = `✅ ${rawCsvData.length} lignes.`;
            document.getElementById('calc-engine-ui').style.display = 'block';
            document.getElementById('label-insee-col').innerText = headers[0];
            ['calc-col1', 'calc-col2'].forEach(id => {
                const s = document.getElementById(id); s.innerHTML = '';
                for (let i = 1; i < headers.length; i++) { 
                    const o = document.createElement('option'); o.value = headers[i]; o.textContent = headers[i]; s.appendChild(o); 
                }
            });
            if (headers.length > 1) document.getElementById('calc-col1').selectedIndex = 0;
            if (headers.length > 2) document.getElementById('calc-col2').selectedIndex = 1;
            renderPreview();
        }});
    };

    document.getElementById('calc-mode').onchange = (e) => { document.getElementById('wrap-col2').style.display = ['ratio', 'growth'].includes(e.target.value) ? 'block' : 'none'; renderPreview(); };
   ['calc-col1', 'calc-col2', 'label-type', 'map-title'].forEach(id => document.getElementById(id).onchange = renderPreview);
    // 1. Écouteur pour la taille du texte (ISOLÉ)
    document.getElementById('label-size').oninput = (e) => {
        document.getElementById('label-size-display').innerText = `${e.target.value}px`;
        renderPreview();
    };

    // 2. Écouteurs pour le moteur physique (SÉPARÉS PROPREMENT)
    ['phys-strength', 'phys-padding', 'phys-ratio'].forEach(id => {
        document.getElementById(id).oninput = (e) => {
            let unit = id === 'phys-padding' ? 'px' : '';
            document.getElementById(`${id}-display`).innerText = `${e.target.value}${unit}`;
            renderPreview();
        };
    });

    // Bouton Annuler
    document.getElementById('btn-map-cancel').onclick = () => overlay.remove();

    // Bouton Insérer
    document.getElementById('btn-map-insert').onclick = async () => {
        
        // 1. Sauvegarde de la configuration (avec TOUS les réglages du moteur physique inclus)
        const configToSave = {
            scale: scaleSelect.value,
            worldRegion: document.getElementById('sel-world-region')?.value, // <-- AJOUTEZ CETTE LIGNE ICI AUSSI
            region: document.getElementById('sel-region')?.value,
            dept: document.getElementById('sel-dept')?.value,
            epci: document.getElementById('sel-epci')?.value,
            commune: document.getElementById('sel-com')?.value,
            labelType: document.getElementById('label-type').value,
            labelSize: document.getElementById('label-size').value,
            title: document.getElementById('map-title').value,
            physStrength: parseFloat(document.getElementById('phys-strength').value),
            physPadding: parseInt(document.getElementById('phys-padding').value),
            physRatio: parseFloat(document.getElementById('phys-ratio').value),
            mapDataEntries: mapData ? Array.from(mapData.entries()) : []
        };
        const safeConfig = encodeURIComponent(JSON.stringify(configToSave));

        // 2. Création du "Studio invisible" 800x600
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-10000px';
        tempDiv.style.top = '-10000px';
        tempDiv.style.width = '800px';
        tempDiv.style.height = '600px';
        tempDiv.style.backgroundColor = '#ffffff';
        document.body.appendChild(tempDiv);

        // Dessin de la carte dans le studio
        await drawD3Map(tempDiv, configToSave, mapData);

        // 3. Capture propre et ciblée
        const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            width: 800,
            height: 600
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // 4. Nettoyage
        tempDiv.remove();
        overlay.remove(); 
        
        // 5. Restauration du curseur
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // 6. Insertion HTML
        const mapHTML = `
            <div class="map-container" data-map-config="${safeConfig}" style="display:block; margin:1rem 0; width:100%; text-align:center; break-inside: avoid;" contenteditable="false">
                <img src="${imgData}" style="
                    display:inline-block; 
                    width:auto; 
                    max-width:100%; 
                    max-height:65vh; 
                    height:auto; 
                    object-fit:contain; 
                    border:1px solid var(--grey-900); 
                    background:#fff;
                ">
            </div><p><br></p>`;
            
        insertHTML(sanitizeHTML(mapHTML));
    };

} // <-- FIN OFFICIELLE DE LA FONCTION insertCarte()

// =====================================================================
// HELPERS CASCADE (Ne pas modifier)
// =====================================================================
function getUniqueRegions() { return [...new Set(geoReferential.communes.map(c => getSafeCol(c, 'REG')))].filter(Boolean).map(c => ({ code: c, name: REGIONS_DICT[c] || c })).sort((a,b) => a.name.localeCompare(b.name)); }
function getDeptsByRegion(r) { return [...new Set(geoReferential.communes.filter(c => getSafeCol(c, 'REG') === String(r).trim()).map(c => getSafeCol(c, 'DEP')))].filter(Boolean).map(c => ({ code: c, name: `Dpt ${c}` })); }
function getEPCIsByRegion(r) { 
    const coms = new Set(geoReferential.communes.filter(c => getSafeCol(c, 'REG') === String(r).trim()).map(c => getSafeCol(c, 'COM'))); 
    return [...new Map(geoReferential.epci.filter(e => coms.has(getSafeCol(e, 'CODGEO'))).map(e => [getSafeCol(e, 'EPCI'), getSafeCol(e, 'LIBEPCI')]))].map(([code, name]) => ({ code, name })); 
}

function getEPCIsByDept(d) {
    // 1. On trouve toutes les communes appartenant à ce département
    const coms = new Set(geoReferential.communes.filter(c => getSafeCol(c, 'DEP') === String(d).trim()).map(c => getSafeCol(c, 'COM'))); 
    
    // 2. On trouve tous les EPCI qui contiennent au moins une de ces communes
    return [...new Map(geoReferential.epci.filter(e => coms.has(getSafeCol(e, 'CODGEO'))).map(e => [getSafeCol(e, 'EPCI'), getSafeCol(e, 'LIBEPCI')]))]
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Tri alphabétique pour le confort de lecture
}
function getCommunesByDept(d) { return geoReferential.communes.filter(c => getSafeCol(c, 'DEP') === String(d).trim()).map(c => ({ code: getSafeCol(c, 'COM'), name: getSafeCol(c, 'LIBELLE') })); }

/**
 * Scanne le document, lit la mémoire des cartes (data-map-config) 
 * et les met à jour avec la palette actuelle.
 */
async function refreshAllMaps() {
    const mapContainers = document.querySelectorAll('.map-container[data-map-config]');
    if (mapContainers.length === 0) return;

    // Sécurité : Si l'utilisateur charge une sauvegarde JSON et change la couleur
    // tout de suite, il faut s'assurer que les référentiels Géo sont chargés en mémoire.
    if (!geoReferential.loaded) {
        await loadMapReferentials();
    }

    // On traite chaque carte (boucle asynchrone for...of)
    for (const container of mapContainers) {
        try {
            // 1. Lecture de la mémoire
            const rawConfig = container.getAttribute('data-map-config');
            const config = JSON.parse(decodeURIComponent(rawConfig));
            
            // Reconstitution des données (Array vers objet Map JavaScript)
            let mapData = null;
            if (config.mapDataEntries && config.mapDataEntries.length > 0) {
                mapData = new Map(config.mapDataEntries);
            }

            // 2. Création d'un "Studio invisible" pour redessiner la carte
            // On lui donne des proportions standards pour garder un beau rendu
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.left = '-10000px'; // Hors de l'écran
            tempDiv.style.top = '-10000px';
            tempDiv.style.width = '800px';
            tempDiv.style.height = '600px';
            tempDiv.style.backgroundColor = '#ffffff';
            document.body.appendChild(tempDiv);

            // 3. Dessin de la carte (D3.js va utiliser les nouvelles couleurs CSS automatiquement)
            const success = await drawD3Map(tempDiv, config, mapData);

            if (success) {
                // 4. Capture en image (html2canvas)
                const canvas = await html2canvas(tempDiv, {
                    scale: 2,
                    backgroundColor: "#ffffff",
                    logging: false,
                    width: tempDiv.clientWidth,
                    height: tempDiv.clientHeight
                });

                // 5. Remplacement de l'ancienne image
                const imgElement = container.querySelector('img');
                if (imgElement) {
                    imgElement.src = canvas.toDataURL('image/png');
                }
            }

            // 6. Nettoyage du studio invisible
            tempDiv.remove();

        } catch (e) {
            console.error("Impossible de rafraîchir la carte :", e);
        }
    }
}



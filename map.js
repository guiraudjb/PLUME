/**
 * MODULE CARTOGRAPHIQUE - PLUME & VALOR (Luminance & Formatage Pro)
 */

// =====================================================================
// 1. RÉFÉRENTIELS ET MÉMOIRE
// =====================================================================
let geoReferential = { loaded: false, communes: [], epci: [], comToDep: new Map(), comToEpci: new Map() };

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
        const [communesData, epciData] = await Promise.all([
            fetchCSV('./data/v_commune_2025.csv', ','),
            fetchCSV('./data/EPCI_2025.csv', ';')
        ]);
        geoReferential.communes = communesData;
        geoReferential.epci = epciData;
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
// 3. MOTEUR DE RENDU D3.JS
// =====================================================================
async function drawD3Map(container, config, dataMap) {
    container.innerHTML = '';
    const width = container.clientWidth, height = container.clientHeight;
    
    let jsonFile = (config.scale === 'national' || config.scale === 'region') 
                   ? './data/departement_2025.json' 
                   : './data/commune_2025.json';
    
    let geoJSON;
    try { geoJSON = await d3.json(jsonFile); } catch (e) {
        container.innerHTML = `<p style="color:red; text-align:center;">Fichier ${jsonFile} introuvable.</p>`;
        return false;
    }

    let features = [];
    if (geoJSON && geoJSON.type === "Topology" && geoJSON.objects) {
        const objKey = Object.keys(geoJSON.objects)[0];
        const obj = topojson.feature(geoJSON, geoJSON.objects[objKey]);
        features = obj.features ? obj.features : [obj];
    } else if (geoJSON && geoJSON.type === "FeatureCollection") {
        features = geoJSON.features || [];
    }

    let validEpciCommunes = new Set();
    if (config.scale === 'epci' && config.epci) {
        const targetEpci = String(config.epci).trim();
        geoReferential.epci.forEach(e => {
            if (getSafeCol(e, 'EPCI') === targetEpci) validEpciCommunes.add(getSafeCol(e, 'CODGEO'));
        });
    }

    features = features.filter(f => {
        const p = f.properties;
        if (!p) return false;
        if (config.scale === 'region' && config.region) return String(p.code_insee_de_la_region) === String(config.region);
        if (config.scale === 'departement' && config.dept) return String(p.code_insee_du_departement) === String(config.dept);
        if (config.scale === 'epci' && config.epci) return validEpciCommunes.has(String(p.code_insee).trim());
        if (config.scale === 'commune' && config.commune) return String(p.code_insee) === String(config.commune);
        return true; 
    });

    if (features.length === 0 || ((config.scale !== 'national') && !config.region && !config.epci && !config.commune)) {
        container.innerHTML = `<div style="text-align:center; color:#999; padding:2rem;"><span class="fr-icon-map-pin-2-fill" style="font-size:3rem; display:block; margin-bottom:1rem;"></span><p>Veuillez préciser la zone géographique.</p></div>`;
        return false;
    }

    const svg = d3.select(container).append("svg").attr("width", width).attr("height", height);
    const projection = d3.geoConicConformal().center([2.45, 46.2]).scale(1).translate([0,0]);
    const path = d3.geoPath().projection(projection);
    
    const bounds = path.bounds({type: "FeatureCollection", features: features});
    const dx = bounds[1][0] - bounds[0][0], dy = bounds[1][1] - bounds[0][1];
    
    const s = .85 / Math.max(dx / width, dy / height);
    const t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height - 40) - s * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(s).translate(t);

    const rootStyle = getComputedStyle(document.documentElement);
    const mainColor = rootStyle.getPropertyValue('--theme-sun').trim() || '#000091';
    const bgColor = rootStyle.getPropertyValue('--theme-bg').trim() || '#f5f5fe';
    
    const vals = dataMap && dataMap.size > 0 ? Array.from(dataMap.values()) : [0];
    let minVal = d3.min(vals) || 0, maxVal = d3.max(vals) || 0;
    if (minVal === maxVal) { minVal = 0; maxVal = maxVal || 100; }
    
    const colorScale = d3.scaleLinear().domain([minVal, maxVal]).range([bgColor, mainColor]);

    const g = svg.append("g");
    
    // Rendu des polygones
    g.selectAll("path").data(features).enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const code = String(d.properties.code_insee || "");
            return dataMap && dataMap.has(code) ? colorScale(dataMap.get(code)) : "#e5e5e5";
        })
        .attr("stroke", "#ffffff").attr("stroke-width", 0.5);

    // Rendu des étiquettes avec luminance dynamique
    if (config.labelType !== 'none') {
        g.selectAll("text.label").data(features).enter().append("text")
            .attr("class", "label")
            .attr("transform", d => {
                const c = path.centroid(d);
                return `translate(${c})`;
            })
            .attr("text-anchor", "middle")
            .style("font-size", `${config.labelSize}px`)
            .style("font-family", "Marianne")
            .style("pointer-events", "none")
            .each(function(d) {
                const el = d3.select(this);
                const code = String(d.properties.code_insee || "");
                const name = d.properties.nom_officiel || "";
                
                // Récupération de la couleur du fond pour le contraste
                const currentFill = dataMap && dataMap.has(code) ? colorScale(dataMap.get(code)) : "#e5e5e5";
                const textColor = getContrastingColor(currentFill);
                el.style("fill", textColor);

                let val = null;
                if (dataMap && dataMap.has(code)) {
                    val = dataMap.get(code);
                    val = frenchNumberFormat.format(val);
                }

                if (config.labelType === 'name') el.text(name);
                else if (config.labelType === 'value' && val !== null) el.text(val);
                else if (config.labelType === 'both' && val !== null) {
                    el.append("tspan").attr("x", 0).attr("dy", "-0.2em").text(name);
                    el.append("tspan").attr("x", 0).attr("dy", "1.1em").style("font-weight", "bold").text(val);
                }
            });
    }
    
    // Titre et Légende
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
                        <option value="national">France entière</option>
                        <option value="region">Région</option>
                        <option value="departement">Département</option>
                        <option value="epci">EPCI</option>
                        <option value="commune">Commune unique</option>
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
                    <label class="fr-label" style="font-size:0.8rem">Taille</label>
                    <input type="range" id="label-size" min="6" max="24" value="10" style="width:100%">
                </div>
                <div style="margin-top:auto; display:flex; gap:0.5rem;"><button class="fr-btn fr-btn--secondary" id="btn-map-cancel">Annuler</button><button class="fr-btn" id="btn-map-insert" disabled>Insérer</button></div>
            </div>
            <div id="map-preview-area" style="flex:1; background:#fff; display:flex; align-items:center; justify-content:center; overflow:hidden; position:relative;"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const scaleSelect = document.getElementById('map-scale');
    const cascadeContainer = document.getElementById('cascade-menus');
    let rawCsvData = [];

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
        let mapData = null;
        if (rawCsvData.length > 0) {
            const codeCol = Object.keys(rawCsvData[0])[0];
            mapData = computeValorAggregation(rawCsvData, scaleSelect.value, document.getElementById('calc-mode').value, codeCol, document.getElementById('calc-col1').value, document.getElementById('calc-col2').value);
        }
        const config = {
            scale: scaleSelect.value,
            region: document.getElementById('sel-region')?.value,
            dept: document.getElementById('sel-dept')?.value,
            epci: document.getElementById('sel-epci')?.value,
            commune: document.getElementById('sel-com')?.value,
            labelType: document.getElementById('label-type').value,
            labelSize: document.getElementById('label-size').value,
            title: document.getElementById('map-title').value
        };
        const success = await drawD3Map(preview, config, mapData);
        document.getElementById('btn-map-insert').disabled = !success;
    }

    const updateCascade = () => {
        cascadeContainer.innerHTML = '';
        if (scaleSelect.value === 'national') { renderPreview(); return; }
        const regSel = createSelect('sel-region', 'Région', getUniqueRegions());
        regSel.onchange = () => {
            Array.from(cascadeContainer.children).slice(Array.from(cascadeContainer.children).indexOf(regSel) + 1).forEach(c => c.remove());
            if (scaleSelect.value === 'region') renderPreview();
            else if (['departement', 'commune'].includes(scaleSelect.value)) {
                const depSel = createSelect('sel-dept', 'Département', getDeptsByRegion(regSel.value));
                depSel.onchange = () => {
                    Array.from(cascadeContainer.children).slice(Array.from(cascadeContainer.children).indexOf(depSel) + 1).forEach(c => c.remove());
                    if (scaleSelect.value === 'departement') renderPreview();
                    else createSelect('sel-com', 'Commune', getCommunesByDept(depSel.value)).onchange = renderPreview;
                };
            } else if (scaleSelect.value === 'epci') createSelect('sel-epci', 'EPCI', getEPCIsByRegion(regSel.value)).onchange = renderPreview;
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
    document.getElementById('label-size').oninput = renderPreview;

    document.getElementById('btn-map-insert').onclick = async () => {
        const mapArea = document.getElementById('map-preview-area');
        
        // 1. Capture Propre : On force les dimensions pour éviter l'ascenseur
        const canvas = await html2canvas(mapArea, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            // On s'assure de capturer toute la zone sans scroll
            width: mapArea.scrollWidth,
            height: mapArea.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        overlay.remove();
        
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // 2. Insertion avec Contraintes Intelligentes
        // max-width: 100% -> Ne dépasse jamais les bords latéraux (colonnes, marges)
        // max-height: 70vh -> Ne dépasse jamais environ 70% de la hauteur de la page
        // object-fit: contain -> Garde les proportions sans déformer
        const mapHTML = `
            <div class="map-container" style="display:block; margin:1rem 0; width:100%; text-align:center; break-inside: avoid;" contenteditable="false">
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
    document.getElementById('btn-map-cancel').onclick = () => overlay.remove();
}
// --- HELPERS CASCADE ---
function getUniqueRegions() { return [...new Set(geoReferential.communes.map(c => getSafeCol(c, 'REG')))].filter(Boolean).map(c => ({ code: c, name: REGIONS_DICT[c] || c })).sort((a,b) => a.name.localeCompare(b.name)); }
function getDeptsByRegion(r) { return [...new Set(geoReferential.communes.filter(c => getSafeCol(c, 'REG') === String(r).trim()).map(c => getSafeCol(c, 'DEP')))].filter(Boolean).map(c => ({ code: c, name: `Dpt ${c}` })); }
function getEPCIsByRegion(r) { 
    const coms = new Set(geoReferential.communes.filter(c => getSafeCol(c, 'REG') === String(r).trim()).map(c => getSafeCol(c, 'COM'))); 
    return [...new Map(geoReferential.epci.filter(e => coms.has(getSafeCol(e, 'CODGEO'))).map(e => [getSafeCol(e, 'EPCI'), getSafeCol(e, 'LIBEPCI')]))].map(([code, name]) => ({ code, name })); 
}
function getCommunesByDept(d) { return geoReferential.communes.filter(c => getSafeCol(c, 'DEP') === String(d).trim()).map(c => ({ code: getSafeCol(c, 'COM'), name: getSafeCol(c, 'LIBELLE') })); }

/**
 * MODULE CARTOGRAPHIQUE PRO - PLUME
 * Version : Calcul Manuel + Entonnoir + Métadonnées Embarquées (data-map-config)
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

const DEPARTEMENTS_DICT = {
    "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes", "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube", "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal", "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud", "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne", "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère", "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault", "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura", "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique", "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire", "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle", "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord", "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques", "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin", "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie", "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines", "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var", "84": "Vaucluse", "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges", "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine", "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise", "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
};

const frenchNumberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 });

function getSafeCol(row, expectedKey) {
    if (!row) return "";
    if (row[expectedKey] !== undefined) return String(row[expectedKey]).trim();
    const keys = Object.keys(row);
    const matchingKey = keys.find(k => k.includes(expectedKey));
    return matchingKey ? String(row[matchingKey]).trim() : String(Object.values(row)[0] || "").trim();
}

async function loadMapReferentials() {
    if (geoReferential.loaded) return; 
    try {
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
        if (sourceCode.length === 1 || sourceCode.length === 4) sourceCode = "0" + sourceCode;
        
        let targetCode = sourceCode;
        if (targetScale === 'national' || targetScale === 'region') {
            targetCode = (sourceCode.length >= 4) ? geoReferential.comToDep.get(sourceCode) : sourceCode;
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
// 3. MOTEUR DE RENDU D3.JS (Ultra-Optimisé)
// =====================================================================
async function drawD3Map(container, config, dataMap) {
    const width = container.clientWidth, height = container.clientHeight;
    const pStrength = config.physStrength ?? 0.15;
    const pPadding = config.physPadding ?? 4;
    const pRatio = 0.62;
    const lSize = config.labelSize ?? 10;
    
    let jsonFile = './data/commune_2025.json'; 
    if (['national', 'region'].includes(config.scale)) jsonFile = './data/departement_2025.json';
    if (config.scale === 'world') jsonFile = './data/world_2025.json';
    
    let geoJSON;
    try { geoJSON = await d3.json(jsonFile); } catch (e) { return false; }

    container.innerHTML = '';
    let features = [];
    if (geoJSON.type === "Topology") {
        const key = Object.keys(geoJSON.objects)[0];
        features = topojson.feature(geoJSON, geoJSON.objects[key]).features;
    } else {
        features = geoJSON.features || [];
    }

    let validEpci = new Set();
    if (config.scale === 'epci' && config.epci) {
        geoReferential.epci.forEach(e => { if (getSafeCol(e, 'EPCI') === String(config.epci)) validEpci.add(getSafeCol(e, 'CODGEO')); });
    }

    const getIso = (d) => String(d.id || d.properties.iso_a3 || d.properties.ISO3 || d.properties.ADM0_A3 || "");

    let targetFeatures = features.filter(f => {
        const p = f.properties;
        const codeReg = String(p.code_insee_de_la_region || p.code_insee_region || p.reg || "");
        const codeDep = String(p.code_insee_du_departement || p.code_insee_departement || p.dep || "");
        const codeCom = String(p.code_insee || p.code || "");

        if (config.scale === 'region' && config.region) return codeReg === String(config.region);
        if (config.scale === 'departement' && config.dept) return codeDep === String(config.dept);
        if (config.scale === 'epci' && config.epci) return validEpci.has(codeCom);
        if (config.scale === 'commune' && config.commune) return codeCom === String(config.commune);
        
        if (config.scale === 'world' && config.worldRegion && config.worldRegion !== 'all') {
            if (config.worldRegion === 'auto' && dataMap) return dataMap.has(getIso(f));
            const reg = geoReferential.worldRegions.find(r => r.code === config.worldRegion);
            return reg ? reg.countries.includes(getIso(f)) : true;
        }
        return true; 
    });

    if (targetFeatures.length === 0) return false;

    const svg = d3.select(container).append("svg").attr("width", width).attr("height", height);
    let projection = (config.scale === 'world') ? d3.geoMercator().scale(1).translate([0,0]) : d3.geoConicConformal().center([2.45, 46.2]).scale(1).translate([0,0]);
    const path = d3.geoPath().projection(projection);

    let cameraFeatures = targetFeatures;
    if (config.scale === 'world') {
        const giants = ['FRA', 'RUS', 'USA', 'ATA'];
        const filteredCamera = targetFeatures.filter(f => !giants.includes(getIso(f)));
        if (filteredCamera.length > 0) cameraFeatures = filteredCamera;
    } else if (config.scale === 'national') {
        cameraFeatures = targetFeatures.filter(f => !String(f.properties.code_insee || "").startsWith('97'));
    }

    const bounds = path.bounds({type: "FeatureCollection", features: cameraFeatures});
    const s = .85 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
    const t = [(width - s * (bounds[1][0] + bounds[0][0])) / 2, ((height - 40) - s * (bounds[1][1] + bounds[0][1])) / 2];
    projection.scale(s).translate(t);

    const rootStyle = getComputedStyle(document.documentElement);
    const mainColor = rootStyle.getPropertyValue('--theme-sun').trim() || '#000091';
    const bgColor = rootStyle.getPropertyValue('--theme-bg').trim() || '#f5f5fe';
    
    const vals = dataMap && dataMap.size > 0 ? Array.from(dataMap.values()) : [0];
    let minVal = d3.min(vals) || 0, maxVal = d3.max(vals) || 0;
    if (minVal === maxVal) { minVal = 0; maxVal = maxVal || 100; }
    
    const colorScale = d3.scaleLinear().domain([minVal, maxVal]).range([bgColor, mainColor]);

    let renderFeatures = features;
    if (['departement', 'epci', 'commune'].includes(config.scale)) {
        renderFeatures = targetFeatures; 
    }

    const g = svg.append("g");
    
    g.selectAll("path").data(renderFeatures).enter().append("path")
        .attr("d", path)
        .attr("fill", d => {
            const code = String((config.scale === 'world') ? getIso(d) : (d.properties.code_insee || d.properties.code || ""));
            if (!targetFeatures.includes(d)) return "#f8f9fa"; 
            return dataMap?.has(code) ? colorScale(dataMap.get(code)) : "#e5e5e5";
        })
        .attr("stroke", d => targetFeatures.includes(d) ? "#ffffff" : "#f0f0f0")
        .attr("stroke-width", d => targetFeatures.includes(d) ? 0.5 : 0.2);

    if (config.labelType !== 'none') {
        const labelNodes = [];
        targetFeatures.forEach(d => {
            const centroid = path.centroid(d);
            if (isNaN(centroid[0])) return;
            
            const code = String((config.scale === 'world') ? getIso(d) : (d.properties.code_insee || d.properties.code || ""));
            const name = (config.scale === 'world') 
                ? (d.properties.name_fr || d.properties.name || d.properties.NAME || "") 
                : (d.properties.nom_officiel || d.properties.nom || d.properties.NOM || d.properties.libgeo || d.properties.LIBGEO || d.properties.nom_com || d.properties.nom_commune || d.properties.nom_dept || d.properties.nom_reg || d.properties.libelle || "");
            const val = dataMap?.has(code) ? frenchNumberFormat.format(dataMap.get(code)) : "";
            const textLen = (config.labelType === 'both') ? Math.max(name.length, val.length) : (config.labelType === 'name' ? name.length : val.length);
            
            if (textLen === 0) return;

            labelNodes.push({
                cx: centroid[0], cy: centroid[1], x: centroid[0], y: centroid[1],
                name, val, width: textLen * (lSize * pRatio), height: lSize * (config.labelType === 'both' ? 2.4 : 1.2)
            });
        });

        const simulation = d3.forceSimulation(labelNodes)
            .force("x", d3.forceX(d => d.cx).strength(pStrength)).force("y", d3.forceY(d => d.cy).strength(pStrength))
            .force("collide", forceRectCollide(pPadding)).stop();
        for (let i = 0; i < 200; ++i) simulation.tick();

        g.selectAll("text.label").data(labelNodes).enter().append("text")
            .attr("class", "label")
            .attr("x", d => d.x).attr("y", d => d.y).attr("text-anchor", "middle")
            .style("font-size", `${lSize}px`).style("font-family", "Marianne").style("font-weight", "700").style("fill", mainColor).style("text-shadow", "0 0 3px #fff")
            .each(function(d) {
                const el = d3.select(this);
                if (config.labelType !== 'value') el.append("tspan").attr("x", d.x).attr("dy", config.labelType === 'both' ? "-0.2em" : "0.3em").text(d.name);
                if (config.labelType !== 'name') el.append("tspan").attr("x", d.x).attr("dy", config.labelType === 'both' ? "1.1em" : "0.3em").text(d.val);
            });
    }
    
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
// 4. INTERFACE STUDIO (Modale + Contrôles Manuels + Sauvegarde Data)
// =====================================================================
async function insertCarte() {
    if (!geoReferential.loaded) await loadMapReferentials();
    
    const regToDeps = new Map();
    geoReferential.communes.forEach(r => {
        let reg = getSafeCol(r, 'REG'), dep = getSafeCol(r, 'DEP');
        if(reg && dep) {
            if(!regToDeps.has(reg)) regToDeps.set(reg, new Set());
            regToDeps.get(reg).add(dep);
        }
    });

    // VARIABLES D'ÉTAT : Nécessaires pour injecter les métadonnées lors de la validation
    let rawCsvData = [];
    let currentMapConfig = null;
    let currentMapData = null;

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 1150px; height: 85vh;">
            <div class="chart-modal-controls" style="flex: 0 0 350px;">
                <h3 style="margin-top:0; color:var(--theme-sun); font-size:1.2rem;"><span class="fr-icon-france-line"></span> Studio Cartographique</h3>
                <div class="fr-input-group"><label class="fr-label">Titre</label><input class="fr-input" type="text" id="map-title" value="Répartition statistique"></div>
                
                <div class="geo-selection">
                    <label class="fr-label" style="font-weight:700">Échelle</label>
                    <select class="fr-select fr-mb-1v" id="map-scale">
                        <option value="world">Monde (Projections thématiques)</option>
                        <option value="national">France métropolitaine</option>
                        <option value="region">Région (FR)</option>
                        <option value="departement">Département (FR)</option>
                        <option value="epci">EPCI (FR)</option>
                        <option value="commune">Commune (FR)</option>
                    </select>
                    <div id="cascade-menus" style="display:flex; flex-direction:column; gap:0.5rem; margin-top:0.5rem;"></div>
                </div>
                
                <hr style="border:none; border-top:1px solid var(--grey-900);">
                
                <div>
                    <label class="fr-label" style="font-weight:700">Données (.csv)</label>
                    <input type="file" id="map-csv-file" accept=".csv" style="display:none">
                    <button class="fr-btn fr-btn--sm fr-btn--secondary fr-icon-upload-line fr-btn--icon-left" onclick="document.getElementById('map-csv-file').click()" style="width:100%">Importer CSV</button>
                    <div id="csv-status" style="font-size:0.75rem; margin-top:0.5rem; color:#666;"></div>
                    <div id="calc-engine-ui" style="display:none; margin-top:1rem; background:var(--theme-bg); padding:1rem; border-radius:4px;">
                        <p style="font-size:0.8rem; font-weight:bold; color:var(--theme-sun); margin-bottom:0.5rem;">📍 ID : <span id="label-insee-col" style="font-weight:normal; color:#161616;"></span></p>
                        <select id="calc-mode" class="fr-select fr-mb-1v"><option value="simple">Somme brute</option><option value="share">Part (%)</option><option value="ratio">Ratio (C1/C2)</option><option value="growth">Évo (C1/C2)</option></select>
                        <select id="calc-col1" class="fr-select fr-mb-1v"></select>
                        <select id="calc-col2" class="fr-select" style="display:none;"></select>
                    </div>
                </div>

                <div style="margin-top:auto; background:#fff; padding:1rem; border:1px solid var(--grey-900); border-radius:4px;">
                    <label class="fr-label" style="font-weight:700">Étiquettes</label>
                    <select class="fr-select fr-mb-1v" id="label-type"><option value="name">Nom</option><option value="value">Valeur</option><option value="both">Nom + Val</option><option value="none" selected>Aucune</option></select>
                    <div id="label-toolkit" style="display:none; margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--grey-900);">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <label style="font-size:0.8rem;">Taille (px)</label>
                            <input type="number" id="label-size" class="fr-input" style="width:70px; padding:0.2rem;" value="10" min="6" max="24">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                            <label style="font-size:0.8rem;">Aération</label>
                            <input type="range" id="phys-padding" min="0" max="15" value="4" style="width:100px;">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem;">
                            <label style="font-size:0.8rem;">Répulsion</label>
                            <input type="range" id="phys-strength" min="0.05" max="0.5" step="0.05" value="0.15" style="width:100px;">
                        </div>
                    </div>
                </div>

                <div style="margin-top:1rem;">
                    <button class="fr-btn fr-btn--icon-left fr-icon-refresh-line" id="btn-map-refresh" style="width:100%; justify-content:center;">Actualiser la vue</button>
                </div>

                <div style="margin-top:0.5rem; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-map-cancel" style="flex:1;">Annuler</button>
                    <button class="fr-btn" id="btn-map-insert" style="flex:1;">Insérer</button>
                </div>
            </div>

            <div style="flex:1; background:#fff; position:relative; overflow:hidden;">
                <div id="map-loader" style="display:none; position:absolute; inset:0; background:rgba(255,255,255,0.85); z-index:100; flex-direction:column; justify-content:center; align-items:center;">
                    <div style="width:40px; height:40px; border:4px solid var(--grey-900); border-top-color:var(--theme-sun); border-radius:50%; animation:map-spin 1s linear infinite;"></div>
                    <p style="margin-top:1rem; font-weight:700; color:var(--theme-sun);">Calcul de la carte en cours...</p>
                </div>
                
                <div id="map-empty-state" style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#f8f9fa; z-index:50;">
                    <span class="fr-icon-map-pin-2-line" style="font-size:3rem; color:var(--grey-900); margin-bottom:1rem;"></span>
                    <p style="color:var(--grey-900); font-weight:700; font-size:1.1rem; margin:0;">Aucune carte générée</p>
                    <p style="color:#666; font-size:0.9rem; text-align:center; max-width:300px; margin-top:0.5rem;">Paramétrez votre carte dans le panneau de gauche puis cliquez sur <b>Actualiser la vue</b>.</p>
                </div>
                
                <div id="map-preview-area" style="width:100%; height:100%; position:relative; z-index:10;"></div>
            </div>
        </div>
        <style>@keyframes map-spin { to { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(overlay);

    const scaleSelect = document.getElementById('map-scale');
    const cascade = document.getElementById('cascade-menus');

    const updateUI = () => {
        cascade.innerHTML = '';
        
        const preview = document.getElementById('map-preview-area');
        const emptyState = document.getElementById('map-empty-state');
        if (preview) preview.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';

        if (scaleSelect.value === 'world') {
            const sel = document.createElement('select'); sel.className = 'fr-select'; sel.id = 'sel-world-region';
            sel.innerHTML = '<option value="all">🌍 Monde entier</option><option value="auto">✨ Auto-cadrage</option>';
            const cats = [...new Set(geoReferential.worldRegions.map(r => r.category))];
            cats.forEach(cat => {
                const grp = document.createElement('optgroup'); grp.label = cat;
                geoReferential.worldRegions.filter(r => r.category === cat).forEach(r => {
                    const opt = document.createElement('option'); opt.value = r.code; opt.textContent = r.name; grp.appendChild(opt);
                });
                sel.appendChild(grp);
            });
            cascade.appendChild(sel);
            
        } else if (scaleSelect.value !== 'national') {
            const createSelect = (id, defaultText) => { let s = document.createElement('select'); s.className = 'fr-select'; s.id = id; s.innerHTML = `<option value="">${defaultText}</option>`; return s; };
            
            let selReg = createSelect('sel-region', '-- 1. Choisir la Région --');
            Object.entries(REGIONS_DICT).forEach(([c,n]) => { let o = document.createElement('option'); o.value=c; o.textContent=n; selReg.appendChild(o); });
            cascade.appendChild(selReg);
            
            let selDep, selEpci, selCom;
            if (['departement', 'epci', 'commune'].includes(scaleSelect.value)) { selDep = createSelect('sel-dept', '-- 2. Choisir le Département --'); selDep.disabled = true; cascade.appendChild(selDep); }
            if (scaleSelect.value === 'epci') { selEpci = createSelect('sel-epci', '-- 3. Choisir l\'EPCI --'); selEpci.disabled = true; cascade.appendChild(selEpci); }
            if (scaleSelect.value === 'commune') { selCom = createSelect('sel-commune', '-- 3. Choisir la Commune --'); selCom.disabled = true; cascade.appendChild(selCom); }

            selReg.onchange = () => {
                if (selDep) {
                    selDep.innerHTML = '<option value="">-- 2. Choisir le Département --</option>';
                    selDep.disabled = !selReg.value;
                    if (selReg.value && regToDeps.has(selReg.value)) {
                        Array.from(regToDeps.get(selReg.value)).sort().forEach(d => { let o = document.createElement('option'); o.value=d; o.textContent = `${d} - ${DEPARTEMENTS_DICT[d] || ''}`; selDep.appendChild(o); });
                    }
                    if (selEpci) { selEpci.innerHTML = '<option value="">-- 3. Choisir l\'EPCI --</option>'; selEpci.disabled = true; }
                    if (selCom) { selCom.innerHTML = '<option value="">-- 3. Choisir la Commune --</option>'; selCom.disabled = true; }
                }
            };

            if (selDep) {
                selDep.onchange = () => {
                    let depVal = selDep.value;
                    if (selEpci) {
                        selEpci.innerHTML = '<option value="">-- 3. Choisir l\'EPCI --</option>';
                        selEpci.disabled = !depVal;
                        if (depVal) {
                            const uniqueEpci = new Map();
                            geoReferential.epci.forEach(r => {
                                if (getSafeCol(r, 'DEP') === depVal || getSafeCol(r, 'DEP').includes(depVal)) {
                                    const code = getSafeCol(r, 'EPCI');
                                    const name = r['LIBEPCI'] || r['libepci'] || r['nom'] || ("EPCI " + code);
                                    if (code && !uniqueEpci.has(code)) uniqueEpci.set(code, name);
                                }
                            });
                            Array.from(uniqueEpci.entries()).sort((a,b) => a[1].localeCompare(b[1])).forEach(([code, name]) => { let o = document.createElement('option'); o.value = code; o.textContent = `${name} (${code})`; selEpci.appendChild(o); });
                        }
                    }
                    if (selCom) {
                        selCom.innerHTML = '<option value="">-- 3. Choisir la Commune --</option>';
                        selCom.disabled = !depVal;
                        if (depVal) {
                            const uniqueCom = new Map();
                            geoReferential.communes.forEach(r => {
                                if (getSafeCol(r, 'DEP') === depVal) {
                                    const code = getSafeCol(r, 'COM');
                                    const name = getSafeCol(r, 'LIBELLE') || getSafeCol(r, 'NCC') || ("COM " + code);
                                    if (code && !uniqueCom.has(code)) uniqueCom.set(code, name);
                                }
                            });
                            Array.from(uniqueCom.entries()).sort((a,b) => a[1].localeCompare(b[1])).forEach(([code, name]) => { let o = document.createElement('option'); o.value = code; o.textContent = `${name} (${code})`; selCom.appendChild(o); });
                        }
                    }
                };
            }
        }
    };

    // MOTEUR D'AFFICHAGE MANUEL
    async function renderPreview() {
        const loader = document.getElementById('map-loader');
        const emptyState = document.getElementById('map-empty-state');
        
        if (loader) loader.style.display = 'flex';
        if (emptyState) emptyState.style.display = 'none';

        setTimeout(async () => {
            let mapData = null;
            if (rawCsvData.length > 0) {
                const codeCol = Object.keys(rawCsvData[0])[0];
                mapData = computeValorAggregation(rawCsvData, scaleSelect.value, document.getElementById('calc-mode').value, codeCol, document.getElementById('calc-col1').value, document.getElementById('calc-col2').value);
            }
            
            const config = {
                scale: scaleSelect.value,
                worldRegion: document.getElementById('sel-world-region')?.value,
                region: document.getElementById('sel-region')?.value,
                dept: document.getElementById('sel-dept')?.value,
                epci: document.getElementById('sel-epci')?.value,
                commune: document.getElementById('sel-commune')?.value,
                title: document.getElementById('map-title').value,
                labelType: document.getElementById('label-type').value,
                labelSize: parseFloat(document.getElementById('label-size').value) || 10,
                physPadding: parseFloat(document.getElementById('phys-padding').value) || 4,
                physStrength: parseFloat(document.getElementById('phys-strength').value) || 0.15
            };

            // MISE A JOUR DES VARIABLES D'ETAT
            currentMapConfig = config;
            currentMapData = mapData;
            
            const success = await drawD3Map(document.getElementById('map-preview-area'), config, mapData);
            
            if (!success) {
                if (typeof showToast !== 'undefined') showToast("Sélection incomplète", "Veuillez préciser la zone géographique à cartographier.", "warning");
                if (emptyState) emptyState.style.display = 'flex'; 
            }
            
            if (loader) loader.style.display = 'none';
        }, 50);
    }

    scaleSelect.onchange = updateUI;
    document.getElementById('btn-map-refresh').onclick = renderPreview;
    
    document.getElementById('label-type').onchange = (e) => {
        document.getElementById('label-toolkit').style.display = e.target.value === 'none' ? 'none' : 'block';
    };
    
    document.getElementById('calc-mode').onchange = (e) => {
        document.getElementById('calc-col2').style.display = ['ratio', 'growth'].includes(e.target.value) ? 'block' : 'none';
    };

    document.getElementById('map-csv-file').onchange = (e) => {
        Papa.parse(e.target.files[0], { header: true, skipEmptyLines: true, complete: (res) => {
            rawCsvData = res.data;
            const headers = res.meta.fields;
            document.getElementById('csv-status').innerText = `✅ ${rawCsvData.length} lignes importées.`;
            document.getElementById('calc-engine-ui').style.display = 'block';
            document.getElementById('label-insee-col').innerText = headers[0];
            const s1 = document.getElementById('calc-col1'), s2 = document.getElementById('calc-col2');
            s1.innerHTML = ''; s2.innerHTML = '';
            headers.slice(1).forEach(h => { const o = document.createElement('option'); o.value = h; o.textContent = h; s1.appendChild(o.cloneNode(true)); s2.appendChild(o); });
        }});
    };

    document.getElementById('btn-map-cancel').onclick = () => overlay.remove();

    // =====================================================================
    // ROUTINE D'INSERTION AVEC MÉTADONNÉES EMBARQUÉES
    // =====================================================================
    // =====================================================================
    // ROUTINE D'INSERTION AVEC MÉTADONNÉES EMBARQUÉES (Taille Standardisée)
    // =====================================================================
    document.getElementById('btn-map-insert').onclick = () => {
        // 1. On vérifie qu'une carte a bien été configurée
        if (!currentMapConfig) {
            if (typeof showToast !== 'undefined') showToast("Action impossible", "Veuillez d'abord Actualiser la vue pour générer une carte.", "warning");
            return;
        }

        const loader = document.getElementById('map-loader');
        if (loader) {
            loader.querySelector('p').innerText = "Création de l'image haute définition...";
            loader.style.display = 'flex';
        }

        setTimeout(async () => {
            try {
                // 2. CRÉATION DU STUDIO FANTÔME (Taille fixe 850x550 pour garantir un rendu identique à la régénération)
                const hiddenDiv = document.createElement('div');
                hiddenDiv.style.position = 'absolute';
                hiddenDiv.style.left = '-9999px';
                hiddenDiv.style.width = '850px';
                hiddenDiv.style.height = '550px';
                hiddenDiv.style.background = '#fff';
                document.body.appendChild(hiddenDiv);

                // 3. Dessin de la carte formatée
                await drawD3Map(hiddenDiv, currentMapConfig, currentMapData);

                // Laisse 50ms au navigateur pour appliquer la physique anti-collision et les polices
                await new Promise(resolve => setTimeout(resolve, 50));

                // 4. Capture photographique de la carte normée
                const canvas = await html2canvas(hiddenDiv, {
                    scale: 2, // Haute définition
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                
                // Nettoyage des interfaces
                hiddenDiv.remove();
                overlay.remove();

                // 5. Création du Payload de sauvegarde des Métadonnées
                const mapConfigPayload = {
                    config: currentMapConfig,
                    data: currentMapData ? Array.from(currentMapData.entries()) : null
                };

                // 6. Injection dans l'attribut data-map-config (avec DOUBLES GUILLEMETS pour éviter les bugs d'apostrophe)
                const mapHTML = `
                    <div class="plume-map-container" style="margin: 2rem 0; text-align: center;" contenteditable="false" data-map-config="${encodeURIComponent(JSON.stringify(mapConfigPayload))}">
                        <img src="${imgData}" alt="Carte thématique" style="max-width: 100%; height: auto; border: 1px solid var(--grey-900); border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);" />
                    </div>
                    <p><br></p>
                `;

                if (typeof insertHTML === 'function') {
                    insertHTML(mapHTML);
                } else {
                    document.execCommand('insertHTML', false, mapHTML);
                }

                if (typeof showToast !== 'undefined') showToast("Succès", "La carte a été ajoutée au document.", "success");

            } catch (error) {
                console.error("Erreur de capture :", error);
                if (loader) loader.style.display = 'none';
                if (typeof showToast !== 'undefined') showToast("Erreur", "Impossible de générer l'image de la carte.", "error");
            }
        }, 100);
    };
    
    updateUI();
}

function forceRectCollide(padding) {
    let nodes;
    function force(alpha) {
        const quad = d3.quadtree().x(d => d.x).y(d => d.y).addAll(nodes);
        for (const d of nodes) {
            quad.visit((q, x1, y1, x2, y2) => {
                if (!q.length && q.data !== d) {
                    const d2 = q.data, w = (d.width + d2.width) / 2 + padding, h = (d.height + d2.height) / 2 + padding;
                    let x = d.x - d2.x, y = d.y - d2.y, absX = Math.abs(x), absY = Math.abs(y);
                    if (absX < w && absY < h) {
                        const lx = (w - absX) / w, ly = (h - absY) / h;
                        if (lx < ly) { x *= lx * alpha; d.x += x; d2.x -= x; }
                        else { y *= ly * alpha; d.y += y; d2.y -= y; }
                    }
                }
                return x1 > d.x + d.width/2 || x2 < d.x - d.width/2 || y1 > d.y + d.height/2 || y2 < d.y - d.height/2;
            });
        }
    }
    force.initialize = _ => nodes = _;
    return force;
}
// =====================================================================
// 5. RÉGÉNÉRATION AUTOMATIQUE (THÈMES & SAUVEGARDES)
// =====================================================================
window.refreshAllMaps = async function() {
    const mapContainers = document.querySelectorAll('.plume-map-container[data-map-config]');
    
    // S'il n'y a aucune carte dans le document, on s'arrête là
    if (mapContainers.length === 0) return;

    // 1. Création et affichage du Spinner de chargement global
    const globalLoader = document.createElement('div');
    globalLoader.id = 'plume-global-loader';
    globalLoader.style.cssText = `
        position: fixed; inset: 0; z-index: 100000;
        background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(2px);
        display: flex; flex-direction: column; justify-content: center; align-items: center;
    `;
    globalLoader.innerHTML = `
        <div style="width: 60px; height: 60px; border: 6px solid var(--grey-900); border-top-color: var(--theme-sun); border-radius: 50%; animation: map-spin 1s linear infinite;"></div>
        <h3 style="margin-top: 1.5rem; color: var(--theme-sun); font-family: 'Marianne', sans-serif;">Application du nouveau thème...</h3>
        <p style="color: #666; font-weight: 500;">Mise à jour des cartes en cours, veuillez patienter.</p>
        <style>@keyframes map-spin { to { transform: rotate(360deg); } }</style>
    `;
    document.body.appendChild(globalLoader);

    // 2. Pause vitale (50ms) pour forcer le navigateur à afficher le sablier AVANT de bloquer le processeur
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        // On s'assure que les fonds de carte sont chargés en mémoire
        if (!geoReferential.loaded) await loadMapReferentials();

        // 3. Boucle de régénération
        for (const container of mapContainers) {
            try {
                const configStr = container.getAttribute('data-map-config');
                if (!configStr) continue;

                const payload = JSON.parse(decodeURIComponent(configStr));
                const config = payload.config;
                const mapData = payload.data ? new Map(payload.data) : null;

                const hiddenDiv = document.createElement('div');
                hiddenDiv.style.position = 'absolute';
                hiddenDiv.style.left = '-9999px';
                hiddenDiv.style.width = '850px';
                hiddenDiv.style.height = '550px';
                hiddenDiv.style.background = '#fff';
                document.body.appendChild(hiddenDiv);

                const success = await drawD3Map(hiddenDiv, config, mapData);

                if (success) {
                    await new Promise(resolve => setTimeout(resolve, 50)); // Laisse le temps à la physique D3 de se stabiliser

                    const canvas = await html2canvas(hiddenDiv, {
                        scale: 2,
                        backgroundColor: "#ffffff",
                        useCORS: true,
                        logging: false
                    });

                    const img = container.querySelector('img');
                    if (img) {
                        img.src = canvas.toDataURL('image/png');
                    }
                }

                hiddenDiv.remove();

            } catch (e) {
                console.error("Erreur lors de la mise à jour d'une carte :", e);
            }
        }
    } finally {
        // 4. Quoi qu'il arrive (succès ou erreur), on détruit le spinner pour rendre la main à l'utilisateur
        if (document.getElementById('plume-global-loader')) {
            document.getElementById('plume-global-loader').remove();
        }
        if (typeof showToast !== 'undefined') {
            showToast("Mise à jour terminée", "Toutes les cartes ont été actualisées.", "success");
        }
    }
};

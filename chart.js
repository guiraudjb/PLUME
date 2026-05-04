/**
 * MODULE GRAPHIQUES - PLUME (Chart.js + PapaParse)
 */

function insertChart(type) {
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0);
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv, text/csv';

    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            skipEmptyLines: true,
            complete: function(results) {
                generateChartFromCSV(results.data, type, savedRange);
            },
            error: function(err) {
                showToast("Erreur de lecture", "Impossible de lire le fichier CSV.", "error");
            }
        });
    };
    
    input.click();
}

/**
 * Traite les données CSV, affiche une Modale WYSIWYG pour édition, puis insère l'image
 */
function generateChartFromCSV(data, type, savedRange) {
    if (!data || data.length < 2) {
        showToast("Données invalides", "Le fichier CSV semble vide ou incomplet.", "warning");
        return;
    }

    // 1. DÉTECTION ET TRANSPOSITION AUTOMATIQUE
    if (data.length === 2 && data[0].length > 2) {
        const transposed = [];
        for (let c = 0; c < data[0].length; c++) {
            transposed.push([data[0][c], data[1][c]]);
        }
        let firstVal = String(transposed[0][1]).replace(',', '.');
        if (!isNaN(parseFloat(firstVal))) {
            transposed.unshift(["Libellés", "Valeurs"]);
        }
        data = transposed;
    }

    // 2. PALETTE DE COULEURS ÉTENDUE
    const style = getComputedStyle(document.documentElement);
    const themeMain = style.getPropertyValue('--theme-main').trim() || '#6a6af4';
    const themeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';
    
    const dynamicPalette = [
        themeMain, themeSun,
        `color-mix(in srgb, ${themeMain}, white 25%)`,
        `color-mix(in srgb, ${themeMain}, white 55%)`,
        `color-mix(in srgb, ${themeMain}, white 80%)`,
        `color-mix(in srgb, ${themeSun}, black 20%)`,
        `color-mix(in srgb, ${themeSun}, black 45%)`,
        '#666666'
    ];

    // 3. PRÉPARATION DES DATASETS
    const headers = data[0];
    const numCols = headers.length;
    const datasets = [];

    for (let c = 1; c < numCols; c++) {
        const color = dynamicPalette[(c - 1) % dynamicPalette.length];
        datasets.push({
            label: headers[c] ? String(headers[c]).trim() : `Série ${c}`,
            data: [],
            // On ajoute 'polarArea' dans le tableau des conditions
            backgroundColor: (['pie', 'doughnut', 'polarArea'].includes(type)) 
                ? dynamicPalette 
                : (['line', 'radar'].includes(type) ? `color-mix(in srgb, ${color}, transparent 80%)` : color),
            borderColor: (['pie', 'doughnut', 'polarArea'].includes(type)) ? '#ffffff' : color,
            borderWidth: 2, 
            borderRadius: type === 'bar' ? 4 : 0, 
            fill: type === 'line' ? 'origin' : true, 
            tension: 0.4
        });
    }

    const labels = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row && row.length >= 2) {
            if (String(row[0]).trim() === '' && String(row[1]).trim() === '') continue;
            labels.push(String(row[0]).trim());
            for (let c = 1; c < numCols; c++) {
                let rawValue = String(row[c] || '0').trim().replace(',', '.');
                let parsedValue = parseFloat(rawValue);
                datasets[c - 1].data.push(isNaN(parsedValue) ? 0 : parsedValue);
            }
        }
    }

    // 4. CRÉATION DE L'INTERFACE WYSIWYG
    const defaultTitle = "Titre du graphique";
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    let seriesInputsHTML = '';
    datasets.forEach((ds, i) => {
        seriesInputsHTML += `
            <div style="margin-top: 1rem;">
                <label>Nom de la légende (Série ${i+1})</label>
                <input type="text" class="chart-edit-serie" data-index="${i}" value="${ds.label}">
            </div>
        `;
    });

    overlay.innerHTML = `
        <div class="chart-modal">
            <div class="chart-modal-controls">
                <h3 style="margin-top:0; color:var(--theme-sun); font-size:1.3rem;">Édition du graphique</h3>
                <div>
                    <label>Titre principal</label>
                    <input type="text" id="chart-edit-title" value="${defaultTitle}">
                </div>
                ${seriesInputsHTML}
                <div class="chart-modal-actions">
                    <button id="chart-btn-cancel" style="padding:0.5rem 1rem; border:1px solid var(--theme-sun); background:#fff; color:var(--theme-sun); cursor:pointer; border-radius:4px;">Annuler</button>
                    <button id="chart-btn-insert" style="padding:0.5rem 1rem; background:var(--theme-sun); color:#fff; border:none; cursor:pointer; border-radius:4px;">Insérer</button>
                </div>
            </div>
            <div class="chart-modal-preview">
                <canvas id="chart-preview-canvas"></canvas>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 5. INITIALISATION DE CHART.JS
    const ctx = document.getElementById('chart-preview-canvas');
    ctx.width = 640; ctx.height = 380;
    const actualType = type === 'horizontalBar' ? 'bar' : type;
    const isHorizontal = type === 'horizontalBar';
    const isCircular = ['pie', 'doughnut', 'radar', 'polarArea'].includes(actualType);

    const chart = new Chart(ctx, {
        type: actualType,
        data: { labels: labels, datasets: datasets },
        plugins: [ChartDataLabels],
        options: {
            indexAxis: isHorizontal ? 'y' : 'x',
            responsive: false, animation: false,
            layout: { padding: { top: 30, bottom: 10, left: 10, right: 10 } },
            plugins: {
                title: { display: true, text: defaultTitle, font: { size: 16, weight: 'bold', family: 'Marianne' }, padding: { bottom: 10 } },
                legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Marianne' } } },
                datalabels: {
                    display: 'auto', 
                    backgroundColor: isCircular ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: 3, padding: 2,
                    color: isCircular ? '#ffffff' : themeSun,
                    font: { weight: 'bold', family: 'Marianne', size: 11 },
                    anchor: isCircular ? 'center' : 'end',
                    align: isCircular ? 'center' : (isHorizontal ? 'right' : 'top'),
                    offset: 4,
                    formatter: (value) => (!value || isNaN(value)) ? '' : new Intl.NumberFormat('fr-FR').format(value)
                }
            },
            scales: isCircular ? {} : {
                y: { beginAtZero: true, grid: { color: isHorizontal ? 'transparent' : 'rgba(0, 0, 0, 0.05)' }, ticks: { font: { family: 'Marianne' }, callback: (v) => isHorizontal ? v : new Intl.NumberFormat('fr-FR').format(v) } },
                x: { grid: { color: isHorizontal ? 'rgba(0, 0, 0, 0.05)' : 'transparent' }, ticks: { font: { family: 'Marianne' }, callback: (v) => isHorizontal ? new Intl.NumberFormat('fr-FR').format(v) : v } }
            }
        }
    });
    
    // 6. WYSIWYG
    document.getElementById('chart-edit-title').addEventListener('input', function(e) {
        chart.options.plugins.title.text = e.target.value; chart.update();
    });

    document.querySelectorAll('.chart-edit-serie').forEach(input => {
        input.addEventListener('input', function(e) {
            const index = e.target.getAttribute('data-index');
            chart.data.datasets[index].label = e.target.value; chart.update();
        });
    });

    // 7. ACTIONS DES BOUTONS
    document.getElementById('chart-btn-cancel').addEventListener('click', () => {
        chart.destroy(); overlay.remove();
    });

    document.getElementById('chart-btn-insert').addEventListener('click', () => {
        const imgData = chart.toBase64Image();
        const finalDatasets = chart.data.datasets.map(ds => ({ label: ds.label, data: ds.data }));
        
        const chartConfig = {
            type: chart.config.type,
            title: chart.options.plugins.title.text,
            labels: chart.data.labels,
            datasets: finalDatasets
        };
        const safeConfig = encodeURIComponent(JSON.stringify(chartConfig));

        chart.destroy(); overlay.remove();

        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }

        const chartHTML = `
            <div class="chart-container" data-chart-config="${safeConfig}" style="display: flex; justify-content: center; margin: 2.5rem 0;" contenteditable="false">
                <img src="${imgData}" alt="Graphique de données" style="max-width: 100%; height: auto; border: 1px solid var(--grey-900); border-radius: 4px; padding: 1.2rem; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            </div>
            <p><br></p>
        `;
        insertHTML(chartHTML);
    });
}

/**
 * Scanne le document et rafraîchit les graphiques avec la palette actuelle
 */
function refreshAllCharts() {
    const chartContainers = document.querySelectorAll('.chart-container[data-chart-config]');
    if (chartContainers.length === 0) return;

    const style = getComputedStyle(document.documentElement);
    const themeMain = style.getPropertyValue('--theme-main').trim() || '#6a6af4';
    const themeSun = style.getPropertyValue('--theme-sun').trim() || '#000091';
    
    const dynamicPalette = [
        themeMain, themeSun,
        `color-mix(in srgb, ${themeMain}, white 25%)`,
        `color-mix(in srgb, ${themeMain}, white 55%)`,
        `color-mix(in srgb, ${themeMain}, white 80%)`,
        `color-mix(in srgb, ${themeSun}, black 20%)`,
        `color-mix(in srgb, ${themeSun}, black 45%)`,
        '#666666'
    ];

    chartContainers.forEach(container => {
        try {
            const rawConfig = container.getAttribute('data-chart-config');
            const config = JSON.parse(decodeURIComponent(rawConfig));
            
            const newDatasets = config.datasets.map((ds, index) => {
                const color = dynamicPalette[index % dynamicPalette.length];
                return {
                    label: ds.label, 
                    data: ds.data,
                    // On ajoute 'polarArea' ici aussi (attention à bien utiliser config.type)
                    backgroundColor: (['pie', 'doughnut', 'polarArea'].includes(config.type)) 
                        ? dynamicPalette 
                        : (['line', 'radar'].includes(config.type) ? `color-mix(in srgb, ${color}, transparent 80%)` : color),
                    borderColor: (['pie', 'doughnut', 'polarArea'].includes(config.type)) ? '#ffffff' : color,
                    borderWidth: 2, 
                    borderRadius: config.type === 'bar' ? 4 : 0, 
                    fill: config.type === 'line' ? 'origin' : true, 
                    tension: 0.4
                };
            });

            const canvas = document.createElement('canvas');
            canvas.width = 640; canvas.height = 380; canvas.style.display = 'none';
            document.body.appendChild(canvas);

            const actualType = config.type === 'horizontalBar' ? 'bar' : config.type;
            const isHorizontal = config.type === 'horizontalBar';
            const isCircular = ['pie', 'doughnut', 'radar', 'polarArea'].includes(actualType);

            const chart = new Chart(canvas, {
                type: actualType,
                data: { labels: config.labels, datasets: newDatasets },
                plugins: [ChartDataLabels],
                options: {
                    indexAxis: isHorizontal ? 'y' : 'x',
                    responsive: false, animation: false,
                    layout: { padding: { top: 30, bottom: 10, left: 10, right: 10 } },
                    plugins: {
                        title: { display: true, text: config.title, font: { size: 16, weight: 'bold', family: 'Marianne' }, padding: { bottom: 10 } },
                        legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 20, font: { family: 'Marianne' } } },
                        datalabels: {
                            display: 'auto', backgroundColor: isCircular ? 'transparent' : 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 3, padding: 2, color: isCircular ? '#ffffff' : themeSun,
                            font: { weight: 'bold', family: 'Marianne', size: 11 },
                            anchor: isCircular ? 'center' : 'end', align: isCircular ? 'center' : (isHorizontal ? 'right' : 'top'), offset: 4,
                            formatter: (v) => (!v || isNaN(v)) ? '' : new Intl.NumberFormat('fr-FR').format(v)
                        }
                    },
                    scales: isCircular ? {} : {
                        y: { beginAtZero: true, grid: { color: isHorizontal ? 'transparent' : 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Marianne' }, callback: (v) => isHorizontal ? v : new Intl.NumberFormat('fr-FR').format(v) } },
                        x: { grid: { color: isHorizontal ? 'rgba(0,0,0,0.05)' : 'transparent' }, ticks: { font: { family: 'Marianne' }, callback: (v) => isHorizontal ? new Intl.NumberFormat('fr-FR').format(v) : v } }
                    }
                }
            });

            const imgElement = container.querySelector('img');
            if (imgElement) imgElement.src = chart.toBase64Image();

            chart.destroy(); canvas.remove();

        } catch (e) {
            console.error("Impossible de rafraîchir le graphique", e);
        }
    });
}

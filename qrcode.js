/**
 * MODULE GÉNÉRATEUR DE QR CODES - PLUME
 * Interface de création, personnalisation et intégration de QR Codes.
 * Nécessite la librairie qr-code-styling.js
 */

// Variables d'état globales pour la modale
let currentQRLogo = null;
let currentQRInstance = null;

function insertQRCode() {
    // 1. Sauvegarde de la position du curseur
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    // 2. Création de la modale
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    overlay.id = 'qr-modal-overlay';
    
    overlay.innerHTML = `
        <style>
            .qr-sidebar { width: 380px; background: #fff; border-right: 1px solid var(--grey-900); padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 1rem; overflow-y: auto; overflow-x: hidden; flex-shrink: 0; }
            .qr-workspace { flex-grow: 1; display: flex; align-items: center; justify-content: center; background-color: #f6f6f6; background-image: radial-gradient(#d0d0d0 1px, transparent 1px); background-size: 24px 24px; }
            .qr-control-group { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; width: 100%; box-sizing: border-box; }
            .qr-row-group { display: flex; gap: 0.5rem; align-items: flex-end; width: 100%; }
            .qr-control-group .fr-input, .qr-control-group .fr-select { width: 100%; margin: 0; box-sizing: border-box; }
            
            .qr-sidebar details { background: var(--theme-bg); border: 1px solid var(--grey-900); border-radius: 4px; margin-bottom: 0.5rem; }
            .qr-sidebar summary { font-weight: 700; font-size: 0.95rem; padding: 0.75rem; cursor: pointer; color: var(--theme-sun); list-style: none; display: flex; justify-content: space-between; align-items: center; }
            .qr-sidebar summary::-webkit-details-marker { display: none; }
            .qr-sidebar summary::after { content: '▼'; font-size: 0.75em; transition: transform 0.3s ease; }
            .qr-sidebar details[open] summary::after { transform: rotate(-180deg); }
            .qr-sidebar details[open] summary { border-bottom: 1px solid var(--grey-900); }
            .qr-details-content { padding: 1rem; display: flex; flex-direction: column; }
            
            #qr-preview-container canvas { box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 8px; border: 1px solid #e5e5e5; }
        </style>

        <div class="chart-modal" style="width: 1100px; max-width: 95vw; height: 80vh; display: flex; overflow: hidden;">
            
            <!-- BARRE LATÉRALE DE CONTRÔLES -->
            <div class="qr-sidebar">
                <h3 style="margin:0 0 1rem 0; color:var(--theme-sun); font-size:1.1rem;">
                    <span class="fr-icon-qr-code-line"></span> Générateur de QR Code
                </h3>

                <div class="qr-control-group">
                    <label class="fr-label">Données / URL du QR Code</label>
                    <textarea id="qr-data" class="fr-input" rows="3" placeholder="https://www.gouvernement.fr...">https://www.gouvernement.fr</textarea>
                </div>

                <details open>
                    <summary>Apparence & Couleurs</summary>
                    <div class="qr-details-content">
                        <div class="qr-control-group">
                            <label class="fr-label" style="font-size: 0.85rem;">Style des points</label>
                            <select id="qr-dot-type" class="fr-select">
                                <option value="square">Carrés classiques</option>
                                <option value="rounded">Arrondis</option>
                                <option value="dots" selected>Points</option>
                                <option value="classy">Élégant</option>
                                <option value="extra-rounded">Gouttes</option>
                            </select>
                        </div>
                        
                        <div class="qr-control-group">
                            <label class="fr-label" style="font-size: 0.85rem;">Couleur du QR Code</label>
                            <select id="qr-color-mode" class="fr-select">
                                <option value="theme" selected>Couleur du Thème (Dynamique)</option>
                                <option value="black">Noir standard</option>
                                <option value="custom">Personnalisée...</option>
                            </select>
                            <div id="qr-custom-color-wrapper" style="display: none; margin-top: 0.5rem;">
                                <input type="color" id="qr-color-custom" value="#000091" style="width: 100%; height: 35px; border: none; cursor: pointer;">
                            </div>
                        </div>

                        <div class="qr-row-group" style="margin-top: 0.5rem;">
                            <div class="fr-checkbox-group fr-checkbox-group--sm">
                                <input type="checkbox" id="qr-bg-trans" checked>
                                <label class="fr-label" for="qr-bg-trans">Fond transparent</label>
                            </div>
                        </div>
                    </div>
                </details>

                <details open>
                    <summary>Incrustation de Logo</summary>
                    <div class="qr-details-content">
                        <div class="qr-control-group">
                            <label class="fr-label" style="font-size: 0.85rem;">Image (PNG/JPG)</label>
                            <input type="file" id="qr-logo-input" accept="image/png, image/jpeg, image/webp" style="display: none;">
                            <div class="qr-row-group">
                                <button class="fr-btn fr-btn--sm fr-btn--secondary" id="btn-qr-upload" style="flex: 1; justify-content: center;"><span class="fr-icon-upload-line fr-mr-1v"></span> Parcourir...</button>
                                <button class="fr-btn fr-btn--sm" id="btn-qr-clear-logo" style="display: none; background-color: #ffe8e5; color: #e1000f; border-color: #e1000f;" title="Retirer le logo"><span class="fr-icon-delete-bin-line"></span></button>
                            </div>
                        </div>

                        <div id="qr-logo-options" style="display: none; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                            <div class="qr-row-group">
                                <div style="flex: 1;">
                                    <label class="fr-label" style="font-size: 0.75rem;">Taille de l'image</label>
                                    <input type="range" id="qr-logo-size" min="0.1" max="0.5" step="0.05" value="0.3" style="width: 100%;">
                                </div>
                                <div style="flex: 1;">
                                    <label class="fr-label" style="font-size: 0.75rem;">Marge autour</label>
                                    <input type="number" id="qr-logo-margin" class="fr-input" value="2" min="0" max="10" style="padding: 0.25rem;">
                                </div>
                            </div>
                            <div class="fr-checkbox-group fr-checkbox-group--sm" style="margin-top: 0.5rem;">
                                <input type="checkbox" id="qr-hide-dots" checked>
                                <label class="fr-label" for="qr-hide-dots" style="font-size: 0.8rem;">Masquer les points sous l'image</label>
                            </div>
                        </div>
                    </div>
                </details>
                
                <details>
                    <summary>Options avancées</summary>
                    <div class="qr-details-content">
                        <div class="qr-control-group">
                            <label class="fr-label" style="font-size: 0.85rem;">Correction d'erreur (ECC)</label>
                            <select id="qr-ecc" class="fr-select">
                                <option value="L">Faible - L (7%)</option>
                                <option value="M">Moyenne - M (15%)</option>
                                <option value="Q">Élevée - Q (25%)</option>
                                <option value="H" selected>Maximale - H (30%)</option>
                            </select>
                            <p style="font-size: 0.7rem; color: #666; margin: 0.2rem 0 0 0;">Nécessite 'Maximale' si un logo est incrusté.</p>
                        </div>
                        <div class="qr-row-group">
                            <div style="flex: 1;">
                                <label class="fr-label" style="font-size: 0.8rem;">Forme œil (Ext.)</label>
                                <select id="qr-eye-sq" class="fr-select" style="padding: 0.25rem;">
                                    <option value="square">Carré</option>
                                    <option value="extra-rounded" selected>Arrondi</option>
                                    <option value="dot">Cercle</option>
                                </select>
                            </div>
                            <div style="flex: 1;">
                                <label class="fr-label" style="font-size: 0.8rem;">Forme œil (Int.)</label>
                                <select id="qr-eye-dot" class="fr-select" style="padding: 0.25rem;">
                                    <option value="square">Carré</option>
                                    <option value="dot" selected>Cercle</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </details>

                <!-- BOUTONS D'ACTION -->
                <div style="margin-top:auto; padding-top: 1rem; border-top: 1px solid var(--grey-900); display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-qr-cancel" style="flex:1; justify-content: center;">Annuler</button>
                    <button class="fr-btn" id="btn-qr-insert" style="flex:1; justify-content: center;">Insérer</button>
                </div>
            </div>

            <!-- ZONE DE PRÉVISUALISATION -->
            <div class="qr-workspace">
                <div id="qr-preview-container" style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center;">
                    <!-- Le QR Code sera injecté ici -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);

    // Initialisation
    // Initialisation avec le logo DSFR par défaut
    currentQRLogo = './libs/dsfr-v1.14.3/dist/favicon/apple-touch-icon.png';
    
    // On affiche directement les options de réglage du logo
    document.getElementById('qr-logo-options').style.display = 'flex';
    document.getElementById('btn-qr-clear-logo').style.display = 'flex';
    
    // On force la correction d'erreur à "H" (Maximale) indispensable avec un logo
    document.getElementById('qr-ecc').value = 'H';
    
    renderQRPreview();
    // --- CÂBLAGE DES ÉVÉNEMENTS DE L'INTERFACE ---

    // Récupération de tous les inputs pour le rafraîchissement temps réel
    const inputsToWatch = ['qr-data', 'qr-color-mode', 'qr-color-custom', 'qr-bg-trans', 'qr-dot-type', 'qr-ecc', 'qr-logo-size', 'qr-logo-margin', 'qr-hide-dots', 'qr-eye-sq', 'qr-eye-dot'];
    
    inputsToWatch.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // 'input' pour le temps réel sur les textes/sliders, 'change' pour les selects/checkbox
            el.addEventListener('input', renderQRPreview);
            el.addEventListener('change', renderQRPreview);
        }
    });

    // Affichage conditionnel du color picker personnalisé
    document.getElementById('qr-color-mode').addEventListener('change', (e) => {
        document.getElementById('qr-custom-color-wrapper').style.display = e.target.value === 'custom' ? 'block' : 'none';
    });

    // Gestion de l'upload du logo
    document.getElementById('btn-qr-upload').onclick = () => document.getElementById('qr-logo-input').click();
    
    document.getElementById('qr-logo-input').addEventListener('change', function(e) {
        if (!e.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (ev) => { 
            currentQRLogo = ev.target.result; 
            document.getElementById('qr-logo-options').style.display = 'flex';
            document.getElementById('btn-qr-clear-logo').style.display = 'flex';
            
            // Forcer l'ECC en mode 'H' pour garantir la lisibilité avec un logo
            document.getElementById('qr-ecc').value = 'H';
            
            renderQRPreview();
        };
        reader.readAsDataURL(e.target.files[0]);
        e.target.value = ""; // Réinitialise l'input
    });

    document.getElementById('btn-qr-clear-logo').onclick = () => {
        currentQRLogo = null;
        document.getElementById('qr-logo-options').style.display = 'none';
        document.getElementById('btn-qr-clear-logo').style.display = 'none';
        renderQRPreview();
    };

    // --- BOUTONS FINAUX ---
    document.getElementById('btn-qr-cancel').onclick = () => {
        overlay.remove();
    };

    document.getElementById('btn-qr-insert').onclick = () => {
        if (!currentQRInstance) return;

        // On récupère le canvas généré par la librairie
        const canvas = document.querySelector('#qr-preview-container canvas');
        if (!canvas) return;

        const imgData = canvas.toDataURL('image/png'); // Format haute qualité

        // Constitution du Payload des métadonnées
        const config = getQRConfig();
        const safeConfig = encodeURIComponent(JSON.stringify(config));

        const finalHTML = `
            <div class="plume-qrcode-container" data-qrcode-config="${safeConfig}" style="display: flex; justify-content: center; margin: 2rem 0;" contenteditable="false">
                <img src="${imgData}" alt="QR Code" style="max-width: 100%; width: 250px; height: 250px; object-fit: contain; border: 1px solid var(--grey-900); border-radius: 8px; background: ${config.bgTrans ? 'transparent' : '#ffffff'}; box-shadow: 0 4px 12px rgba(0,0,0,0.08);" />
            </div>
            <p><br></p>
        `;

        overlay.remove();

        // Restauration du curseur
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // Insertion dans l'éditeur
        if (typeof insertHTML === 'function') {
            insertHTML(finalHTML);
        } else {
            document.execCommand('insertHTML', false, finalHTML);
        }
    };
}

/**
 * Lit l'interface et retourne l'objet de configuration structuré
 */
function getQRConfig() {
    return {
        data: document.getElementById('qr-data').value || "https://www.gouvernement.fr",
        colorMode: document.getElementById('qr-color-mode').value,
        customColor: document.getElementById('qr-color-custom').value,
        bgTrans: document.getElementById('qr-bg-trans').checked,
        dotType: document.getElementById('qr-dot-type').value,
        ecc: document.getElementById('qr-ecc').value,
        eyeSq: document.getElementById('qr-eye-sq').value,
        eyeDot: document.getElementById('qr-eye-dot').value,
        logoData: currentQRLogo, // Base64 de l'image (peut être lourd)
        logoSize: parseFloat(document.getElementById('qr-logo-size').value),
        logoMargin: parseInt(document.getElementById('qr-logo-margin').value),
        hideDots: document.getElementById('qr-hide-dots').checked
    };
}

/**
 * Moteur de prévisualisation : génère le QR code via QRCodeStyling
 */
function renderQRPreview() {
    const container = document.getElementById('qr-preview-container');
    if (!container) return;

    container.innerHTML = ''; // Nettoyage de l'ancien
    const config = getQRConfig();

    // Résolution de la couleur finale
    let finalColor = "#000000"; // Noir par défaut
    if (config.colorMode === "custom") {
        finalColor = config.customColor;
    } else if (config.colorMode === "theme") {
        // Récupère la couleur dynamique du thème du document (--theme-sun)
        const rootStyle = getComputedStyle(document.documentElement);
        const themeColor = rootStyle.getPropertyValue('--theme-sun').trim();
        finalColor = themeColor || "#000091"; // Fallback sur Bleu France
    }

    // Options pour la librairie
    const qrOptions = {
        width: 350, // Haute résolution pour la génération (export)
        height: 350,
        type: "canvas", // Force l'utilisation d'un canvas pour l'export toDataURL()
        data: config.data,
        qrOptions: { 
            errorCorrectionLevel: config.ecc 
        },
        backgroundOptions: { 
            color: config.bgTrans ? "transparent" : "#ffffff"
        },
        dotsOptions: {
            type: config.dotType,
            color: finalColor
        },
        cornersSquareOptions: { 
            type: config.eyeSq,
            color: finalColor
        },
        cornersDotOptions: { 
            type: config.eyeDot,
            color: finalColor
        }
    };

    // Injection du logo si présent
    if (config.logoData) {
        qrOptions.image = config.logoData;
        qrOptions.imageOptions = { 
            imageSize: config.logoSize, 
            margin: config.logoMargin, 
            hideBackgroundDots: config.hideDots,
            crossOrigin: "anonymous"
        };
    }

    currentQRInstance = new QRCodeStyling(qrOptions);
    currentQRInstance.append(container);

    // Ajustement CSS pour que le canevas loge bien dans l'aperçu sans déborder
    const canvas = container.querySelector('canvas');
    if (canvas) {
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '300px';
    }
}

/**
 * Fonction globale à appeler lors du changement de thème (applyPalette)
 * Permet de redessiner tous les QR codes du document configurés en mode "Thème"
 */
function refreshAllQRCodes() {
    const qrContainers = document.querySelectorAll('.plume-qrcode-container[data-qrcode-config]');
    if (qrContainers.length === 0) return;

    // Récupère le nouveau code couleur de l'État
    const rootStyle = getComputedStyle(document.documentElement);
    const themeSun = rootStyle.getPropertyValue('--theme-sun').trim() || '#000091';

    qrContainers.forEach(container => {
        try {
            const rawConfig = container.getAttribute('data-qrcode-config');
            const config = JSON.parse(decodeURIComponent(rawConfig));

            // Si le QR code n'est pas lié au thème, on ignore
            if (config.colorMode !== "theme") return;

            // Création d'un canevas fantôme pour générer la nouvelle image
            const qrOptions = {
                width: 350, height: 350, type: "canvas",
                data: config.data,
                qrOptions: { errorCorrectionLevel: config.ecc },
                backgroundOptions: { color: config.bgTrans ? "transparent" : "#ffffff" },
                dotsOptions: { type: config.dotType, color: themeSun },
                cornersSquareOptions: { type: config.eyeSq, color: themeSun },
                cornersDotOptions: { type: config.eyeDot, color: themeSun }
            };

            if (config.logoData) {
                qrOptions.image = config.logoData;
                qrOptions.imageOptions = { 
                    imageSize: config.logoSize, margin: config.logoMargin, 
                    hideBackgroundDots: config.hideDots, crossOrigin: "anonymous"
                };
            }

            const tempInstance = new QRCodeStyling(qrOptions);
            const tempDiv = document.createElement('div');
            tempInstance.append(tempDiv);

            // La génération Canvas de QRCodeStyling est légèrement asynchrone (surtout avec des images)
            setTimeout(() => {
                const canvas = tempDiv.querySelector('canvas');
                if (canvas) {
                    const imgElement = container.querySelector('img');
                    if (imgElement) {
                        imgElement.src = canvas.toDataURL('image/png');
                    }
                }
            }, 100); // Laisse le temps au logo de se peindre

        } catch (e) {
            console.error("Impossible de rafraîchir le QR Code", e);
        }
    });
}

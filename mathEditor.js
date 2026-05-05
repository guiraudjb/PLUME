/**
 * MODULE ÉDITEUR MATHÉMATIQUE - PLUME
 * Utilise KaTeX pour le rendu LaTeX et html2canvas pour la conversion en image.
 * Intègre une barre d'outils DSFR pour la saisie assistée et la colorisation.
 */

function openMathEditor(existingFormula = '', targetImg = null) {
    const existingModal = document.getElementById('math-editor-modal');
    if (existingModal) existingModal.remove();

    const selection = window.getSelection();
    let savedRange = null;
    if (!targetImg && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (document.querySelector('.content-editable').contains(range.commonAncestorContainer)) {
            savedRange = range;
        }
    }

    const overlay = document.createElement('div');
    overlay.id = 'math-editor-modal';
    overlay.className = 'chart-modal-overlay';
    overlay.style.zIndex = '1000000';
    overlay.style.display = 'flex';

    overlay.innerHTML = `
        <div class="chart-modal" style="width: 800px; max-width: 95vw; background: #fff; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px;">
            
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.2rem;">
                    <span class="fr-icon-calculator-line"></span> Éditeur de formule (LaTeX)
                </h3>
                <button class="fr-btn fr-btn--close fr-btn--tertiary-no-outline" id="btn-math-close" title="Fermer">Fermer</button>
            </div>
            
            <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem;">
                
                <div>
                    <label class="fr-label" for="math-input" style="margin-bottom: 0.5rem; font-weight: bold;">Syntaxe de l'équation</label>
                    
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem; padding: 0.5rem; background: var(--grey-975); border: 1px solid var(--grey-900); border-radius: 4px;">
                        
                        <div style="display: flex; gap: 0.25rem; border-right: 1px solid #ccc; padding-right: 0.5rem; margin-right: 0.25rem;">
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline math-tool-btn" data-insert="\\color{var(THEME_COLOR)} " title="Couleur du thème actuel" style="color: var(--theme-sun);">
                                <span class="fr-icon-quill-pen-line" aria-hidden="true"></span> Thème
                            </button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline math-tool-btn" data-insert="\\color{#161616} " title="Noir" style="color: #161616;">
                                <span class="fr-icon-checkbox-circle-fill" aria-hidden="true"></span>
                            </button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline math-tool-btn" data-insert="\\color{#e1000f} " title="Rouge (Marianne)" style="color: #e1000f;">
                                <span class="fr-icon-checkbox-circle-fill" aria-hidden="true"></span>
                            </button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--tertiary-no-outline math-tool-btn" data-insert="\\color{#1f8d49} " title="Vert (Succès)" style="color: #1f8d49;">
                                <span class="fr-icon-checkbox-circle-fill" aria-hidden="true"></span>
                            </button>
                        </div>

                        <div style="display: flex; gap: 0.25rem;">
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\mathbf{}" title="Texte en gras"><b>G</b></button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\textit{}" title="Texte en italique"><i>I</i></button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\frac{num}{den}" title="Fraction">a/b</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="x^{2}" title="Exposant">x²</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="x_{i}" title="Indice">x_i</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\sqrt{x}" title="Racine carrée">√x</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\sum_{i=1}^{n}" title="Somme">∑</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\int_{a}^{b}" title="Intégrale">∫</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\approx " title="Environ égal">≈</button>
                            <button type="button" class="fr-btn fr-btn--sm fr-btn--secondary math-tool-btn" data-insert="\\neq " title="Différent">≠</button>
                        </div>
                    </div>

                    <textarea class="fr-input" id="math-input" rows="4" placeholder="Exemple : \\color{var(--theme-sun)} \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" style="font-family: monospace;">${existingFormula}</textarea>
                </div>
                
                <div>
                    <label class="fr-label" style="margin-bottom: 0.5rem; font-weight: bold;">Aperçu en temps réel</label>
                    <div id="math-preview-container" style="padding: 1.5rem; background: var(--grey-975); border: 1px solid var(--grey-900); min-height: 120px; display: flex; align-items: center; justify-content: center; overflow-x: auto; color: #161616;">
                        <div id="math-preview" style="padding: 1rem; display: inline-block; text-align: center;"></div>
                    </div>
                </div>
            </div>
            
            <div style="padding: 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 1rem;">
                <button class="fr-btn fr-btn--secondary" id="btn-math-cancel">Annuler</button>
                <button class="fr-btn" id="btn-math-insert">${targetImg ? 'Mettre à jour' : 'Insérer dans le document'}</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);

    const input = document.getElementById('math-input');
    const preview = document.getElementById('math-preview');
    const btnClose = document.getElementById('btn-math-close');
    const btnCancel = document.getElementById('btn-math-cancel');
    const btnInsert = document.getElementById('btn-math-insert');

      // --- GESTION DE LA BARRE D'OUTILS ---
    document.querySelectorAll('.math-tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let textToInsert = btn.getAttribute('data-insert');
           
            // DÉTECTION DU BOUTON THÈME (Même si le HTML contient des scories comme 'var()')
            if (textToInsert.includes('THEME_COLOR') || textToInsert.includes('var(')) {
                let finalColor = '#000091'; // Bleu France par défaut
               
                // On récupère la palette actuelle
                const currentPaletteId = document.getElementById('cfg-palette') ? document.getElementById('cfg-palette').value : null;
                if (typeof palettes !== 'undefined' && currentPaletteId && palettes[currentPaletteId]) {
                    finalColor = palettes[currentPaletteId].sun;
                }
               
                // FORCE BRUTE : On réécrit complètement la syntaxe de zéro
                // Ainsi, on est 100% sûr qu'il n'y a plus de "var()"
                textToInsert = "\\color{" + finalColor + "} ";
            }

            const startPos = input.selectionStart;
            const endPos = input.selectionEnd;
           
            // Insertion du texte à la position du curseur
            input.value = input.value.substring(0, startPos) + textToInsert + input.value.substring(endPos);
           
            // Replace le curseur juste après l'insertion
            input.focus();
            input.selectionStart = startPos + textToInsert.length;
            input.selectionEnd = startPos + textToInsert.length;
           
            // Met à jour l'aperçu
            updatePreview();
        });
    });
 

    // --- MOTEUR DE RENDU (KaTeX) ---
    const updatePreview = () => {
        const formula = input.value;
        if (!formula.trim()) {
            preview.innerHTML = '';
            return;
        }
        try {
            // displayMode: true pour un affichage centré type "bloc"
            katex.render(formula, preview, {
                throwOnError: false,
                displayMode: true 
            });
        } catch (e) {
            preview.innerHTML = `<span style="color: red; font-size: 0.9rem;">Erreur de syntaxe</span>`;
        }
    };

    const closeModal = () => { overlay.remove(); };
    btnClose.onclick = closeModal;
    btnCancel.onclick = closeModal;

    input.addEventListener('input', updatePreview);
    
    if (existingFormula) updatePreview();

    // --- GÉNÉRATION DE L'IMAGE ---
    btnInsert.onclick = async () => {
        const formula = input.value.trim();
        if (!formula) { closeModal(); return; }

        btnInsert.innerText = 'Génération...';
        btnInsert.disabled = true;

        try {
            // Récupération de la couleur du thème pour le marquage
            const currentPaletteId = document.getElementById('cfg-palette').value;
            const themeColor = palettes[currentPaletteId].sun;

            const canvas = await html2canvas(preview, { backgroundColor: null, scale: 3, logging: false });
            const imgData = canvas.toDataURL('image/png');

            let img = targetImg;
            if (!img) {
                img = document.createElement('img');
                img.className = 'plume-math';
                img.style.cursor = 'pointer';
                img.style.maxWidth = '100%';
                img.style.display = 'block';
                img.style.margin = '1rem auto';
               
                if (savedRange) {
                    selection.removeAllRanges();
                    selection.addRange(savedRange);
                    savedRange.insertNode(img);
                } else {
                    document.querySelector('.content-editable').appendChild(img);
                }
            }

            img.src = imgData;
            img.setAttribute('data-math-formula', formula);
            img.style.width = Math.round(canvas.width / 3) + 'px';

            // MARQUAGE DYNAMIQUE : Si la formule contient la couleur actuelle du thème, on la tague
            if (formula.includes(themeColor)) {
                img.setAttribute('data-math-theme', 'true');
            } else {
                img.removeAttribute('data-math-theme');
            }

            closeModal();
        } catch (err) {
            console.error(err);
            btnInsert.disabled = false;
        }
    };

    setTimeout(() => input.focus(), 100);
}


/**
* RÉGÉNÉRATION GLOBALE DES FORMULES (Appelé par app.js)
*/
async function refreshAllMaths() {
    const formulas = document.querySelectorAll('img.plume-math[data-math-theme="true"]');
    if (formulas.length === 0) return;

    const currentPaletteId = document.getElementById('cfg-palette').value;
    if (!palettes[currentPaletteId]) return;
    const newColor = palettes[currentPaletteId].sun;

    // 1. L'ASTUCE ANTI-BUG : Un conteneur physiquement à l'écran,
    // mais "enterré" sous le fond blanc de l'application.
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.top = '0';
    tempContainer.style.left = '0';
    tempContainer.style.zIndex = '-1000'; // Sous l'interface
    tempContainer.style.pointerEvents = 'none';
    document.body.appendChild(tempContainer);

    for (const img of formulas) {
        let formula = img.getAttribute('data-math-formula');
       
        // On remplace l'ancienne couleur (Insensible à la casse grâce au 'gi')
        formula = formula.replace(/\\color\{#[0-9a-fA-F]{3,8}\}/gi, `\\color{${newColor}}`);
       
        const renderDiv = document.createElement('div');
        renderDiv.style.padding = '1rem';
        renderDiv.style.display = 'inline-block';
        renderDiv.style.textAlign = 'center';
        renderDiv.style.color = '#161616';
       
        tempContainer.appendChild(renderDiv);
       
        try {
            katex.render(formula, renderDiv, { displayMode: true });
           
            // 2. On laisse 150ms au navigateur pour peindre les polices mathématiques
            await new Promise(resolve => setTimeout(resolve, 150));
           
            const canvas = await html2canvas(renderDiv, {
                backgroundColor: null,
                scale: 3,
                logging: false
            });
           
            const imgData = canvas.toDataURL('image/png');
           
            // 3. SÉCURITÉ : On ne remplace l'image QUE si la photo a fonctionné
            // (Une image vide en Base64 fait moins de 50 caractères)
            if (imgData && imgData.length > 50) {
                img.src = imgData;
                img.setAttribute('data-math-formula', formula);
                img.style.width = Math.round(canvas.width / 3) + 'px';
            } else {
                console.warn("La capture a échoué, l'image d'origine a été conservée.");
            }
           
        } catch (e) {
            console.error("Erreur de régénération math :", e);
        }
       
        renderDiv.remove();
    }
   
    tempContainer.remove();
}

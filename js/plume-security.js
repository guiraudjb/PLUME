// =====================================================================
// MODULE DE SÉCURITÉ : GESTION DU PRESSE-PAPIERS & DOMPURIFY
// =====================================================================

// 1. CONFIGURATION AVANCÉE DE DOMPURIFY (Les Hooks de Sécurité)
// 1. CONFIGURATION AVANCÉE DE DOMPURIFY (Les Hooks de Sécurité)
if (typeof DOMPurify !== 'undefined') {
    
    // On détache les anciens hooks au cas où le script est rechargé
    DOMPurify.removeAllHooks();

    // Hook appelé APRÈS que DOMPurify ait nettoyé les menaces graves (scripts, etc.)
    DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        
        // --- NOUVEAU : LE BOUCLIER D'IMMUNITÉ (Synchronisé avec app.js) ---
        let isProtected = false;
        if (node.tagName === 'IMG' || (node.classList && node.classList.contains('plume-protected'))) {
            isProtected = true;
        }
        if (node.hasAttribute('class')) {
            const hasProtectedClass = Array.from(node.classList).some(c => 
                c.startsWith('fr-') || c.startsWith('plume-') || c.startsWith('chart-')
            );
            if (hasProtectedClass) isProtected = true;
        }

        // A. NETTOYAGE DES CLASSES
        if (node.hasAttribute('class') && !isProtected) {
            const classes = node.getAttribute('class').split(' ');
            const safeClasses = classes.filter(c => c.startsWith('fr-') || c.startsWith('plume-') || c.startsWith('chart-'));
            
            if (safeClasses.length > 0) {
                node.setAttribute('class', safeClasses.join(' '));
            } else {
                node.removeAttribute('class');
            }
        }

        // B. NETTOYAGE DES STYLES INLINE
        if (node.hasAttribute('style')) {
            if (!isProtected) {
                // --- NOUVEAU : Liste Blanche Étendue pour la Restauration ---
                let safeStyles = [];
                const allowedProps = [
                    'display', 'text-align', 'vertical-align', 
                    'width', 'min-width', 'max-width', 'height', 
                    'flex', 'flex-basis', 'flex-grow', 'flex-shrink', 
                    'background-color','align-items', 'justify-content', 'margin'
                ];
                
                allowedProps.forEach(prop => {
                    const val = node.style.getPropertyValue(prop);
                    if (val) safeStyles.push(`${prop}: ${val}`);
                });

                if (safeStyles.length > 0) {
                    node.setAttribute('style', safeStyles.join('; '));
                } else {
                    node.removeAttribute('style'); 
                }
            }
        }

        // C. SÉCURITÉ DES LIENS (Anti-Phishing & Anti-TabNabbing)
        if (node.tagName === 'A' && node.hasAttribute('href')) {
            node.setAttribute('target', '_blank'); 
            node.setAttribute('rel', 'noopener noreferrer'); 
        }
    });
}
// 2. LE BOUCLIER ACTIF : INTERCEPTION DU COPIER-COLLER
function handleSecurePasteAndDrop(e) {
    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    // 1. On bloque l'injection toxique du navigateur
    e.preventDefault();
    e.stopPropagation();

    // 2. Extraction des données (Compatible Paste et Drop)
    const dataTransfer = e.clipboardData || e.dataTransfer || window.clipboardData;
    if (!dataTransfer) return;

    let htmlContent = dataTransfer.getData('text/html');
    let plainText = dataTransfer.getData('text/plain');
    
    // =====================================================================
    // ⚔️ MODULE TABLEUR : EXTRACTION ET APPEL DE LA MODALE UI
    // =====================================================================
    const isSpreadsheetPaste = (htmlContent && (htmlContent.includes('<table') || htmlContent.includes('urn:schemas-microsoft-com:office:excel'))) || 
                               (plainText && plainText.includes('\t') && plainText.includes('\n'));
    
    // On vérifie qu'on ne colle pas un tableau DANS un tableau existant
    const activeElement = document.activeElement;
    const inExistingTable = activeElement && activeElement.closest('table');

    if (isSpreadsheetPaste) {
        if (inExistingTable) {
            if (typeof showToast === 'function') showToast("Collage refusé", "Vous ne pouvez pas coller un tableau dans un autre tableau.", "warning");
            return; 
        }

        // 1. Sauvegarde du curseur pour l'insertion future
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) savedRange = selection.getRangeAt(0).cloneRange();

        // 2. Extraction des données brutes en Tableau JavaScript (2D)
        let rawData = [];
        
        if (htmlContent && htmlContent.includes('<table')) {
            // Lecture du HTML copié depuis Excel/Calc
            const parser = new DOMParser();
            const virtualDoc = parser.parseFromString(htmlContent, 'text/html');
            const table = virtualDoc.querySelector('table');
            
            if (table) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const rowData = [];
                    row.querySelectorAll('td, th').forEach(cell => {
                        // On extrait uniquement le texte pur de chaque cellule
                        rowData.push(cell.innerText.trim());
                    });
                    if (rowData.length > 0) rawData.push(rowData);
                });
            }
        } else if (plainText) {
            // Fallback si Excel a échoué (Texte tabulé)
            rawData = plainText.trim().split(/\r?\n/).map(row => row.split('\t'));
        }

        // 3. Appel de la modale PLUME pour laisser l'agent choisir
        if (rawData.length > 0 && typeof openTablePasteModal === 'function') {
            openTablePasteModal(rawData, savedRange);
            return; // On arrête l'exécution ici. La modale gérera l'insertion !
        }
    }

    // Cas spécifique : Traitement des images brutes collées (Print Screen)
    if (dataTransfer.files && dataTransfer.files.length > 0) {
        const file = dataTransfer.files[0];
        if (file.type.startsWith('image/')) {
            // Ici, vous pourriez appeler une fonction de conversion/compression Base64
            // ex: insertImageFromFile(file); 
            // Pour l'instant on stoppe pour éviter l'injection de blobs toxiques
            showToast("Information", "Veuillez utiliser l'outil d'insertion d'image pour les fichiers.", "info");
            return;
        }
    }

    // 3. Fallback Sémantique : Si aucun HTML n'est détecté, on formatte le texte brut
    if (!htmlContent && plainText) {
        // On convertit les sauts de ligne en paragraphes propres
        htmlContent = plainText.split(/\r?\n/)
            .filter(line => line.trim() !== '')
            .map(line => `<p>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
            .join('');
    }

    // 4. LA PURGE PAR DOMPURIFY
    if (htmlContent && typeof DOMPurify !== 'undefined') {
        const cleanHTML = DOMPurify.sanitize(htmlContent, {
            // Balises autorisées (Strict minimum pour une lettre)
            ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'img', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'div', 'span', 'figure', 'figcaption', 'col', 'colgroup'],
            // Attributs autorisés avant passage dans le Hook
            ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'title', 'target', 'rel', 'contenteditable', 'data-page'],
            // Autoriser le Base64 (VITAL POUR PLUME)
            ALLOW_DATA_URI: true,
            // Empêche DOMPurify d'encapsuler le résultat dans un <body>
            RETURN_DOM_FRAGMENT: false,
            RETURN_DOM: false
        });

        // 5. INSERTION CHIRURGICALE (Respecte le Ctrl+Z de l'agent)
        document.execCommand('insertHTML', false, cleanHTML);
        
        // 6. Mise à jour de la pagination (au cas où le texte collé fait déborder la page)
        requestAnimationFrame(() => {
            if (typeof drawPaginationGuides === 'function') drawPaginationGuides(editor);
            if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        });
    }
}

// 3. ATTACHE DES ÉCOUTEURS GLOBAUX
document.addEventListener('paste', handleSecurePasteAndDrop);
document.addEventListener('drop', handleSecurePasteAndDrop);
document.addEventListener('dragover', function(e) {
    if (e.target.closest('.content-editable')) {
        e.preventDefault(); // Nécessaire pour autoriser l'événement 'drop'
    }
});

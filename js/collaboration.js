/**
 * MODULE COLLABORATION & RÉVISION - PLUME (Version Sécurisée)
 * Gestion des commentaires persistants, du suivi des modifications (sessions)
 * et colorimétrie déterministe par utilisateur.
 */

// =====================================================================
// GESTION DE L'AUTEUR (LOCAL STORAGE & COULEURS)
// =====================================================================

document.addEventListener('DOMContentLoaded', () => {
    const authorInput = document.getElementById('cfg-author');
    if (authorInput) {
        // Chargement du pseudonyme sauvegardé
        const savedAuthor = localStorage.getItem('plume_author');
        if (savedAuthor) authorInput.value = savedAuthor;
        
        // Sauvegarde silencieuse à chaque modification
        authorInput.addEventListener('input', (e) => {
            localStorage.setItem('plume_author', e.target.value.trim());
        });
    }
});

// Algorithme de hachage pour attribuer une couleur unique à chaque pseudonyme
function getAuthorColor(authorName) {
    if (!authorName || authorName === "Anonyme") return { hex: "#666666", bg: "rgba(102, 102, 102, 0.1)" };
    
    let hash = 0;
    for (let i = 0; i < authorName.length; i++) {
        hash = authorName.charCodeAt(i) + ((hash << 5) - hash);
    }
    // On génère une teinte (0-360) avec une saturation et luminosité fixes pour la lisibilité
    const hue = Math.abs(hash % 360);
    return {
        hex: `hsl(${hue}, 75%, 40%)`,
        bg: `hsla(${hue}, 75%, 40%, 0.1)`
    };
}

// =====================================================================
// AUTO-ENCAPSULATION ET GESTION DES COMMENTAIRES
// =====================================================================

async function addComment() {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
        if (typeof showToast !== 'undefined') showToast("Sélection requise", "Veuillez surligner un passage du texte.", "warning");
        return;
    }

    const savedRange = selection.getRangeAt(0).cloneRange();
    
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(savedRange.cloneContents());
    const selectedHTML = tempDiv.innerHTML;

    const authorInput = document.getElementById('cfg-author');
    const author = (authorInput && authorInput.value.trim() !== '') ? authorInput.value : "Anonyme";

    // Modale de création
    const commentText = await plumeModal({
        title: "Nouveau commentaire",
        message: "Saisissez votre remarque pour le passage sélectionné :",
        type: "prompt",
        confirmText: "Commenter"
    });

    if (!commentText) return; 

    const commentId = 'cmt-' + Date.now().toString(36);
    const today = new Date().toLocaleDateString('fr-FR');
   
    // Encodage du texte pour éviter de casser les attributs HTML avec des guillemets
    const safeText = encodeURIComponent(commentText);

    // Injection directe des données dans la balise (Infaillible)
    const wrappedHTML = `<mark class="plume-comment" data-comment-id="${commentId}" data-author="${author}" data-date="${today}" data-text="${safeText}" title="Cliquer pour lire">${selectedHTML}</mark>`;
    
    selection.removeAllRanges();
    selection.addRange(savedRange);
    document.execCommand('insertHTML', false, wrappedHTML);

    selection.removeAllRanges();
    if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
}

document.addEventListener('click', function(e) {
    const mark = e.target.closest('mark.plume-comment');
    if (!mark) return;

    e.preventDefault();
    e.stopPropagation();

    // Lecture des données embarquées dans la balise
    const author = mark.getAttribute('data-author') || "Inconnu";
    const date = mark.getAttribute('data-date') || "";
    const text = decodeURIComponent(mark.getAttribute('data-text') || "Commentaire illisible.");

    // Création d'une modale large et sur-mesure pour la lecture
    const modalId = 'read-cmt-modal-' + Date.now();
    const modalHtml = `
        <div id="${modalId}" class="chart-modal-overlay" style="z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);">
            <div class="chart-modal" style="width: 750px; max-width: 95vw; background: #fff; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                
                <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                    <h3 style="margin:0; color:var(--theme-sun); font-size:1.2rem;">💬 Commentaire de ${author}</h3>
                </div>
                
                <div style="padding: 2rem; overflow-y: auto; max-height: 50vh;">
                    <span style="font-size: 0.9rem; font-weight: 700; color: #666; text-transform: uppercase;">Le ${date}</span>
                    <p style="margin-top: 1rem; font-size: 1.1rem; line-height: 1.6; color: #1e1e1e;">${text}</p>
                </div>
                
                <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center;">
                    <button class="fr-btn fr-btn--secondary" id="btn-cmt-close">Fermer</button>
                    <button class="fr-btn" id="btn-cmt-resolve" style="background-color: var(--theme-sun); color: #fff;">Résoudre et effacer</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById(modalId);

    const destroyModal = () => modalEl.remove();

    document.getElementById('btn-cmt-close').onclick = destroyModal;
    modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) destroyModal();
    });

    document.getElementById('btn-cmt-resolve').onclick = () => {
        // Libération du texte d'origine
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
       
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        destroyModal();
    };
});
// =====================================================================
// SUIVI DES MODIFICATIONS (SESSIONS ET COULEURS DYNAMIQUES)
// =====================================================================

let isRevisionMode = false;
let currentRevisionSessionId = null;

function toggleRevisionMode() {
    isRevisionMode = !isRevisionMode;
    const btn = document.getElementById('btn-revision-mode');
   
    if (isRevisionMode) {
        btn.classList.add('is-active');
        btn.innerText = "Suivi activé";
        currentRevisionSessionId = 'rev-' + Date.now().toString(36);
        if (typeof showToast !== 'undefined') showToast("Mode Révision", "Suivi activé.", "info");
    } else {
        btn.classList.remove('is-active');
        btn.innerText = "Suivi désactivé";
        currentRevisionSessionId = null;
        if (typeof showToast !== 'undefined') showToast("Mode Révision", "Suivi désactivé.", "info");
    }
}

function getRevisionGroupId() {
    return currentRevisionSessionId + '-' + Math.random().toString(36).substr(2, 5);
}

// Fonction pour appliquer le style personnalisé
function styleRevisionNode(node, authorName, isInsertion) {
    const colors = getAuthorColor(authorName);
    if (isInsertion) {
        node.style.color = colors.hex;
        node.style.textDecoration = "underline";
        node.style.textDecorationColor = colors.hex;
        node.style.textDecorationThickness = "2px";
        node.style.backgroundColor = colors.bg;
    } else {
        node.style.color = colors.hex;
        node.style.textDecoration = "line-through";
        node.style.textDecorationColor = colors.hex;
        node.style.textDecorationThickness = "2px";
        node.style.backgroundColor = colors.bg;
    }
}

document.addEventListener('beforeinput', function(e) {
    if (!isRevisionMode) return;

    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    if (['insertFromPaste', 'insertFromDrop', 'insertLineBreak', 'insertParagraph'].includes(e.inputType)) {
        e.preventDefault();
        if (typeof showToast !== 'undefined') showToast("Action bloquée", "Le collage ou les sauts de ligne complexes sont désactivés en mode révision.", "warning");
        return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const currentRange = selection.getRangeAt(0);

    const authorInput = document.getElementById('cfg-author');
    const author = (authorInput && authorInput.value.trim() !== '') ? authorInput.value : "Anonyme";

    if (e.inputType === 'insertText') {
        e.preventDefault();
        
        const ins = document.createElement('ins');
        ins.className = 'plume-ins';
        ins.setAttribute('data-author', author);
        ins.setAttribute('data-rev-id', currentRevisionSessionId); 
        ins.textContent = e.data;
        styleRevisionNode(ins, author, true);

        if (!currentRange.collapsed) currentRange.deleteContents();
        currentRange.insertNode(ins);
       
        currentRange.setStartAfter(ins);
        currentRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(currentRange);
       
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
    }
   
    else if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
        const targetRanges = e.getTargetRanges();
        if (!targetRanges || targetRanges.length === 0) return;
       
        const staticRange = targetRanges[0];
        const targetRange = document.createRange();
        try {
            targetRange.setStart(staticRange.startContainer, staticRange.startOffset);
            targetRange.setEnd(staticRange.endContainer, staticRange.endOffset);
        } catch (err) { return; }

        let currentNode = targetRange.startContainer;
        if (currentNode.nodeType === 3) currentNode = currentNode.parentNode;
       
        if (currentNode && currentNode.closest('ins.plume-ins')) {
            const insNode = currentNode.closest('ins.plume-ins');
            if (insNode.getAttribute('data-author') === author) {
                return; // Laisse le navigateur supprimer nativement le texte fraîchement tapé par l'auteur
            }
        }
       
        if (currentNode && currentNode.closest('del.plume-del')) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
       
        if (!targetRange.collapsed && targetRange.toString().length > 0) {
            const textToMark = targetRange.toString();
            targetRange.deleteContents(); // Extraction sécurisée du texte pur
            
            const del = document.createElement('del');
            del.className = 'plume-del';
            del.setAttribute('data-author', author);
            del.setAttribute('data-rev-id', currentRevisionSessionId);
            del.textContent = textToMark;
            styleRevisionNode(del, author, false);
           
            targetRange.insertNode(del);
           
            if (e.inputType === 'deleteContentBackward') targetRange.setStartBefore(del);
            else targetRange.setStartAfter(del);
            
            targetRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(targetRange);
           
            if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        }
    }
});

// =====================================================================
// MODALE DE RÉSOLUTION À TROIS VOIES (ACCEPTER, REFUSER, IGNORER)
// =====================================================================

document.addEventListener('click', function(e) {
    if (!isRevisionMode) return;

    const clickedTag = e.target.closest('ins.plume-ins, del.plume-del');
    if (!clickedTag) return;

    e.preventDefault(); 
    e.stopPropagation();

    // On stocke le type exact de la balise cliquée ('ins' ou 'del')
    const tagName = clickedTag.tagName.toLowerCase();
    const isInsertion = tagName === 'ins';
    const author = clickedTag.getAttribute('data-author') || "Inconnu";
    const revId = clickedTag.getAttribute('data-rev-id');
    const actionText = isInsertion ? "ajouté" : "supprimé";
    const colors = getAuthorColor(author);
   
    // CORRECTION : On ne regroupe QUE les balises du même type (tagName) pour cette session
    let group = [];
    if (revId) {
        group = Array.from(document.querySelectorAll(`${tagName}[data-rev-id="${revId}"]`));
    } else {
        group = [clickedTag];
    }

    const fullText = group.map(el => el.textContent).join('');

    const modalId = 'rev-modal-' + Date.now();
    const modalHtml = `
        <div id="${modalId}" class="chart-modal-overlay" style="z-index: 100000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);">
            <div class="chart-modal" style="width: 750px; max-width: 95vw; background: #fff; border-radius: 8px; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
                
                <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                    <h3 style="margin:0; color:var(--theme-sun); font-size:1.2rem;">Révision de ${author}</h3>
                </div>
                
                <div style="padding: 2rem; overflow-y: auto; max-height: 50vh;">
                    <p style="margin-top: 0; font-size: 1.1rem;">Cet utilisateur a <strong>${actionText}</strong> ce texte :</p>
                    
                    <div style="padding: 1.5rem; background: ${colors.bg}; border-left: 5px solid ${colors.hex}; font-size: 1.2rem; line-height: 1.6; margin-bottom: 1.5rem; word-break: break-word; border-radius: 0 4px 4px 0;">
                        <strong style="color: ${colors.hex}; text-decoration: ${isInsertion ? 'none' : 'line-through'};">${fullText}</strong>
                    </div>
                    
                    <p style="margin-bottom: 0; font-weight: 700; color: #1e1e1e;">Que souhaitez-vous faire avec cette modification ?</p>
                </div>
                
                <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; flex-wrap: wrap; gap: 1rem; justify-content: space-between; align-items: center;">
                    <button class="fr-btn fr-btn--secondary" id="btn-rev-close">Ignorer (Fermer)</button>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button class="fr-btn" style="background-color: #ffe8e5; color: #e1000f; border: 1px solid #e1000f;" id="btn-rev-reject">Refuser la modification</button>
                        <button class="fr-btn" style="background-color: #1f8d49; color: #fff; border: 1px solid #1f8d49;" id="btn-rev-accept">Accepter la modification</button>
                    </div>
                </div>
                
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modalEl = document.getElementById(modalId);

    const destroyModal = () => modalEl.remove();

    // IGNORER
    document.getElementById('btn-rev-close').onclick = destroyModal;
    modalEl.addEventListener('click', (event) => {
        if (event.target === modalEl) destroyModal();
    });

    // ACCEPTER
    document.getElementById('btn-rev-accept').onclick = () => {
        group.forEach(revision => {
            if (isInsertion) {
                const parent = revision.parentNode;
                while (revision.firstChild) parent.insertBefore(revision.firstChild, revision);
                parent.removeChild(revision);
            } else {
                revision.remove();
            }
        });
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        destroyModal();
    };

    // REFUSER
    document.getElementById('btn-rev-reject').onclick = () => {
        group.forEach(revision => {
            if (isInsertion) {
                revision.remove();
            } else {
                const parent = revision.parentNode;
                while (revision.firstChild) parent.insertBefore(revision.firstChild, revision);
                parent.removeChild(revision);
            }
        });
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        destroyModal();
    };
});

// =====================================================================
// VALIDATION ET NETTOYAGE GLOBAL
// =====================================================================

async function acceptAllRevisions() {
    const confirmed = await plumeModal({
        title: "Validation globale",
        message: "Êtes-vous sûr de vouloir <strong>accepter toutes les modifications</strong> et <strong>résoudre tous les commentaires</strong> ?<br>Cette action est irréversible.",
        confirmText: "Tout accepter",
        cancelText: "Annuler"
    });

    if (!confirmed) return;

    let hasChanges = false;

    document.querySelectorAll('ins.plume-ins').forEach(ins => {
        const parent = ins.parentNode;
        while (ins.firstChild) parent.insertBefore(ins.firstChild, ins);
        parent.removeChild(ins);
        hasChanges = true;
    });

    document.querySelectorAll('del.plume-del').forEach(del => {
        del.remove();
        hasChanges = true;
    });

    document.querySelectorAll('mark.plume-comment').forEach(mark => {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        hasChanges = true;
    });

    saveCommentsDB({});

    if (hasChanges) {
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        if (typeof showToast !== 'undefined') showToast("Nettoyage terminé", "Le document est prêt.", "success");
    }
}

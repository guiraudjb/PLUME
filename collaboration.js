// =====================================================================
// SYSTÈME DE COMMENTAIRES (PHASE 2)
// =====================================================================

async function addComment() {
    const selection = window.getSelection();
   
    // 1. On vérifie qu'il y a bien du texte sélectionné
    if (!selection.rangeCount || selection.isCollapsed) {
        if (typeof showToast !== 'undefined') {
            showToast("Sélection requise", "Veuillez surligner un passage du texte avant de commenter.", "warning");
        }
        return;
    }

    // 2. LA CORRECTION : On sauvegarde précieusement la sélection AVANT d'ouvrir la modale
    const savedRange = selection.getRangeAt(0).cloneRange();
   
    // On extrait le code HTML exact de ce qui a été sélectionné (pour garder les gras/italiques)
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(savedRange.cloneContents());
    const selectedHTML = tempDiv.innerHTML;

    // 3. On récupère le nom de l'auteur
    const authorInput = document.getElementById('cfg-author');
    const author = (authorInput && authorInput.value.trim() !== '') ? authorInput.value : "Anonyme";

    // 4. Ouverture de la modale (Ici, le navigateur "perd" le surlignage bleu visuellement)
    const commentText = await plumeModal({
        title: "Nouveau commentaire",
        message: "Saisissez votre remarque pour le passage sélectionné :",
        type: "prompt",
        confirmText: "Commenter"
    });

    if (!commentText) return; // L'utilisateur a annulé

    // 5. Création de la donnée du commentaire
    const commentId = 'cmt-' + Date.now().toString(36);
    const today = new Date().toLocaleDateString('fr-FR');
   
    plumeComments[commentId] = {
        author: author,
        date: today,
        text: commentText,
        resolved: false
    };

    // 6. RESTAURATION : On remet le curseur exactement là où il était
    selection.removeAllRanges();
    selection.addRange(savedRange);

    // 7. On emballe le texte sauvegardé dans notre balise jaune et on l'insère proprement
    const wrappedHTML = `<mark class="plume-comment" data-comment-id="${commentId}" title="Cliquer pour lire">${selectedHTML}</mark>`;
   
    // execCommand est la méthode la plus robuste pour remplacer une sélection sans casser le DOM
    document.execCommand('insertHTML', false, wrappedHTML);

    // On efface la sélection bleue pour finir
    selection.removeAllRanges();
   
    if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
}

// =====================================================================
// LECTURE ET RÉSOLUTION DES COMMENTAIRES
// =====================================================================
document.addEventListener('click', async function(e) {
    // Si on clique sur une zone jaune
    const mark = e.target.closest('mark.plume-comment');
    if (!mark) return;

    const commentId = mark.getAttribute('data-comment-id');
    const commentData = plumeComments[commentId];

    if (!commentData) {
        if (typeof showToast !== 'undefined') showToast("Erreur", "Le commentaire n'est plus en mémoire.", "error");
        return;
    }

    const resolve = await plumeModal({
        title: `💬 Commentaire de ${commentData.author}`,
        message: `<span style="font-size: 0.85rem; color: #666;">Le ${commentData.date}</span><br><br><strong>${commentData.text}</strong><br><br><hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">Voulez-vous marquer ce commentaire comme résolu ?`,
        confirmText: "Résoudre et effacer",
        cancelText: "Fermer"
    });

    if (resolve) {
        // Pour résoudre, on remplace la balise jaune par son contenu brut (le texte normal)
        const parent = mark.parentNode;
        while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
       
        // On nettoie la base de données
        delete plumeComments[commentId];
       
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
    }
});

let isRevisionMode = false;

function toggleRevisionMode() {
    isRevisionMode = !isRevisionMode;
    const btn = document.getElementById('btn-revision-mode');
   
    if (isRevisionMode) {
        btn.classList.add('is-active');
        btn.innerText = "Suivi activé";
        if (typeof showToast !== 'undefined') showToast("Mode Révision", "Le suivi des modifications est activé.", "info");
    } else {
        btn.classList.remove('is-active');
        btn.innerText = "Suivi désactivé";
        if (typeof showToast !== 'undefined') showToast("Mode Révision", "Le suivi des modifications est désactivé.", "info");
    }
}


async function acceptAllRevisions() {
    // 1. On demande confirmation (Action destructrice)
    const confirmed = await plumeModal({
        title: "Validation globale",
        message: "Êtes-vous sûr de vouloir <strong>accepter toutes les modifications</strong> et <strong>résoudre tous les commentaires</strong> du document ?<br>Cette action est irréversible.",
        confirmText: "Tout accepter et nettoyer",
        cancelText: "Annuler"
    });

    if (!confirmed) return;

    let hasChanges = false;

    // 2. Traitement des ajouts (On conserve le texte, on détruit la balise <ins>)
    document.querySelectorAll('ins.plume-ins').forEach(ins => {
        const parent = ins.parentNode;
        while (ins.firstChild) parent.insertBefore(ins.firstChild, ins);
        parent.removeChild(ins);
        hasChanges = true;
    });

    // 3. Traitement des suppressions (On détruit totalement la balise <del> et son contenu)
    document.querySelectorAll('del.plume-del').forEach(del => {
        del.remove();
        hasChanges = true;
    });

    // 4. Traitement des commentaires (On conserve le texte, on détruit la balise <mark>)
    document.querySelectorAll('mark.plume-comment').forEach(mark => {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
        hasChanges = true;
    });

    // 5. Purge de la base de données des commentaires
    plumeComments = {};

    // 6. Sauvegarde et notification
    if (hasChanges) {
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        if (typeof showToast !== 'undefined') showToast("Nettoyage terminé", "Le document est désormais figé et prêt.", "success");
    } else {
        if (typeof showToast !== 'undefined') showToast("Info", "Il n'y avait aucune révision à valider.", "info");
    }
}

// =====================================================================
// RESTAURATION CHIRURGICALE PAR SÉLECTION
// =====================================================================
function restoreSelectedRevisions() {
    const selection = window.getSelection();
   
    // Si l'utilisateur n'a rien surligné, on abandonne
    if (!selection.rangeCount || selection.isCollapsed) {
        if (typeof showToast !== 'undefined') showToast("Info", "Veuillez d'abord surligner les caractères à restaurer.", "warning");
        return;
    }
   
    // On récupère TOUTES les balises de révision du document
    const allRevisions = document.querySelectorAll('ins.plume-ins, del.plume-del');
    let changed = false;
   
    allRevisions.forEach(el => {
        // MAGIE : Le navigateur vérifie si cette lettre fait partie (même partiellement) de la sélection bleue de l'utilisateur !
        if (selection.containsNode(el, true)) {
            if (el.tagName.toLowerCase() === 'ins') {
                // Si c'était un ajout, on le retire (annulation)
                el.remove();
            } else {
                // Si c'était une suppression, on casse la balise rouge et on libère la lettre (restauration)
                const parent = el.parentNode;
                while (el.firstChild) parent.insertBefore(el.firstChild, el);
                parent.removeChild(el);
            }
            changed = true;
        }
    });
   
    if (changed) {
        selection.removeAllRanges(); // On efface le surlignage bleu
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        if (typeof showToast !== 'undefined') showToast("Restauré", "Le marquage a été retiré des caractères sélectionnés.", "success");
    }
}

// L'intercepteur global de frappe (PHASE 3 - CORRIGÉE)
document.addEventListener('beforeinput', function(e) {
    if (!isRevisionMode) return;

    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const currentRange = selection.getRangeAt(0);

    const authorInput = document.getElementById('cfg-author');
    const author = (authorInput && authorInput.value.trim() !== '') ? authorInput.value : "Anonyme";

    // ==========================================
    // CAS 1 : INSERTION DE TEXTE
    // ==========================================
    if (e.inputType === 'insertText') {
        e.preventDefault();

        const ins = document.createElement('ins');
        ins.className = 'plume-ins';
        ins.setAttribute('data-author', author);
        ins.textContent = e.data;

        if (!currentRange.collapsed) currentRange.deleteContents();

        currentRange.insertNode(ins);
       
        currentRange.setStartAfter(ins);
        currentRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(currentRange);
       
        if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
    }
   
    // ==========================================
    // CAS 2 : SUPPRESSION (Retour arrière ou Suppr)
    // ==========================================
    else if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
        const targetRanges = e.getTargetRanges();
        if (!targetRanges || targetRanges.length === 0) return;
       
        const staticRange = targetRanges[0];

        // 1. CONVERSION DU STATIC RANGE EN VRAI RANGE (La clé pour corriger l'erreur !)
        const targetRange = document.createRange();
        try {
            targetRange.setStart(staticRange.startContainer, staticRange.startOffset);
            targetRange.setEnd(staticRange.endContainer, staticRange.endOffset);
        } catch (err) {
            return; // Sécurité si les noeuds ont été altérés
        }

        // 2. SÉCURITÉ ANTI-NŒUDS MULTIPLES
        let currentNode = targetRange.startContainer;
        if (currentNode.nodeType === 3) {
            currentNode = currentNode.parentNode; // On remonte au parent si c'est un noeud texte
        }
       
        // Si on efface un texte vert (ajouté récemment), on laisse le navigateur le détruire
        if (currentNode && currentNode.closest && currentNode.closest('ins.plume-ins')) {
            return;
        }
       
        // Si on bute contre un texte DÉJÀ rouge (supprimé), on fait sauter le curseur par-dessus
        const parentDel = currentNode && currentNode.closest ? currentNode.closest('del.plume-del') : null;
        if (parentDel) {
            e.preventDefault();
            const jumpRange = document.createRange();
            if (e.inputType === 'deleteContentBackward') {
                jumpRange.setStartBefore(parentDel);
            } else {
                jumpRange.setStartAfter(parentDel);
            }
            jumpRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(jumpRange);
            return;
        }

        // 3. PROCÉDURE DE SUPPRESSION
        e.preventDefault();
       
        if (!targetRange.collapsed && targetRange.toString().length > 0) {
            const extracted = targetRange.extractContents();
           
            const del = document.createElement('del');
            del.className = 'plume-del';
            del.setAttribute('data-author', author);
            del.appendChild(extracted);
           
            targetRange.insertNode(del);
           
            // LA CORRECTION DU DÉCALAGE : Le curseur se place selon la touche pressée
            if (e.inputType === 'deleteContentBackward') {
                // Touche Retour Arrière : le curseur se place à gauche du texte barré
                targetRange.setStartBefore(del);
            } else {
                // Touche Suppr : le curseur saute par-dessus et se place à droite
                targetRange.setStartAfter(del);
            }
            targetRange.collapse(true);
           
            selection.removeAllRanges();
            selection.addRange(targetRange);
           
            if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
        }
    }
});

document.addEventListener('click', async function(e) {
    const clickedTag = e.target.closest('ins.plume-ins, del.plume-del');
    if (!clickedTag) return;

    const isInsertion = clickedTag.tagName.toLowerCase() === 'ins';
    const author = clickedTag.getAttribute('data-author') || "Inconnu";
    const actionText = isInsertion ? "ajouté" : "supprimé";
   
    // 1. REGROUPEMENT : On rassemble les lettres adjacentes
    let group = [clickedTag];
   
    // On cherche les morceaux à gauche
    let prev = clickedTag.previousSibling;
    while (prev) {
        if (prev.nodeType === 3 && prev.textContent === '') { prev = prev.previousSibling; continue; }
        if (prev.nodeType === 1 && prev.tagName === clickedTag.tagName && prev.getAttribute('data-author') === author) {
            group.unshift(prev);
            prev = prev.previousSibling;
        } else { break; }
    }
   
    // On cherche les morceaux à droite
    let next = clickedTag.nextSibling;
    while (next) {
        if (next.nodeType === 3 && next.textContent === '') { next = next.nextSibling; continue; }
        if (next.nodeType === 1 && next.tagName === clickedTag.tagName && next.getAttribute('data-author') === author) {
            group.push(next);
            next = next.nextSibling;
        } else { break; }
    }

    // 2. On reconstitue le mot ou la phrase complète pour l'affichage
    const fullText = group.map(el => el.textContent).join('');

    // On affiche une belle zone de prévisualisation dans la modale
    const decision = await plumeModal({
        title: `Révision de ${author}`,
        message: `Cet utilisateur a <strong>${actionText}</strong> ce texte :<br><br><div style="padding:0.5rem; background:var(--background-alt-grey); border-left:3px solid ${isInsertion ? '#1f8d49' : '#e1000f'}; margin-bottom:1rem; font-size:1.1rem;"><strong>${fullText}</strong></div>Que souhaitez-vous faire ?`,
        confirmText: "Accepter",
        cancelText: "Refuser"
    });

    if (decision === true) {
        // ACCEPTER : On applique la décision à TOUTES les lettres du groupe
        group.forEach(revision => {
            if (isInsertion) {
                const parent = revision.parentNode;
                while (revision.firstChild) parent.insertBefore(revision.firstChild, revision);
                parent.removeChild(revision);
            } else {
                revision.remove();
            }
        });
    }
    else if (decision === false) {
        // REFUSER : On applique la décision à TOUTES les lettres du groupe
        group.forEach(revision => {
            if (isInsertion) {
                revision.remove();
            } else {
                const parent = revision.parentNode;
                while (revision.firstChild) parent.insertBefore(revision.firstChild, revision);
                parent.removeChild(revision);
            }
        });
    }
   
    if (decision !== null && typeof saveDraftToLocal === 'function') saveDraftToLocal();
});

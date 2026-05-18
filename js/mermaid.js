/**
 * MODULE MERMAID COMPLIANT - PLUME
 * Architecture synchrone avec l'écosystème Plume : Image Base64, Métadonnées,
 * Capture préventive du curseur (Range), Double-clic et Thème dynamique.
 */

// =====================================================================
// 1. CONFIGURATION DU MOTEUR GRAPHIQUE
// =====================================================================
function getMermaidThemeColors() {
    const style = getComputedStyle(document.body);
    return {
        sun: style.getPropertyValue('--theme-sun').trim() || '#000091',
        bg: style.getPropertyValue('--theme-bg').trim() || '#f5f5fe',
        main: style.getPropertyValue('--theme-main').trim() || '#6a6af4'
    };
}

/**
 * Convertit une chaîne SVG Mermaid en DataURL PNG (Base64)
 * Multiplie la résolution par 2 pour une impression nette et force un fond opaque.
 */
/**
 * Convertit une chaîne SVG Mermaid en DataURL PNG (Base64)
 * Corrige le bug de troncature en lisant le viewBox natif.
 */
/**
 * Convertit une chaîne SVG Mermaid en DataURL PNG (Base64)
 * Réécriture chirurgicale de la balise <svg> pour garantir le rendu sur Canvas.
 */
const convertMermaidSvgToPng = (svgString) => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const themeBg = getMermaidThemeColors().bg;

        // 1. EXTRACTION ROBUSTE DES DIMENSIONS (Gère les coordonnées négatives)
        let trueWidth = 800; 
        let trueHeight = 600;
        
        const viewBoxMatch = svgString.match(/viewBox=["']\s*([-\d\.]+)\s+([-\d\.]+)\s+([-\d\.]+)\s+([-\d\.]+)["']/i);
        if (viewBoxMatch) {
            trueWidth = parseFloat(viewBoxMatch[3]); // 3ème valeur = largeur
            trueHeight = parseFloat(viewBoxMatch[4]); // 4ème valeur = hauteur
        }

        // 2. RÉÉCRITURE ABSOLUE DE LA BALISE <svg>
        let fixedSvgString = svgString.replace(/^<svg([^>]*)>/i, (fullMatch, inside) => {
            // On purge les vieux attributs de taille et les styles parasites
            let cleanInside = inside
                .replace(/\bwidth=["'][^"']+["']/gi, '')
                .replace(/\bheight=["'][^"']+["']/gi, '')
                .replace(/\bstyle=["'][^"']+["']/gi, ''); 
            
            // On injecte nos dimensions absolues
            return `<svg ${cleanInside} width="${trueWidth}px" height="${trueHeight}px">`;
        });

        // Encodage et chargement
        const encodedSvg = btoa(unescape(encodeURIComponent(fixedSvgString)));
        const dataUrl = 'data:image/svg+xml;base64,' + encodedSvg;

        img.onload = () => {
            const scale = 2; // Scale 2x pour la haute définition
            canvas.width = trueWidth * scale;
            canvas.height = trueHeight * scale;

            ctx.fillStyle = themeBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.scale(scale, scale);
            ctx.drawImage(img, 0, 0, trueWidth, trueHeight);

            resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
            console.error("Échec du rendu Canvas : L'image SVG est invalide ou corrompue.");
            reject(new Error("Génération PNG échouée"));
        };
        
        img.src = dataUrl;
    });
};

if (typeof mermaid !== 'undefined') {
    const theme = getMermaidThemeColors();
    mermaid.initialize({ 
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            primaryColor: theme.bg,
            primaryTextColor: '#161616', 
            primaryBorderColor: theme.main,
            lineColor: theme.sun,
            fontFamily: 'Marianne, Arial, sans-serif'
        }
    });
}

// =====================================================================
// 2. REFRESH & APPLY PALETTE (Changement de couleur à la volée)
// =====================================================================
window.refreshAllMermaidDiagrams = async function() {
    const containers = document.querySelectorAll('.plume-diagram[data-mermaid-code]');
    if (!containers.length || typeof mermaid === 'undefined') return;

    const theme = getMermaidThemeColors();

    mermaid.initialize({ 
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
            primaryColor: theme.bg,
            primaryTextColor: '#161616', 
            primaryBorderColor: theme.main,
            lineColor: theme.sun,
            fontFamily: 'Marianne, Arial, sans-serif'
        }
    });

    for (const container of containers) {
        try {
            const encodedCode = container.getAttribute('data-mermaid-code');
            if (!encodedCode) continue;
            
            const code = decodeURIComponent(encodedCode);
            const id = 'mermaid-refresh-' + Math.floor(Math.random() * 100000);
            
            const { svg } = await mermaid.render(id, code);
            
            // NOUVEAU : Conversion en PNG transparent et haute définition
            const pngBase64 = await convertMermaidSvgToPng(svg);
            
            const imgElement = container.querySelector('img');
            if (imgElement) {
                imgElement.src = pngBase64;
            }
        } catch (e) {
            console.error("Erreur applyPalette sur Mermaid", e);
            const orphanedNode = document.querySelector('[id^="dmermaid-refresh-"]');
            if (orphanedNode) orphanedNode.remove();
        }
    }
};


// =====================================================================
// 3. DICTIONNAIRE DES MODÈLES D'ACCÈS RAPIDE (SAMPLES ENTIÈREMENT MIS À JOUR)
// =====================================================================
const MERMAID_SAMPLES = {
    // --- Processus & Structure ---
    flowchart: "%%{init: {\"flowchart\": {\"htmlLabels\": false}} }%%\ngraph TD\n    A[Réception du dossier] --> B{Dossier complet ?}\n    B -- Oui --> C[Instruction]\n    B -- Non --> D[Demande de pièces complémentaires]\n    C --> E([Notification à l'usager])",
    
    sequence: "sequenceDiagram\n    participant U as Usager\n    participant A as Agent\n    participant S as Système\n    U->>A: Dépôt de demande\n    A->>S: Saisie des données\n    S-->>A: Validation technique\n    A-->>U: Remise du récépissé",
    
    mindmap: "mindmap\n  root((Action Publique))\n    Transition Écologique\n      Énergies renouvelables\n      Rénovation thermique\n    Numérique\n      Démarches en ligne\n      Inclusion numérique\n    Sécurité\n      Prévention\n      Intervention",

    state: "stateDiagram-v2\n    [*] --> Brouillon\n    Brouillon --> Relecture : Demande d'avis\n    Relecture --> Brouillon : Corrections requises\n    Relecture --> Valide : Avis favorable\n    Valide --> Publie : Mise en ligne\n    Publie --> [*]\n\n    state \"Validé\" as Valide\n    state \"Publié\" as Publie",

    // --- Ingénierie & Architecture ---
    architecture: "architecture-beta\n    group si(cloud)[Zone SI]\n    service parefeu(cloud)[Pare Feu]\n    service web(server)[Serveur Web] in si\n    service bdd(database)[Base Donnees] in si\n\n    parefeu:R -- L:web\n    web:R -- L:bdd",

    c4: "C4Context\n    title Cartographie du Système PLUME\n    Person(agent, \"Agent Public\", \"Utilise la plateforme pour rédiger\")\n    System(plume, \"Plateforme PLUME\", \"Éditeur de texte riche et de schémas\")\n    System_Ext(sso, \"AgentConnect\", \"Authentification de l'État\")\n    Rel(agent, plume, \"Rédige des documents\", \"HTTPS\")\n    Rel(plume, sso, \"Authentifie l'utilisateur via\", \"OIDC\")",

    block: "block-beta\n    columns 3\n    Frontend[\"Interface Utilisateur (Vue.js)\"]\n    Middleware[\"Passerelle API (Node.js)\"]\n    Backend[\"Base de données (PostgreSQL)\"]\n    Frontend --> Middleware\n    Middleware --> Backend",

    packet: "packet-beta\n    title En-tête IPv4\n    0-3: \"Version\"\n    4-7: \"IHL\"\n    8-15: \"TOS\"\n    16-31: \"Longueur Totale\"\n    32-47: \"Identification\"\n    48-50: \"Flags\"\n    51-63: \"Fragment Offset\"\n    64-71: \"TTL\"\n    72-79: \"Protocole\"\n    80-95: \"Header Checksum\"\n    96-127: \"IP Source\"\n    128-159: \"IP Destination\"",

    classDiagram: "classDiagram\n    class AgentPublic {\n        +String matricule\n        +String nom\n        +traiterDossier()\n    }\n    class Dossier {\n        +int numero\n        +String statut\n        +valider()\n    }\n    AgentPublic \"1\" -- \"*\" Dossier : instruit",

    er: "erDiagram\n    USAGER ||--o{ DEMANDE : soumet\n    USAGER {\n        string numero_secu\n        string nom\n        string email\n    }\n    DEMANDE ||--|{ DOCUMENT : contient\n    DEMANDE {\n        int numero_dossier\n        date date_depot\n        string statut\n    }",

    requirement: "requirementDiagram\n    requirement \"Hébergement Securisé SecNumCloud\" {\n      id: \"REQ-001\"\n      text: \"L'application doit être hébergée sur une infrastructure qualifiée SecNumCloud.\"\n      risk: high\n      verifymethod: inspection\n    }\n    element \"Serveur Dédié\" {\n      type: \"Infrastructure\"\n    }\n    \"Serveur Dédié\" - satisfies -> \"Hébergement Securisé SecNumCloud\"",

    // --- Stratégie & Gestion de Projet ---
    kanban: "kanban\n    A Faire\n      [Rédiger le cahier des charges]\n      [Valider le budget]\n    En Cours\n      [Développement PLUME]\n    Terminé\n      [POC Mermaid.js]\n      [Intégration QR Code]",

    gantt: "gantt\n    title Planning de Déploiement\n    dateFormat  YYYY-MM-DD\n    section Phase 1\n    Conception           :a1, 2026-01-01, 30d\n    Développement        :after a1, 20d\n    section Phase 2\n    Tests et Recette     :a2, 2026-03-01, 15d\n    Mise en production   :after a2, 5d",

    timeline: "timeline\n    title Historique de la réforme institutionnelle\n    2024 : Lancement de la concertation\n         : Rapport préliminaire\n    2025 : Vote de la loi\n         : Promulgation\n    2026 : Décrets d'application\n         : Mise en place du portail usager",

    wardley: "wardley-beta\n    title Software Platform Strategy\n    \n    anchor \"Customer\" [0.90, 0.95]\n    component \"Mobile App\" [0.80, 0.85]\n    component \"Web App\" [0.75, 0.80]\n    component \"API Gateway\" [0.70, 0.65]\n    component \"Auth Service\" [0.60, 0.55]\n    component \"Database\" [0.50, 0.45]\n    component \"Cloud Platform\" [0.30, 0.95]\n    \n    \"Customer\" -> \"Mobile App\"\n    \"Customer\" -> \"Web App\"\n    \"Mobile App\" -> \"API Gateway\"\n    \"Web App\" -> \"API Gateway\"\n    \"API Gateway\" -> \"Auth Service\"\n    \"API Gateway\" -> \"Database\"\n    \"Database\" -> \"Cloud Platform\"",

    journey: "journey\n    title Parcours usager : Demande de subvention\n    section Préparation\n      Recherche d'information: 5: Usager\n      Création du compte: 4: Usager, Système\n    section Dépôt\n      Formulaire en ligne: 3: Usager\n      Ajout des pièces justificatives: 2: Usager\n    section Instruction\n      Vérification du dossier: 4: Agent\n      Validation finale: 5: Directeur",

    // --- Analyse & Données ---
    treemap: "treemap-beta\n\"Budget de l'État (K€)\"\n    \"Transition Écologique\"\n        \"Rénovation\": 300\n        \"Mobilité\": 200\n    \"Santé Publique\"\n        \"Hôpitaux\": 350\n        \"Prévention\": 50",

    venn: "venn-beta\n  title \"Croisement des Compétences\"\n  set Dev[\"Développement\"]:50\n  set Sec[\"Sécurité\"]:50\n  set Res[\"Réseau\"]:50\n  union Dev,Sec[\"DevSec\"]:20\n  union Sec,Res[\"SecRes\"]:15\n  union Dev,Res[\"DevRes\"]:10\n  union Dev,Sec,Res[\"DevSecOps\"]:5",

    sankey: "sankey-beta\n\nBudget Etat,Sante Publique,400\nBudget Etat,Transition Ecologique,350\nSante Publique,Hopitaux,250\nSante Publique,Prevention,150\nTransition Ecologique,Renovation,200\nTransition Ecologique,Mobilite,150",


    xychart: "xychart-beta\n    title \"Évolution mensuelle des dossiers (2026)\"\n    x-axis [\"Jan\", \"Fév\", \"Mar\", \"Avr\", \"Mai\", \"Juin\"]\n    y-axis \"Volume traité\" 0 --> 500\n    bar [150, 200, 350, 400, 280, 450]\n    line [150, 200, 350, 400, 280, 450]",

    quadrant: "quadrantChart\n    title Matrice Eisenhower\n    x-axis Moins urgent --> Plus urgent\n    y-axis Moins important --> Plus important\n    quadrant-1 A faire immediatement\n    quadrant-2 A planifier\n    quadrant-3 A abandonner\n    quadrant-4 A deleguer\n    \"Urgence securite\": [0.9, 0.9]\n    \"Dossier de fond\": [0.3, 0.8]\n    \"Reunion mineure\": [0.2, 0.3]\n    \"Appel telephonique\": [0.8, 0.4]",

    risk_matrix: "quadrantChart\n    title Cartographie des Risques\n    x-axis Faible probabilite --> Forte probabilite\n    y-axis Faible impact --> Fort impact\n    quadrant-1 Risques critiques\n    quadrant-2 Risques majeurs\n    quadrant-3 Risques mineurs\n    quadrant-4 Risques moderes\n    \"Cyberattaque\": [0.2, 0.9]\n    \"Panne serveur\": [0.3, 0.8]\n    \"Retard fournisseur\": [0.8, 0.4]\n    \"Absence maladie\": [0.7, 0.2]",

    pie: "pie showData\n    title Répartition du budget alloué (en K€)\n    \"Subventions\" : 450\n    \"Fonctionnement\" : 250\n    \"Investissement\" : 200\n    \"Communication\" : 100",

    // --- Fichiers & Versions ---
    treeview: "treeView-beta\n    \"Projet_PLUME\"\n        \"frontend\"\n            \"css\"\n            \"js\"\n                \"mermaid.js\"\n                \"organigramme.js\"\n        \"backend\"\n            \"api\"\n        \"README.md\"",

    gitgraph: "gitGraph\n    commit id: \"v1\" tag: \"Lancement\"\n    branch developpement\n    checkout developpement\n    commit id: \"dev1\" msg: \"Nouvel outil de saisie\"\n    checkout main\n    merge developpement\n    commit id: \"v2\" tag: \"Validation finale\""
};


// =====================================================================
// 3. STUDIO DE CRÉATION, SAVE ET RESTORE
// =====================================================================
window.openMermaidStudio = function(existingCode = null, targetContainer = null) {
    // ÉTAPE CRITIQUE : Capturer immédiatement la position du curseur AVANT d'ouvrir la modale
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange(); // Clone parfait du curseur actif
    }

    let modal = document.getElementById('fr-modal-mermaid');

    if (!modal) {
        const modalHTML = `
        <dialog aria-labelledby="fr-modal-mermaid-title" id="fr-modal-mermaid" class="fr-modal" role="dialog">
            <div class="fr-container fr-container--fluid fr-container-md">
                <div class="fr-grid-row fr-grid-row--center">
                    <div class="fr-col-12 fr-col-md-10 fr-col-lg-10">
                        <div class="fr-modal__body">
                            <div class="fr-modal__header">
                                <button class="fr-btn--close fr-btn" aria-controls="fr-modal-mermaid">Fermer</button>
                            </div>
                            <div class="fr-modal__content">
                                <h1 id="fr-modal-mermaid-title" class="fr-modal__title">
                                    <span class="fr-icon-mind-map" aria-hidden="true"></span>
                                    Éditeur de Schéma Avancé
                                </h1>
                                <div class="fr-grid-row fr-grid-row--gutters">
                                    <div class="fr-col-12 fr-col-md-5">
                                        <div class="fr-select-group fr-mb-2v">
    <label class="fr-label fr-text--sm fr-text--bold" for="mermaid-sample-select">Modèles de départ :</label>
    <select class="fr-select" id="mermaid-sample-select" name="mermaid-sample-select">
        <option value="" selected disabled hidden>Choisissez un modèle...</option>
        
        <optgroup label="Processus & Structure">
            <option value="flowchart">Logigramme (Arbre de décision)</option>
            <option value="sequence">Diagramme de Séquence</option>
            <option value="mindmap">Carte mentale (Idées)</option>
            <option value="state">Cycle de vie (États d'un document)</option>
        </optgroup>
        
        <optgroup label="Ingénierie & Architecture">
            <option value="architecture">Topologie Déploiement (Architecture)</option>
            <option value="c4">Architecture Logicielle (C4 Model)</option>
            <option value="block">Architecture Logique (Block Diagram)</option>
            <option value="packet">Trame Réseau (Packet Diagram)</option>
            <option value="classDiagram">Diagramme de classes (Logiciel)</option>
            <option value="er">Modèle de données (Entité-Relation)</option>
            <option value="requirement">Exigences (Cahier des charges)</option>
        </optgroup>

        <optgroup label="Stratégie & Gestion de Projet">
            <option value="kanban">Tableau de suivi (Kanban)</option>
            <option value="gantt">Diagramme de Gantt (Planning)</option>
            <option value="timeline">Frise chronologique (Timeline)</option>
            <option value="wardley">Cartographie Stratégique (Wardley Map)</option>
            <option value="journey">Parcours Usager (Journey)</option>
        </optgroup>
        
        <optgroup label="Analyse & Données">
            <option value="treemap">Cartographie des volumes (Treemap)</option>
            <option value="venn">Intersections (Diagramme de Venn)</option>
            <option value="sankey">Flux proportionnels (Vrai Sankey)</option>
            <option value="xychart">Graphique Barres/Courbes (XY Chart)</option>
            <option value="quadrant">Matrice de priorisation (Eisenhower)</option>
            <option value="risk_matrix">Matrice d'évaluation des risques</option>
            <option value="pie">Graphique circulaire (Camembert)</option>
        </optgroup>

        <optgroup label="Fichiers & Code">
            <option value="treeview">Arborescence de fichiers (Treeview)</option>
            <option value="gitgraph">Historique de versions (Gitgraph)</option>
        </optgroup>
    </select>
</div>
                                        <div class="fr-input-group">
                                            <label class="fr-label" for="mermaid-input">Code du schéma</label>
                                            <textarea class="fr-input" id="mermaid-input" rows="12" style="font-family: monospace; resize: vertical; background-color: var(--grey-975);"></textarea>
                                        </div>
                                    </div>
                                    <div class="fr-col-12 fr-col-md-7">
                                        <label class="fr-label">Aperçu en direct</label>
                                        <div id="mermaid-preview" style="background: white; padding: 1rem; border: 1px solid var(--grey-900); min-height: 350px; display: flex; align-items: center; justify-content: center; overflow: auto;"></div>
                                        <p id="mermaid-error" class="fr-error-text" style="display: none; margin-top: 0.5rem;">Syntaxe incomplète...</p>
                                    </div>
                                </div>
                            </div>
                            <div class="fr-modal__footer">
                                <ul class="fr-btns-group fr-btns-group--right fr-btns-group--inline-reverse fr-btns-group--inline-lg fr-btns-group--icon-left">
                                    <li><button class="fr-btn fr-icon-check-line" id="btn-insert-mermaid">Valider</button></li>
                                    <li><button class="fr-btn fr-btn--secondary fr-icon-download-line" id="btn-download-mermaid" title="Télécharger l'image sur votre poste">Télécharger</button></li>
                                    <li><button class="fr-btn fr-btn--secondary fr-icon-close-line" aria-controls="fr-modal-mermaid">Annuler</button></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </dialog>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modal = document.getElementById('fr-modal-mermaid');
        setupMermaidModalEvents();
    }

    const mermaidInput = document.getElementById('mermaid-input');
    const btnInsert = document.getElementById('btn-insert-mermaid');

    // Sauvegarde du range capturé sur le bouton de validation pour le passer à l'écouteur d'événements
    btnInsert.savedRange = savedRange;

    if (existingCode) {
        mermaidInput.value = existingCode;
        btnInsert.textContent = "Mettre à jour le schéma";
        btnInsert.targetContainer = targetContainer; 
    } else {
        mermaidInput.value = MERMAID_SAMPLES.flowchart;
        btnInsert.textContent = "Insérer dans la page";
        btnInsert.targetContainer = null;
    }

    document.getElementById('mermaid-input').dispatchEvent(new Event('input'));

    setTimeout(() => {
        try { window.dsfr(modal).modal.disclose(); } catch (e) {
            modal.setAttribute('open', '');
            modal.classList.add('fr-modal--opened');
        }
    }, 50);
};

function setupMermaidModalEvents() {
    const mermaidInput = document.getElementById('mermaid-input');
    const mermaidPreview = document.getElementById('mermaid-preview');
    const mermaidError = document.getElementById('mermaid-error');
    const btnInsert = document.getElementById('btn-insert-mermaid');
    let renderTimeout;
    
    const closeButtons = document.querySelectorAll('#fr-modal-mermaid [aria-controls="fr-modal-mermaid"]');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Empêche le comportement par défaut
            const modal = document.getElementById('fr-modal-mermaid');
            try { 
                window.dsfr(modal).modal.conceal(); // API Officielle DSFR
            } catch (err) {
                // Fallback de sécurité
                modal.removeAttribute('open');
                modal.classList.remove('fr-modal--opened');
            }
        });
    });

    // --- LOGIQUE DU MENU DÉROULANT DES MODÈLES ---
    const sampleSelect = document.getElementById('mermaid-sample-select');
    if (sampleSelect) {
        sampleSelect.addEventListener('change', (e) => {
            const type = e.target.value;
            if (MERMAID_SAMPLES[type]) {
                mermaidInput.value = MERMAID_SAMPLES[type];
                // On déclenche l'événement "input" pour forcer le redessin de l'aperçu
                mermaidInput.dispatchEvent(new Event('input'));
                
                // Optionnel : remet le select à l'état neutre après chargement 
                // pour permettre de re-sélectionner le même modèle si on efface tout
                e.target.value = ""; 
            }
        });
    }
    
    async function updateMermaidPreview() {
        if (typeof mermaid === 'undefined') return;
        const code = mermaidInput.value.trim();
        if (!code) { mermaidPreview.innerHTML = ''; return; }

        try {
            const theme = getMermaidThemeColors();
            mermaid.initialize({
                startOnLoad: false,
                theme: 'base',
                themeVariables: { primaryColor: theme.bg, primaryTextColor: '#161616', primaryBorderColor: theme.main, lineColor: theme.sun, fontFamily: 'Marianne, Arial, sans-serif' }
            });

            const id = 'mermaid-render-' + Date.now();
            const { svg } = await mermaid.render(id, code);
            mermaidPreview.innerHTML = svg;
            mermaidError.style.display = 'none';
        } catch (err) {
            mermaidError.style.display = 'block';
            const orphanedNode = document.querySelector('[id^="dmermaid-render-"]');
            if (orphanedNode) orphanedNode.remove();
        }
    }

    mermaidInput.addEventListener('input', () => {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(updateMermaidPreview, 300);
    });

    btnInsert.addEventListener('click', async () => {
        const code = mermaidInput.value.trim();
        if (!code) return;

        try {
            const id = 'mermaid-final-' + Date.now();
            const { svg } = await mermaid.render(id, code);
            
            // NOUVEAU : Conversion finale en PNG avant insertion dans l'éditeur
            const base64Src = await convertMermaidSvgToPng(svg);

            if (btnInsert.targetContainer) {
                // Mode mise à jour : pas besoin de s'occuper du curseur, on remplace l'image existante
                const container = btnInsert.targetContainer;
                container.setAttribute('data-mermaid-code', encodeURIComponent(code));
                const img = container.querySelector('img');
                if (img) img.src = base64Src;
            } else {
                // Mode création initiale
                const container = document.createElement('div');
                container.className = 'plume-diagram fr-my-3w';
                container.contentEditable = "false";
                container.style.textAlign = 'center';
                container.setAttribute('data-mermaid-code', encodeURIComponent(code));

                const img = document.createElement('img');
                img.src = base64Src;
                img.alt = "Schéma conceptuel Mermaid";
                img.style.maxWidth = "100%";
                img.style.height = "auto";
                container.appendChild(img);

                const activePage = document.querySelector('.content-editable');
                
                // RESTAURATION DU CURSEUR COMMUNE AUX AUTRES MODULES
                if (btnInsert.savedRange) {
                    // On injecte le bloc directement là où le curseur était gelé
                    btnInsert.savedRange.insertNode(container);
                    
                    // On ajoute un paragraphe de confort après pour éviter d'être bloqué
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    container.after(p);

                    // NOUVEAU : On place physiquement le curseur dans ce nouveau paragraphe
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    
                    // CORRECTION : On récupère la sélection actuelle de la fenêtre
                    const currentSelection = window.getSelection(); 
                    currentSelection.removeAllRanges();
                    currentSelection.addRange(newRange);
                    
                } else if (activePage) {
                    // Fallback si aucun curseur n'était actif (ajoute à la fin)
                    activePage.appendChild(container);
                }
            }

            const modal = document.getElementById('fr-modal-mermaid');
            try { window.dsfr(modal).modal.conceal(); } catch (e) {
                modal.removeAttribute('open');
                modal.classList.remove('fr-modal--opened');
            }
        } catch (e) {
            alert("Erreur de génération finale.");
        }
    });
// ==========================================================
    // NOUVEAU : LOGIQUE DE TÉLÉCHARGEMENT (DOWNLOAD)
    // ==========================================================
    const btnDownload = document.getElementById('btn-download-mermaid');
    if (btnDownload) {
        btnDownload.addEventListener('click', async (e) => {
            e.preventDefault();
            const code = mermaidInput.value.trim();
            if (!code) return;

            // Ajout d'un état de chargement visuel
            const originalText = btnDownload.textContent;
            btnDownload.innerHTML = '<span class="fr-icon-refresh-line fr-mr-1v"></span> Génération...';
            btnDownload.disabled = true;

            try {
                // 1. Génération du SVG brut avec Mermaid
                const id = 'mermaid-download-' + Date.now();
                const { svg } = await mermaid.render(id, code);
                
                let fileUrl = '';
                let fileName = '';

                // 2. Conversion en PNG via votre fonction existante (si disponible)
                if (typeof convertMermaidSvgToPng === 'function') {
                    fileUrl = await convertMermaidSvgToPng(svg);
                    fileName = 'schema_plume.png';
                } else {
                    // Fallback de sécurité : téléchargement en format vectoriel (SVG)
                    fileUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
                    fileName = 'schema_plume.svg';
                }

                // 3. Déclenchement du téléchargement via le navigateur
                const a = document.createElement('a');
                a.href = fileUrl;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

            } catch (err) {
                console.error("Erreur de téléchargement", err);
                alert("Impossible de générer le fichier. Vérifiez que la syntaxe du schéma est complète.");
            } finally {
                // Restauration de l'état normal du bouton
                btnDownload.innerHTML = originalText;
                btnDownload.disabled = false;
            }
        });
    }

}



// =====================================================================
// 5. RESTORE VIA DOUBLE-CLIC DELEGATION
// =====================================================================
document.addEventListener('dblclick', (e) => {
    const container = e.target.closest('.plume-diagram[data-mermaid-code]');
    if (container) {
        e.preventDefault();
        const code = decodeURIComponent(container.getAttribute('data-mermaid-code'));
        window.openMermaidStudio(code, container);
    }
});

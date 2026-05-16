/**
 * MODULE EXPORT ODT INTÉGRAL & NATIF - PLUME
 * Support complet : Master Page (En-tête/Pied structurés en table, Marge verticale), 
 * Colonnes, Tableaux, Notes de bas de page, Liens, Listes, Styles DSFR (Marianne).
 */

// =====================================================================
// 1. UTILITAIRES DE CONFIGURATION
// =====================================================================

function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
        sun: style.getPropertyValue('--theme-sun').trim() || '#000091',
        bg: style.getPropertyValue('--theme-bg').trim() || '#f5f5fe',
        main: style.getPropertyValue('--theme-main').trim() || '#6a6af4'
    };
}

function pxToCm(px) { 
    return (px * 2.54 / 96).toFixed(2); 
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function getAlignmentStyle(node, baseStyle) {
    const align = node.style.textAlign;
    if (align === 'center') return baseStyle + "_Center";
    if (align === 'right') return baseStyle + "_Right";
    if (align === 'justify') return baseStyle + "_Justify";
    return baseStyle;
}

// =====================================================================
// 2. ANALYSEUR SÉMANTIQUE (HTML -> ODT)
// =====================================================================

function parseHtmlToFodt(node) {
    if (node.nodeType === 3) return escapeXml(node.textContent);
    if (node.nodeType !== 1) return '';

    const tag = node.tagName.toLowerCase();
    const cl = node.classList;

    // Ignorer les éléments techniques et la zone des notes (qui est gérée nativement)
    if (
        node.style.display === 'none' || 
        cl.contains('plume-pagination-overlay') || 
        cl.contains('fr-footnotes') || 
        cl.contains('fr-sr-only') || 
        cl.contains('sr-only')
    ) {
        return '';
    }

    // --- GRILLES ET COLONNES PLUME ---
    if (cl.contains('plume-grid')) {
        const flexContainer = node.firstElementChild;
        if (flexContainer) {
            const cols = Array.from(flexContainer.children);
            const colCount = cols.length;
            if (colCount > 0) {
                const tableName = "Grid_" + Math.random().toString(36).substring(2, 9);
                const colStyle = colCount === 3 ? "Grid_Col_3" : "Grid_Col_2"; 
                
                let xml = `<table:table table:name="${tableName}" table:style-name="Grid_Table">`;
                for(let i = 0; i < colCount; i++) {
                    xml += `<table:table-column table:style-name="${colStyle}"/>`;
                }
                xml += `<table:table-row>`;
                cols.forEach(col => {
                    let cellContent = Array.from(col.childNodes).map(parseHtmlToFodt).join('');
                    if (!cellContent.includes('<text:p') && !cellContent.includes('<text:h') && !cellContent.includes('<text:list')) {
                        cellContent = `<text:p text:style-name="Standard">${cellContent}</text:p>`;
                    }
                    if (!cellContent.trim()) cellContent = `<text:p text:style-name="Standard"/>`;
                    xml += `<table:table-cell table:style-name="Grid_Cell">${cellContent}</table:table-cell>`;
                });
                xml += `</table:table-row></table:table>`;
                return xml;
            }
        }
    }

    // --- TABLEAUX NATIFS ---
if (tag === 'table') {
        return `<table:table table:style-name="Standard_Table">${Array.from(node.children).map(parseHtmlToFodt).join('')}</table:table>`;
    }
    if (tag === 'thead' || tag === 'tbody') return Array.from(node.children).map(parseHtmlToFodt).join('');
    if (tag === 'tr') return `<table:table-row>${Array.from(node.children).map(parseHtmlToFodt).join('')}</table:table-row>`;
    
    if (tag === 'th' || tag === 'td') {
        const tr = node.parentNode;
        const section = tr.parentNode; 
        const isHeader = section.tagName.toLowerCase() === 'thead' || tag === 'th';
        
        const rowIndex = Array.from(section.children).indexOf(tr);
        const isEven = (rowIndex + 1) % 2 === 0;
        const isInsideTbody = section.tagName.toLowerCase() === 'tbody';

        // Ici on garde .childNodes car on veut le contenu (texte + spans) de la cellule
        let cellHtml = Array.from(node.childNodes).map(parseHtmlToFodt).join('').trim();
        
        const cellStyle = isHeader ? 'Header_Cell' : (isInsideTbody && isEven ? 'Zebra_Cell' : 'Standard_Cell');
        const textStyle = isHeader ? "Header_Cell_Text" : "Standard_Cell_Text";

        // Forcer un paragraphe même si la cellule est vide pour maintenir la structure XML
        if (!cellHtml || (!cellHtml.includes('<text:p') && !cellHtml.includes('<text:h'))) {
            cellHtml = `<text:p text:style-name="${textStyle}">${cellHtml}</text:p>`;
        }
        return `<table:table-cell table:style-name="${cellStyle}">${cellHtml}</table:table-cell>`;
    }
    // --- COMPOSANTS DSFR ---
    if (cl.contains('fr-summary')) {
        const titleNode = node.querySelector('.fr-summary__title') || node.querySelector('h2, h3, b, strong');
        const list = node.querySelector('ul, ol');
        
        // 1. Génération du titre avec marge basse collée
        let xml = `<text:p text:style-name="Sommaire_Titre">${escapeXml(titleNode ? titleNode.textContent : "Sommaire")}</text:p>`;
        
        // 2. Injection du bloc séparateur fantôme (garde le liseré, génère de l'espace)
        xml += `<text:p text:style-name="Sommaire_Espace"/>`;
        
        // 3. Transformation des listes en paragraphes tabulés
        if (list) {
            Array.from(list.children).forEach(li => {
                xml += `<text:p text:style-name="Sommaire_Lien"><text:tab/>${Array.from(li.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;
            });
        }
        
        // 4. Paragraphe de clôture optionnel pour finir proprement le bloc (si besoin d'espace bas)
        xml += `<text:p text:style-name="Sommaire_Espace"/>`;
        
        return xml;
    }
    
    if (cl.contains('fr-callout')) return `<text:p text:style-name="Exergue">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;
    
    
    // --- COMPOSANTS DSFR : CHIFFRE CLÉ (BLOC HORIZONTAL 2 COLONNES) ---
    if (cl.contains('plume-chiffre')) {
        function extractInlineFodt(el) {
            if (el.nodeType === 3) return escapeXml(el.textContent);
            if (el.nodeType !== 1) return '';
            const tag = el.tagName;
            if (tag === 'BR') return '\n';
            if (tag === 'B' || tag === 'STRONG') return `<text:span text:style-name="Bold">${Array.from(el.childNodes).map(extractInlineFodt).join('')}</text:span>`;
            if (tag === 'I' || tag === 'EM') return `<text:span text:style-name="Italic">${Array.from(el.childNodes).map(extractInlineFodt).join('')}</text:span>`;
            const isBlock = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(tag);
            let content = Array.from(el.childNodes).map(extractInlineFodt).join('');
            if (isBlock) content += '\n'; 
            return content;
        }

        const rawContent = extractInlineFodt(node);
        const parts = rawContent.split('\n').map(p => p.trim()).filter(p => p);

        let xml = `<table:table table:style-name="ChiffreCle_Table">`;
        xml += `<table:table-column table:style-name="ChiffreCle_Col_Number"/>`;
        xml += `<table:table-column table:style-name="ChiffreCle_Col_Legend"/>`;
        xml += `<table:table-row>`;
        
        // Colonne 1 : Le nombre avec la bordure liseré
        let numberContent = parts.length > 0 ? parts[0] : "";
        xml += `<table:table-cell table:style-name="ChiffreCle_Cell_Number">`;
        xml += `<text:p text:style-name="ChiffreCle_Nombre">${numberContent}</text:p>`;
        xml += `</table:table-cell>`;
        
        // Colonne 2 : Le texte (légende)
        let legendContent = parts.length > 1 ? parts.slice(1).join('<text:line-break/>') : "";
        xml += `<table:table-cell table:style-name="ChiffreCle_Cell_Legend">`;
        xml += `<text:p text:style-name="ChiffreCle_Legende">${legendContent}</text:p>`;
        xml += `</table:table-cell>`;
        
        xml += `</table:table-row></table:table>`;
        return xml;
    }
    
    if (cl.contains('plume-citation') || tag === 'blockquote') return `<text:p text:style-name="Citation">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;

    switch (tag) {
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            const level = tag.substring(1);
            return `<text:h text:style-name="${getAlignmentStyle(node, "Heading_" + level)}" text:outline-level="${level}">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:h>`;

        case 'p':
            if (node.closest('.fr-callout, .plume-citation, .plume-chiffre, .fr-summary, .fr-table, .plume-grid')) {
                return Array.from(node.childNodes).map(parseHtmlToFodt).join('') + '<text:line-break/>';
            }
            
            // Détection de la lettrine pour appliquer le style de paragraphe adéquat
            const baseStyle = node.classList.contains('plume-lettrine') ? "Standard_Lettrine" : "Standard";
            
            return `<text:p text:style-name="${getAlignmentStyle(node, baseStyle)}">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;
            
        case 'div': case 'section': 
            // Si c'est un conteneur de tableau (fr-table), on ne traite que les éléments enfants
            if (cl.contains('fr-table')) {
                return Array.from(node.children).map(parseHtmlToFodt).join('');
            }
            return Array.from(node.childNodes).map(parseHtmlToFodt).join('');

        case 'ul': return `<text:list text:style-name="DSFR_Bullet_List">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:list>`;
        case 'ol': return `<text:list text:style-name="DSFR_Numeric_List">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:list>`;
        case 'li': return `<text:list-item><text:p text:style-name="Standard">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p></text:list-item>`;

        case 'img':
            const src = node.getAttribute('src');
            if (src && src.startsWith('data:image') && src.length > 100) {
                // 1. Extraction dynamique du type MIME (ex: image/svg+xml, image/png) et des données
                const mimeMatch = src.match(/^data:(image\/[^;]+);base64,(.*)$/);
                
                if (mimeMatch) {
                    const mimeType = mimeMatch[1];
                    const b64Data = mimeMatch[2];
                    
                    // 2. Calcul des dimensions
                    let wCm = pxToCm(node.clientWidth || node.width || 600);
                    let hCm = pxToCm(node.clientHeight || node.height || 400);
                    
                    // Maintien du ratio si l'image dépasse la largeur de la page (16.5cm)
                    if (wCm > 16.5) { 
                        const ratio = 16.5 / wCm; 
                        wCm = 16.5; 
                        hCm = (hCm * ratio).toFixed(2); 
                    }
                    
                    // 3. Injection dans l'ODT avec l'attribut draw:mime-type indispensable pour le SVG
                    return `<text:p text:style-name="ImageCenter">
                                <draw:frame svg:width="${wCm}cm" svg:height="${hCm}cm" text:anchor-type="paragraph">
                                    <draw:image draw:mime-type="${mimeType}">
                                        <office:binary-data>${b64Data}</office:binary-data>
                                    </draw:image>
                                </draw:frame>
                            </text:p>`;
                }
            }
            return '';

        case 'a':
            const href = node.getAttribute('href');
            if (href) {
                return `<text:a xlink:type="simple" xlink:href="${escapeXml(href)}" text:style-name="Internet_Link">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:a>`;
            }
            return Array.from(node.childNodes).map(parseHtmlToFodt).join('');

        case 'sup':
            const footnoteLink = node.querySelector('.fr-footnote');
            if (footnoteLink) {
                const targetId = footnoteLink.getAttribute('href').substring(1);
                const targetLi = document.getElementById(targetId);
                let noteContent = "Note";
                if (targetLi) {
                    const clone = targetLi.cloneNode(true);
                    const backlink = clone.querySelector('.fr-footnotes__backlink');
                    if (backlink) backlink.remove();
                    noteContent = clone.textContent.trim();
                }
                const noteId = "ftn" + Math.floor(Math.random() * 100000);
                const citationLabel = footnoteLink.textContent.replace(/[\[\]]/g, '');
                return `<text:note text:id="${noteId}" text:note-class="footnote">
                            <text:note-citation text:label="${escapeXml(citationLabel)}">${escapeXml(citationLabel)}</text:note-citation>
                            <text:note-body><text:p text:style-name="Footnote">${escapeXml(noteContent)}</text:p></text:note-body>
                        </text:note>`;
            }
            return `<text:span text:style-name="Superscript">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;

        case 'b': case 'strong': return `<text:span text:style-name="Bold">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'i': case 'em': return `<text:span text:style-name="Italic">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'u': return `<text:span text:style-name="Underline">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 's': case 'del': case 'strike': return `<text:span text:style-name="Strikethrough">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'br': return `<text:line-break/>`;
        
        default: return Array.from(node.childNodes).map(parseHtmlToFodt).join('');
    }
}

// =====================================================================
// 3. GÉNÉRATION DU DOCUMENT FODT
// =====================================================================

function generateFODT() {
    const pages = document.querySelectorAll('.content-editable');
    if (!pages.length) return;
    const theme = getThemeColors();

    // 1. EXTRACTION DES MÉTADONNÉES
    const bureauInput = document.getElementById('cfg-bureau');
    const titreInput = document.getElementById('cfg-titre');
    const dateInput = document.getElementById('cfg-date');
    const footerInput = document.getElementById('cfg-footer');

    const docDirection = bureauInput && bureauInput.value ? bureauInput.value.toUpperCase() : 'DIRECTION / SERVICE';
    const texteMargeGauche = docDirection; // Texte affiché à la verticale dans la marge
    const docTitle = titreInput && titreInput.value ? titreInput.value.toUpperCase() : 'Titre du document';
    const docDate = dateInput && dateInput.value ? dateInput.value : '';
    const serviceEmail = footerInput && footerInput.value ? footerInput.value : '';

    // 2. CONVERSION DES PAGES
    let contentXml = '';
    pages.forEach((page, index) => {
        contentXml += parseHtmlToFodt(page);
        if (index < pages.length - 1) contentXml += `<text:p text:style-name="PageBreak"/>`;
    });

    // 3. ASSEMBLAGE DU GABARIT XML (FODT)
    const fodtTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" 
                 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" 
                 xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" 
                 xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" 
                 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" 
                 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" 
                 xmlns:xlink="http://www.w3.org/1999/xlink" 
                 xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" 
                 office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
  
  <office:font-face-decls>
    <style:font-face style:name="Marianne" svg:font-family="Marianne, Arial, sans-serif"/>
  </office:font-face-decls>

  <office:styles>
    <style:default-style style:family="paragraph">
        <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.32cm" fo:line-height="150%" fo:text-align="start"/>
        <style:text-properties style:font-name="Marianne" fo:font-family="Marianne" fo:font-size="11pt" fo:color="#161616"/>
    </style:default-style>

    <style:style style:name="Standard" style:display-name="Standard" style:family="paragraph" style:class="text"/>

    <style:style style:name="Header_Marianne" style:display-name="En-tête Marianne" style:family="paragraph">
        <style:paragraph-properties fo:margin-bottom="0.2cm"/>
        <style:text-properties fo:font-size="11pt" fo:font-weight="bold" fo:color="#161616" style:font-name="Marianne"/>
    </style:style>
    <style:style style:name="Header_Direction" style:display-name="En-tête Direction" style:family="paragraph">
        <style:paragraph-properties fo:margin-bottom="0.6cm"/>
        <style:text-properties fo:font-size="11pt" fo:font-weight="bold" fo:color="#161616" style:font-name="Marianne" fo:text-transform="uppercase"/>
    </style:style>
    <style:style style:name="Header_Meta_Left" style:family="paragraph">
        <style:paragraph-properties fo:text-align="start" fo:margin-bottom="0.2cm"/>
        <style:text-properties fo:font-size="10pt" fo:font-weight="bold" fo:color="${theme.sun}" style:font-name="Marianne" fo:text-transform="uppercase"/>
    </style:style>
    <style:style style:name="Header_Meta_Right" style:family="paragraph">
        <style:paragraph-properties fo:text-align="end" fo:margin-bottom="0.2cm"/>
        <style:text-properties fo:font-size="10pt" fo:font-weight="bold" fo:color="${theme.sun}" style:font-name="Marianne"/>
    </style:style>
    <style:style style:name="Footer_Meta_Left" style:family="paragraph">
        <style:paragraph-properties fo:text-align="start"/>
        <style:text-properties fo:font-size="9pt" fo:color="#666666" style:font-name="Marianne"/>
    </style:style>
    <style:style style:name="Footer_Meta_Right" style:family="paragraph">
        <style:paragraph-properties fo:text-align="end"/>
        <style:text-properties fo:font-size="9pt" fo:color="#666666" style:font-name="Marianne"/>
    </style:style>

    <style:style style:name="Heading_1" style:display-name="Titre 1 (DSFR)" style:family="paragraph" style:class="chapter">
        <style:paragraph-properties fo:margin-top="0.8cm" fo:margin-bottom="0.42cm" fo:keep-with-next="always"/>
        <style:text-properties fo:font-size="22pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>
    
    <style:style style:name="Heading_2" style:display-name="Titre 2 (DSFR)" style:family="paragraph" style:class="chapter">
        <style:paragraph-properties fo:margin-top="0.6cm" fo:margin-bottom="0.42cm" fo:keep-with-next="always"/>
        <style:text-properties fo:font-size="18pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>
    
    <style:style style:name="Heading_3" style:display-name="Titre 3 (DSFR)" style:family="paragraph" style:class="chapter">
        <style:paragraph-properties fo:margin-top="0.5cm" fo:margin-bottom="0.42cm" fo:keep-with-next="always"/>
        <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>
    
    <style:style style:name="Heading_4" style:display-name="Titre 4 (DSFR)" style:family="paragraph" style:class="chapter">
        <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.42cm" fo:keep-with-next="always"/>
        <style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>

    <style:style style:name="Exergue" style:display-name="Mise en Exergue" style:family="paragraph">
    <style:paragraph-properties fo:background-color="${theme.bg}" fo:padding="0.4cm" fo:border-left="4pt solid ${theme.main}" fo:margin-bottom="0.42cm"/>
</style:style>
    <style:style style:name="Citation" style:display-name="Citation" style:family="paragraph">
        <style:paragraph-properties fo:margin-left="1cm" fo:border-left="2pt solid #dddddd" fo:padding-left="0.3cm"/>
        <style:text-properties fo:font-style="italic" fo:color="#666666"/>
    </style:style>
    <style:style style:name="ChiffreCle_Nombre" style:display-name="Chiffre Clé (Nombre)" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="center" fo:margin="0cm"/>
        <style:text-properties fo:font-size="28pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>

    <style:style style:name="ChiffreCle_Legende" style:display-name="Chiffre Clé (Légende)" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="start" fo:margin="0cm"/>
        <style:text-properties fo:font-size="11pt" fo:font-weight="normal" fo:color="#161616"/>
    </style:style>
    
    <style:style style:name="Footnote" style:display-name="Note de bas de page" style:family="paragraph">
        <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.2cm" fo:line-height="120%"/>
        <style:text-properties fo:font-size="9pt" fo:color="#666666"/>
    </style:style>

    <style:style style:name="Internet_Link" style:family="text">
        <style:text-properties fo:color="${theme.sun}" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/>
    </style:style>
    
    <style:style style:name="Bullet_Char" style:family="text">
        <style:text-properties fo:color="${theme.sun}" fo:font-weight="bold" style:font-name="Marianne"/>
    </style:style>
    <style:style style:name="LettrinePlume" style:display-name="Lettrine Plume" style:family="text">
        <style:text-properties fo:color="${theme.sun}" fo:font-weight="bold" style:font-name="Marianne" fo:background-color="transparent"/>
    </style:style>

    <style:style style:name="Standard_Lettrine" style:display-name="Paragraphe Lettrine" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:background-color="transparent">
            <style:drop-cap style:lines="2" style:distance="0.15cm" style:style-name="LettrinePlume"/>
        </style:paragraph-properties>
    </style:style>
    <text:list-style style:name="DSFR_Bullet_List">
        <text:list-level-style-bullet text:level="1" text:style-name="Bullet_Char" text:bullet-char="•">
            <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
                <style:list-level-label-alignment text:label-alignment="left" fo:text-indent="-0.7cm" fo:margin-left="0.7cm"/>
            </style:list-level-properties>
        </text:list-level-style-bullet>
    </text:list-style>
    <text:list-style style:name="DSFR_Numeric_List">
        <text:list-level-style-number text:level="1" style:num-format="1">
            <style:list-level-properties text:list-level-position-and-space-mode="label-alignment">
                <style:list-level-label-alignment text:label-alignment="left" fo:text-indent="-0.7cm" fo:margin-left="0.7cm"/>
            </style:list-level-properties>
        </text:list-level-style-number>
    </text:list-style>
  
  
  </office:styles>

  <office:automatic-styles>
    <style:page-layout style:name="pm1">
        <style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" style:print-orientation="portrait" fo:margin-top="1.5cm" fo:margin-bottom="1.5cm" fo:margin-left="2cm" fo:margin-right="2cm"/>
        <style:header-style>
            <style:header-footer-properties fo:min-height="2.5cm" fo:margin-bottom="0.5cm" style:dynamic-spacing="true"/>
        </style:header-style>
        <style:footer-style>
            <style:header-footer-properties fo:min-height="1.5cm" fo:margin-top="0.5cm" style:dynamic-spacing="true"/>
        </style:footer-style>
    </style:page-layout>

    <style:style style:name="Standard_Center" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="center"/></style:style>
    <style:style style:name="Standard_Right" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="end"/></style:style>
    <style:style style:name="Standard_Justify" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="justify"/></style:style>
    <style:style style:name="ImageCenter" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.5cm"/></style:style>
    <style:style style:name="PageBreak" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:break-before="page"/></style:style>
    <style:style style:name="Heading_1_Center" style:family="paragraph" style:parent-style-name="Heading_1"><style:paragraph-properties fo:text-align="center"/></style:style>
    <style:style style:name="Heading_2_Center" style:family="paragraph" style:parent-style-name="Heading_2"><style:paragraph-properties fo:text-align="center"/></style:style>

    <style:style style:name="Sommaire_Titre" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0cm" fo:padding-left="0.4cm" fo:border-left="3pt solid ${theme.main}" fo:background-color="#f6f6f6"/>
        <style:text-properties fo:font-weight="bold" fo:font-size="12pt" fo:color="${theme.sun}"/>
    </style:style>
    
    <style:style style:name="Sommaire_Espace" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0cm" fo:padding-left="0.4cm" fo:border-left="3pt solid ${theme.main}" fo:background-color="#f6f6f6"/>
        <style:text-properties fo:font-size="6pt"/>
    </style:style>

    <style:style style:name="Sommaire_Lien" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.85cm" fo:padding-left="0.4cm" fo:border-left="3pt solid ${theme.main}" fo:background-color="#f6f6f6">
            <style:tab-stops>
                <style:tab-stop style:position="0.5cm"/>
            </style:tab-stops>
        </style:paragraph-properties>
        <style:text-properties fo:font-size="10pt" fo:color="${theme.sun}"/>
    </style:style>

    <style:style style:name="Layout_Table" style:family="table">
        <style:table-properties table:display="true" style:rel-width="100%" table:align="margins" fo:margin-top="0cm" fo:margin-bottom="0cm"/>
    </style:style>
    <style:style style:name="Layout_Col" style:family="table-column">
        <style:table-column-properties style:rel-column-width="32767*"/>
    </style:style>
    
    <style:style style:name="Header_Cell_Left" style:family="table-cell"><style:table-cell-properties fo:padding="0cm" fo:border-bottom="2pt solid ${theme.sun}"/></style:style>
    <style:style style:name="Header_Cell_Right" style:family="table-cell"><style:table-cell-properties fo:padding="0cm" fo:border-bottom="2pt solid ${theme.sun}"/></style:style>
    <style:style style:name="Footer_Cell" style:family="table-cell"><style:table-cell-properties fo:padding="0cm" fo:border-top="1pt solid #dddddd" fo:padding-top="0.2cm"/></style:style>

    <style:style style:name="Grid_Table" style:family="table">
        <style:table-properties table:display="true" style:rel-width="100%" fo:margin-top="0.4cm" fo:margin-bottom="0.4cm"/>
    </style:style>
    <style:style style:name="Grid_Col_2" style:family="table-column"><style:table-column-properties style:rel-column-width="32767*"/></style:style>
    <style:style style:name="Grid_Col_3" style:family="table-column"><style:table-column-properties style:rel-column-width="21845*"/></style:style>
    <style:style style:name="Grid_Cell" style:family="table-cell"><style:table-cell-properties fo:padding-right="0.3cm" fo:padding-left="0.3cm" fo:border="none"/></style:style>

    <style:style style:name="Standard_Table" style:family="table">
        <style:table-properties style:rel-width="100%" table:align="center" fo:margin-top="0.5cm" fo:margin-bottom="0.42cm"/>
    </style:style>
    
    <style:style style:name="Header_Cell" style:family="table-cell">
        <style:table-cell-properties fo:padding="0.25cm" fo:border="0.5pt solid #dddddd" fo:background-color="${theme.sun}"/>
    </style:style>
    <style:style style:name="Header_Cell_Text" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="center" fo:margin="0cm"/>
        <style:text-properties fo:color="#ffffff" fo:font-weight="bold"/>
    </style:style>

    <style:style style:name="Standard_Cell" style:family="table-cell">
        <style:table-cell-properties fo:padding="0.2cm" fo:border="0.5pt solid #dddddd"/>
    </style:style>
    <style:style style:name="Standard_Cell_Text" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="end" fo:margin="0cm"/>
    </style:style>

    <style:style style:name="Zebra_Cell" style:family="table-cell">
        <style:table-cell-properties fo:padding="0.2cm" fo:border="0.5pt solid #dddddd" fo:background-color="#f6f6f6"/>
    </style:style>
    <style:style style:name="Cadre_Marge" style:family="graphic">
        <style:graphic-properties fo:background-color="${theme.main}" fo:border="none" style:vertical-pos="top" style:vertical-rel="page" style:horizontal-pos="left" style:horizontal-rel="page"/>
    </style:style>
    <style:style style:name="Texte_Marge" style:family="paragraph">
        <style:paragraph-properties style:writing-mode="tb-rl" fo:text-align="center"/>
        <style:text-properties fo:color="#ffffff" fo:font-size="10pt" fo:font-weight="bold" style:font-name="Marianne"/>
    </style:style>
    
    
    <style:style style:name="ChiffreCle_Table" style:family="table">
        <style:table-properties style:rel-width="100%" fo:margin-top="0.4cm" fo:margin-bottom="0.4cm" table:align="margins"/>
    </style:style>
    
    <style:style style:name="ChiffreCle_Col_Number" style:family="table-column">
        <style:table-column-properties style:rel-column-width="19660*"/> </style:style>
    
    <style:style style:name="ChiffreCle_Col_Legend" style:family="table-column">
        <style:table-column-properties style:rel-column-width="45875*"/> </style:style>
    
    <style:style style:name="ChiffreCle_Cell_Number" style:family="table-cell">
        <style:table-cell-properties fo:background-color="${theme.bg}" fo:padding="0.4cm" fo:border="none" fo:border-left="4pt solid ${theme.main}" style:vertical-align="middle"/>
    </style:style>
    
    <style:style style:name="ChiffreCle_Cell_Legend" style:family="table-cell">
        <style:table-cell-properties fo:background-color="${theme.bg}" fo:padding="0.4cm" fo:border="none" style:vertical-align="middle"/>
    </style:style>

    <style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
    <style:style style:name="Italic" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
    <style:style style:name="Underline" style:family="text"><style:text-properties style:text-underline-style="solid" style:text-underline-width="auto"/></style:style>
    <style:style style:name="Strikethrough" style:family="text"><style:text-properties style:text-line-through-style="solid" style:text-line-through-type="single"/></style:style>
    <style:style style:name="Superscript" style:family="text"><style:text-properties style:text-position="super 58%"/></style:style>
    
    
    <style:style style:name="Standard_Lettrine_Justify" style:family="paragraph" style:parent-style-name="Standard_Lettrine">
        <style:paragraph-properties fo:text-align="justify"/>
    </style:style>
    <style:style style:name="Standard_Lettrine_Center" style:family="paragraph" style:parent-style-name="Standard_Lettrine">
        <style:paragraph-properties fo:text-align="center"/>
    </style:style>
    <style:style style:name="Standard_Lettrine_Right" style:family="paragraph" style:parent-style-name="Standard_Lettrine">
        <style:paragraph-properties fo:text-align="end"/>
    </style:style>
    
  </office:automatic-styles>

  <office:master-styles>
    <style:master-page style:name="Standard" style:page-layout-name="pm1">
      
      <style:header>
        <draw:frame text:anchor-type="paragraph" svg:x="-1.5cm" svg:y="2cm" svg:width="0.8cm" svg:height="20cm" draw:style-name="Cadre_Marge" draw:z-index="0">
            <draw:text-box fo:min-height="20cm">
                <text:p text:style-name="Texte_Marge">${escapeXml(texteMargeGauche)}</text:p>
            </draw:text-box>
        </draw:frame>

        <text:p text:style-name="Header_Marianne">RÉPUBLIQUE<text:line-break/>FRANÇAISE</text:p>
        <text:p text:style-name="Header_Direction">${escapeXml(docDirection)}</text:p>
        <table:table table:name="HeaderTable" table:style-name="Layout_Table">
          <table:table-column table:style-name="Layout_Col"/>
          <table:table-column table:style-name="Layout_Col"/>
          <table:table-row>
            <table:table-cell table:style-name="Header_Cell_Left">
                <text:p text:style-name="Header_Meta_Left">${escapeXml(docTitle)}</text:p>
            </table:table-cell>
            <table:table-cell table:style-name="Header_Cell_Right">
                <text:p text:style-name="Header_Meta_Right">${escapeXml(docDate)}</text:p>
            </table:table-cell>
          </table:table-row>
        </table:table>
      </style:header>

      <style:footer>
        <table:table table:name="FooterTable" table:style-name="Layout_Table">
          <table:table-column table:style-name="Layout_Col"/>
          <table:table-column table:style-name="Layout_Col"/>
          <table:table-row>
            <table:table-cell table:style-name="Footer_Cell">
                <text:p text:style-name="Footer_Meta_Left">${escapeXml(serviceEmail)}</text:p>
            </table:table-cell>
            <table:table-cell table:style-name="Footer_Cell">
                <text:p text:style-name="Footer_Meta_Right">Page <text:page-number text:select-page="current">1</text:page-number> / <text:page-count>1</text:page-count></text:p>
            </table:table-cell>
          </table:table-row>
        </table:table>
      </style:footer>

    </style:master-page>
  </office:master-styles>

  <office:body><office:text>${contentXml}</office:text></office:body>
</office:document>`;

    const blob = new Blob([fodtTemplate], { type: "application/vnd.oasis.opendocument.text" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = "Export_PLUME_" + new Date().getTime() + ".fodt";
    a.href = url;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

// =====================================================================
// 4. INITIALISATION
// =====================================================================

function initOdtExport() {
    const printBtn = document.querySelector('button[onclick*="window.print"]');
    if (!printBtn || document.getElementById('plume-odt-export-btn')) return;
    const odtBtn = document.createElement('button');
    odtBtn.id = 'plume-odt-export-btn';
    odtBtn.className = 'fr-btn fr-btn--secondary fr-btn--sm fr-icon-file-download-line';
    odtBtn.innerHTML = " Exporter ODT";
    odtBtn.style.marginLeft = '0.5rem';
    odtBtn.onclick = e => { e.preventDefault(); generateFODT(); };
    printBtn.parentNode.insertBefore(odtBtn, printBtn.nextSibling);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOdtExport); else initOdtExport();

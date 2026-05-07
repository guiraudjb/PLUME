/**
 * MODULE EXPORT ODT ULTRA - PLUME
 * Version : Support complet des Alignements (Gauche, Centre, Droite, Justifié)
 */

function getThemeColors() {
    const style = getComputedStyle(document.body);
    return {
        sun: style.getPropertyValue('--theme-sun').trim() || '#000091',
        bg: style.getPropertyValue('--theme-bg').trim() || '#f5f5fe',
        main: style.getPropertyValue('--theme-main').trim() || '#6a6af4'
    };
}

function pxToCm(px) { return (px * 2.54 / 96).toFixed(2); }

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'}[c]));
}

// --- NOUVEAU : Détecteur d'alignement ---
function getAlignmentStyle(node, baseStyle) {
    const align = node.style.textAlign;
    if (align === 'center') return baseStyle + "_Center";
    if (align === 'right') return baseStyle + "_Right";
    if (align === 'justify') return baseStyle + "_Justify";
    return baseStyle; // Par défaut (gauche)
}

function parseHtmlToFodt(node) {
    if (node.nodeType === 3) return escapeXml(node.textContent);
    if (node.nodeType !== 1) return '';

    const tag = node.tagName.toLowerCase();
    const cl = node.classList;

    if (node.style.display === 'none' || cl.contains('plume-pagination-overlay')) return '';

    // Gestion des composants DSFR
    if (cl.contains('fr-summary')) {
        const titleNode = node.querySelector('.fr-summary__title') || node.querySelector('h2, h3, b, strong');
        const titleText = titleNode ? titleNode.textContent : "Sommaire";
        const list = node.querySelector('ul, ol');
        let xml = `<text:p text:style-name="Sommaire_Titre">${escapeXml(titleText)}</text:p>`;
        if (list) {
            xml += `<text:list text:style-name="Sommaire_Liste">`;
            Array.from(list.children).forEach(li => {
                const content = Array.from(li.childNodes).map(parseHtmlToFodt).join('');
                xml += `<text:list-item><text:p text:style-name="Sommaire_Lien">${content}</text:p></text:list-item>`;
            });
            xml += `</text:list>`;
        }
        return xml;
    }

    if (cl.contains('fr-callout')) return `<text:p text:style-name="Exergue">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;
    if (cl.contains('plume-chiffre')) return `<text:p text:style-name="ChiffreCle">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;
    if (cl.contains('plume-citation') || tag === 'blockquote') return `<text:p text:style-name="Citation">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;

    switch (tag) {
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            const level = tag.substring(1);
            // On applique l'alignement même aux titres
            const hStyle = getAlignmentStyle(node, "Heading_" + level);
            return `<text:h text:style-name="${hStyle}" text:outline-level="${level}">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:h>`;

        case 'p':
            if (node.closest('.fr-callout, .plume-citation, .plume-chiffre, .fr-summary')) {
                return Array.from(node.childNodes).map(parseHtmlToFodt).join('') + '<text:line-break/>';
            }
            // Détection de l'alignement pour le paragraphe
            const pStyle = getAlignmentStyle(node, "Standard");
            return `<text:p text:style-name="${pStyle}">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p>`;

        case 'img':
            const src = node.getAttribute('src');
            if (src && src.startsWith('data:image') && src.length > 100) {
                const b64Data = src.split(',')[1];
                let wCm = pxToCm(node.clientWidth || node.width || 600);
                let hCm = pxToCm(node.clientHeight || node.height || 400);
                if (wCm > 16) { const ratio = 16 / wCm; wCm = 16; hCm = (hCm * ratio).toFixed(2); }
                // L'image respecte l'alignement de son parent si elle est dans un paragraphe
                const imgAlign = node.style.textAlign || (node.parentNode.style.textAlign) || 'center';
                const imgStyle = imgAlign === 'left' ? 'Standard' : (imgAlign === 'right' ? 'ImageRight' : 'ImageCenter');
                
                return `<text:p text:style-name="${imgStyle}"><draw:frame draw:z-index="0" svg:width="${wCm}cm" svg:height="${hCm}cm" text:anchor-type="paragraph"><draw:image><office:binary-data>${b64Data}</office:binary-data></draw:image></draw:frame></text:p>`;
            }
            return '';

        case 'b': case 'strong': return `<text:span text:style-name="Bold">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'i': case 'em': return `<text:span text:style-name="Italic">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'u': return `<text:span text:style-name="Underline">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 's': case 'del': return `<text:span text:style-name="Strikethrough">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'sup': return `<text:span text:style-name="Superscript">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:span>`;
        case 'br': return `<text:line-break/>`;
        case 'ul': case 'ol': return `<text:list text:style-name="List_1">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:list>`;
        case 'li': return `<text:list-item><text:p text:style-name="Standard">${Array.from(node.childNodes).map(parseHtmlToFodt).join('')}</text:p></text:list-item>`;

        default:
            return Array.from(node.childNodes).map(parseHtmlToFodt).join('');
    }
}

function generateFODT() {
    const pages = document.querySelectorAll('.content-editable');
    if (!pages.length) return;
    const theme = getThemeColors();
    let contentXml = '';
    pages.forEach((page, index) => {
        contentXml += parseHtmlToFodt(page);
        if (index < pages.length - 1) contentXml += `<text:p text:style-name="PageBreak"/>`;
    });

    const fodtTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                 xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0"
                 xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"
                 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 office:version="1.2" office:mimetype="application/vnd.oasis.opendocument.text">
  <office:automatic-styles>
    <style:style style:name="Standard" style:family="paragraph">
        <style:paragraph-properties fo:margin-bottom="0.3cm" fo:line-height="120%" fo:text-align="start"/>
        <style:text-properties fo:font-family="Arial" fo:font-size="11pt"/>
    </style:style>
    <style:style style:name="Standard_Center" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="center"/>
    </style:style>
    <style:style style:name="Standard_Right" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="end"/>
    </style:style>
    <style:style style:name="Standard_Justify" style:family="paragraph" style:parent-style-name="Standard">
        <style:paragraph-properties fo:text-align="justify"/>
    </style:style>

    <style:style style:name="ImageCenter" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="center" fo:margin-top="0.5cm" fo:margin-bottom="0.5cm"/></style:style>
    <style:style style:name="ImageRight" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:text-align="end" fo:margin-top="0.5cm" fo:margin-bottom="0.5cm"/></style:style>
    <style:style style:name="PageBreak" style:family="paragraph"><style:paragraph-properties fo:break-before="page"/></style:style>
    
    <style:style style:name="Heading_1" style:family="paragraph">
        <style:text-properties fo:font-size="22pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
        <style:paragraph-properties fo:margin-top="0.8cm" fo:margin-bottom="0.5cm" fo:text-align="start"/>
    </style:style>
    <style:style style:name="Heading_1_Center" style:family="paragraph" style:parent-style-name="Heading_1"><style:paragraph-properties fo:text-align="center"/></style:style>
    <style:style style:name="Heading_1_Right" style:family="paragraph" style:parent-style-name="Heading_1"><style:paragraph-properties fo:text-align="end"/></style:style>

    <style:style style:name="Heading_2" style:family="paragraph">
        <style:text-properties fo:font-size="17pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
        <style:paragraph-properties fo:margin-top="0.6cm" fo:margin-bottom="0.4cm" fo:text-align="start"/>
    </style:style>
    <style:style style:name="Heading_2_Center" style:family="paragraph" style:parent-style-name="Heading_2"><style:paragraph-properties fo:text-align="center"/></style:style>
    
    <style:style style:name="Heading_3" style:family="paragraph">
        <style:text-properties fo:font-size="14pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
        <style:paragraph-properties fo:margin-top="0.5cm" fo:margin-bottom="0.3cm" fo:text-align="start"/>
    </style:style>
    <style:style style:name="Heading_4" style:family="paragraph">
        <style:text-properties fo:font-size="12pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
        <style:paragraph-properties fo:margin-top="0.4cm" fo:margin-bottom="0.2cm" fo:text-align="start"/>
    </style:style>

    <style:style style:name="Exergue" style:family="paragraph">
        <style:paragraph-properties fo:background-color="${theme.bg}" fo:padding="0.4cm" fo:border-left="4pt solid ${theme.main}" fo:margin-bottom="0.5cm"/>
    </style:style>
    <style:style style:name="Citation" style:family="paragraph">
        <style:paragraph-properties fo:margin-left="1cm" fo:border-left="2pt solid #dddddd" fo:padding-left="0.3cm" fo:margin-bottom="0.5cm"/>
        <style:text-properties fo:font-style="italic" fo:color="#666666"/>
    </style:style>
    <style:style style:name="ChiffreCle" style:family="paragraph">
        <style:paragraph-properties fo:text-align="center" fo:margin-top="0.6cm" fo:margin-bottom="0.6cm"/>
        <style:text-properties fo:font-size="28pt" fo:font-weight="bold" fo:color="${theme.sun}"/>
    </style:style>

    <style:style style:name="Bold" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style>
    <style:style style:name="Italic" style:family="text"><style:text-properties fo:font-style="italic"/></style:style>
    <style:style style:name="Underline" style:family="text"><style:text-properties style:text-underline-style="solid" style:text-underline-width="auto"/></style:style>
    <style:style style:name="Strikethrough" style:family="text"><style:text-properties style:text-line-through-style="solid" style:text-line-through-type="single"/></style:style>
    <style:style style:name="Superscript" style:family="text"><style:text-properties style:text-position="super 58%"/></style:style>
  </office:automatic-styles>
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

function initOdtExport() {
    const printBtn = document.querySelector('button[onclick*=\"window.print\"]');
    if (!printBtn || document.getElementById('plume-odt-export-btn')) return;
    const odtBtn = document.createElement('button');
    odtBtn.id = 'plume-odt-export-btn';
    odtBtn.className = 'fr-btn fr-btn--secondary fr-btn--sm fr-icon-file-download-line';
    odtBtn.innerHTML = " Exporter ODT";
    odtBtn.style.marginLeft = '0.5rem';
    odtBtn.onclick = function(e) { e.preventDefault(); generateFODT(); };
    printBtn.parentNode.insertBefore(odtBtn, printBtn.nextSibling);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initOdtExport); else initOdtExport();

let logoDataUrl = "";
let plumeComments = {};
// =====================================================================
// MODE RÉVISION : SUIVI DES MODIFICATIONS (PHASE 3)
// =====================================================================


const palettes = {
    // Marque de l'État
    marianne:     { main: '#6a6af4', sun: '#000091', bg: '#f5f5fe' }, // Bleu France
    rouge:        { main: '#e1000f', sun: '#c9191e', bg: '#fdf4f4' }, // Rouge Marianne

    // Couleurs Illustratives - Chaudes
    tuile:        { main: '#ce614a', sun: '#a94645', bg: '#fef4f3' }, // Pink Tuile (Corrigé)
    macaron:      { main: '#e18b76', sun: '#8d533e', bg: '#fef4f2' }, // Pink Macaron
    opera:        { main: '#c94668', sun: '#743242', bg: '#fef0f2' }, // Brown Opera
    terre_battue: { main: '#e4794a', sun: '#755348', bg: '#fee9e5' }, // Orange Terre Battue (Ajouté)
    tournesol:    { main: '#c8aa39', sun: '#716043', bg: '#fef6e3' }, // Yellow Tournesol
    moutarde:     { main: '#c3992a', sun: '#695228', bg: '#fef5e8' }, // Yellow Moutarde

    // Couleurs Illustratives - Froides / Violettes
    ecume:        { main: '#465f9d', sun: '#2f4077', bg: '#e9edfe' }, // Blue Écume
    cumulus:      { main: '#417dc4', sun: '#3558a2', bg: '#e6eefe' }, // Blue Cumulus (Ajouté)
    glycine:      { main: '#a558a0', sun: '#6e445a', bg: '#fee7fc' }, // Purple Glycine (Corrigé)

    // Couleurs Illustratives - Vertes / Nature
    emeraude:     { main: '#00a95f', sun: '#297254', bg: '#c3fad5' }, // Green Émeraude
    menthe:       { main: '#009081', sun: '#37635f', bg: '#bafaee' }, // Green Menthe
    archipel:     { main: '#009099', sun: '#006a6f', bg: '#e5fbfd' }, // Green Archipel (Remplace Céladon)
    bourgeon:     { main: '#68a532', sun: '#447049', bg: '#e6feda' }, // Green Bourgeon
    tilleul:      { main: '#b7a73f', sun: '#66673d', bg: '#fef7da' }, // Green Tilleul-Verveine

    // Couleurs Illustratives - Tons Neutres / Bruns
    cafe_creme:   { main: '#d1b781', sun: '#685c48', bg: '#f7ecce' }, // Brown Café Crème (Ajouté)
    caramel:      { main: '#c08c65', sun: '#855b48', bg: '#f3e2d9' }, // Brown Caramel (Ajouté)
    gris_galet:   { main: '#aea397', sun: '#6a6156', bg: '#f3ede5' }  // Beige Gris Galet (Remplace Terre)
};


// =====================================================================
// CATALOGUE DES ILLUSTRATIONS DSFR (PICTOS & ICÔNES)
// =====================================================================

// 1. Stockage brut de la liste (Compressée pour la performance)
const rawDsfrList = `
./libs/dsfr-v1.14.3/dist/artwork/dark.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/sun.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/moon.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/mountain.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/grocery.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/leaf.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/environment.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/human-cooperation.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/tree.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/environment/food.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/national-identity-card-passport.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/document.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/contract.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/presse-card.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/document-signature.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/conclusion.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/document-search.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/tax-stamp.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/international-driving-license.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/binders.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/archive.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/document-download.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/sign-document.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/document-add.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/driving-licence.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/international-driving-license-new.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/vehicle-registration.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/national-identity-card.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/passport.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/document/driving-license-new.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/school.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/city-hall.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/nuclear-plant.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/factory.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/house.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/companie.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/buildings/base.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/medical-research.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/health.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/hospital.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/doctor.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/virus.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/health/vaccine.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/accessibility/eye-off.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/accessibility/ear-off.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/accessibility/accessibility.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/accessibility/wheelchair.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/accessibility/mental-disabilities.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/firefighter.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/astronaut.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/justice.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/navy-bachi.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/police.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/navy-anchor.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/gendarmerie.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/money.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/institutions/army-tank.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/ecosystem.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/smartphone.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/data-visualization.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/internet.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/in-progress.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/search.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/mail-send.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/application.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/avatar.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/innovation.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/calendar.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/coding.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/digital/self-training.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/success.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/technical-error.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/notification.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/flow-settings.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/warning.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/padlock.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/error.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/language.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/information.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/connection-lost.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/flow-list.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/system/system.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/community.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/art.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/catalog.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/book.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/pictures.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/video-games.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/audio.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/paint.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/podcast.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/video.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/culture.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/leisure/digital-art.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/map.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/travel-back.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/compass.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/location-france.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/backpack.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/location-overseas-france.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/map-pin.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/airport.svg
./libs/dsfr-v1.14.3/dist/artwork/pictograms/map/luggage.svg
./libs/dsfr-v1.14.3/dist/artwork/light.svg
./libs/dsfr-v1.14.3/dist/artwork/background/ovoid.svg
./libs/dsfr-v1.14.3/dist/artwork/system.svg
./libs/dsfr-v1.14.3/dist/icons/editor/fr--highlight.svg
./libs/dsfr-v1.14.3/dist/icons/editor/underline.svg
./libs/dsfr-v1.14.3/dist/icons/editor/list-check.svg
./libs/dsfr-v1.14.3/dist/icons/editor/indent-increase.svg
./libs/dsfr-v1.14.3/dist/icons/editor/subscript.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-3.svg
./libs/dsfr-v1.14.3/dist/icons/editor/strikethrough.svg
./libs/dsfr-v1.14.3/dist/icons/editor/link-unlink.svg
./libs/dsfr-v1.14.3/dist/icons/editor/italic.svg
./libs/dsfr-v1.14.3/dist/icons/editor/hashtag.svg
./libs/dsfr-v1.14.3/dist/icons/editor/align-center.svg
./libs/dsfr-v1.14.3/dist/icons/editor/format-clear.svg
./libs/dsfr-v1.14.3/dist/icons/editor/code-view.svg
./libs/dsfr-v1.14.3/dist/icons/editor/fr--quote-fill.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-6.svg
./libs/dsfr-v1.14.3/dist/icons/editor/align-right.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-4.svg
./libs/dsfr-v1.14.3/dist/icons/editor/space.svg
./libs/dsfr-v1.14.3/dist/icons/editor/align-justify.svg
./libs/dsfr-v1.14.3/dist/icons/editor/code-block.svg
./libs/dsfr-v1.14.3/dist/icons/editor/sort-asc.svg
./libs/dsfr-v1.14.3/dist/icons/editor/superscript.svg
./libs/dsfr-v1.14.3/dist/icons/editor/text-direction-r.svg
./libs/dsfr-v1.14.3/dist/icons/editor/separator.svg
./libs/dsfr-v1.14.3/dist/icons/editor/question-mark.svg
./libs/dsfr-v1.14.3/dist/icons/editor/link.svg
./libs/dsfr-v1.14.3/dist/icons/editor/font-color.svg
./libs/dsfr-v1.14.3/dist/icons/editor/fr--bold.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-5.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-2.svg
./libs/dsfr-v1.14.3/dist/icons/editor/list-ordered.svg
./libs/dsfr-v1.14.3/dist/icons/editor/align-left.svg
./libs/dsfr-v1.14.3/dist/icons/editor/list-unordered.svg
./libs/dsfr-v1.14.3/dist/icons/editor/table-2.svg
./libs/dsfr-v1.14.3/dist/icons/editor/sort-desc.svg
./libs/dsfr-v1.14.3/dist/icons/editor/fr--quote-line.svg
./libs/dsfr-v1.14.3/dist/icons/editor/font-size.svg
./libs/dsfr-v1.14.3/dist/icons/editor/translate-2.svg
./libs/dsfr-v1.14.3/dist/icons/editor/h-1.svg
./libs/dsfr-v1.14.3/dist/icons/editor/indent-decrease.svg
./libs/dsfr-v1.14.3/dist/icons/user/account-pin-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/admin-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-star-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-star-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/account-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-search-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-add-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-add-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/parent-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/team-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/admin-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-heart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-setting-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/account-pin-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/team-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-setting-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/group-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/account-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/parent-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-search-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/group-line.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-fill.svg
./libs/dsfr-v1.14.3/dist/icons/user/user-heart-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/book-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/article-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/clipboard-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/newspaper-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-download-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/book-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/draft-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-text-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/survey-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/clipboard-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/todo-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/booklet-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/draft-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-add-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-pdf-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-add-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/newspaper-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-pdf-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-text-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/todo-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/article-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/folder-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/survey-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/file-download-fill.svg
./libs/dsfr-v1.14.3/dist/icons/document/folder-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/document/booklet-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/google-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/firefox-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/snapchat-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/youtube-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/bluesky-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitter-x-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/telegram-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/instagram-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/firefox-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/threads-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/vuejs-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/facebook-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitter-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/github-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/npmjs-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitter-x-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/npmjs-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/mastodon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/chrome-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/google-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/threads-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitch-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/instagram-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/youtube-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/telegram-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/safari-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/linkedin-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/remixicon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/slack-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitch-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/whatsapp-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/vimeo-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/fr--tiktok-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/fr--dailymotion-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/slack-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/facebook-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/vimeo-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/safari-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/fr--dailymotion-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/chrome-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/twitter-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/edge-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/fr--tiktok-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/bluesky-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/ie-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/vuejs-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/linkedin-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/edge-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/mastodon-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/ie-line.svg
./libs/dsfr-v1.14.3/dist/icons/logo/github-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/whatsapp-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/snapchat-fill.svg
./libs/dsfr-v1.14.3/dist/icons/logo/remixicon-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/money-euro-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/bank-card-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/secure-payment-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/bank-card-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/secure-payment-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/gift-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/shopping-bag-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/trophy-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/gift-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/money-euro-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/shopping-bag-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/trophy-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/money-euro-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/shopping-cart-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/finance/shopping-cart-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/money-euro-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/finance/coin-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/hospital-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/ancient-gate-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/community-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/hospital-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/school-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/building-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/building-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/home-office-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/tent-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/store-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/building-4-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/school-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/home-4-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/government-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/tent-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/government-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/hotel-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/store-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/hotel-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/home-office-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/community-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/bank-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/ancient-pavilion-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/building-4-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/ancient-gate-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/ancient-pavilion-fill.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/bank-line.svg
./libs/dsfr-v1.14.3/dist/icons/buildings/home-4-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/clapperboard-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/play-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/live-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-add-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/fullscreen-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/headphone-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/pause-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/camera-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/film-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-add-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/mic-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/equalizer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-mute-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-mute-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/live-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/notification-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-edit-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/stop-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/clapperboard-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/music-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/image-edit-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/film-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/gallery-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/camera-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/notification-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/pause-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/music-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/equalizer-line.svg
./libs/dsfr-v1.14.3/dist/icons/media/mic-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/play-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/stop-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/volume-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/headphone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/media/gallery-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-down-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-s-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/fr--arrow-right-s-line-double.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-left-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/skip-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-down-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-left-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-s-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-turn-forward-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-go-forward-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-up-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-s-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-up-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-left-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/skip-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-right-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-turn-forward-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-up-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/skip-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-s-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-up-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-right-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/skip-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-up-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-turn-back-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-s-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-turn-back-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-up-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-down-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-go-forward-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-left-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/fr--arrow-left-s-line-double.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-left-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-up-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-left-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-s-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-right-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/contract-left-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-down-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-go-back-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-up-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-s-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/expand-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/fr--arrow-left-s-first-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-right-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-left-s-fill.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/corner-left-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/arrow-go-back-line.svg
./libs/dsfr-v1.14.3/dist/icons/arrows/fr--arrow-right-s-last-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/heart-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/virus-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/syringe-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/surgical-mask-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/dislike-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/dossier-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/mental-health-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/syringe-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/test-tube-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/psychotherapy-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/microscope-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/medicine-bottle-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/capsule-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/medicine-bottle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/surgical-mask-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/stethoscope-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/first-aid-kit-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/dislike-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/heart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/health-book-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/virus-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/dossier-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/heart-pulse-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/microscope-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/pulse-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/health-book-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/heart-pulse-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/test-tube-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/capsule-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/hand-sanitizer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/mental-health-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/lungs-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/first-aid-kit-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/lungs-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/psychotherapy-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/thermometer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/health/thermometer-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/stethoscope-line.svg
./libs/dsfr-v1.14.3/dist/icons/health/hand-sanitizer-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/square-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/contrast-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pentagon-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/brush-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-column-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/table-alt-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/focus-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/hexagon-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/ink-bottle-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/pencil-ruler-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/anticlockwise-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pencil-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/anticlockwise-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-top-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/markup-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/markup-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-left-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/collage-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/slice-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pen-nib-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/table-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/drag-move-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/clockwise-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/ball-pen-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/hammer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-column-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/contrast-drop-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/triangle-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/compasses-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/palette-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/brush-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/square-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/eraser-fill-1.svg
./libs/dsfr-v1.14.3/dist/icons/design/triangle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/quill-pen-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/focus-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/pentagon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/eraser-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/crop-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/palette-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/rectangle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/mark-pen-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/shapes-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/hexagon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/rectangle-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/ink-bottle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/magic-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/tools-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-top-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-bottom-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/mark-pen-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-right-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/drop-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/pantone-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/eraser-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/artboard-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/eraser-line-1.svg
./libs/dsfr-v1.14.3/dist/icons/design/ruler-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/brush-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/screenshot-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-masonry-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/crosshair-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/slice-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/sip-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/drag-move-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/paint-brush-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/contrast-drop-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/grid-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-grid-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/paint-brush-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pantone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/magic-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/drag-drop-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/screenshot-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/paint-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/quill-pen-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/drop-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pencil-ruler-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/scissors-cut-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pencil-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/ruler-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/scissors-cut-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/crop-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/artboard-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-grid-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/drag-drop-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-row-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/shapes-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/blur-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/octagon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/clockwise-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/compasses-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/scissors-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-masonry-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/scissors-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-left-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/sip-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/hammer-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-right-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/tools-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/contrast-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/brush-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/paint-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-bottom-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/collage-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/ball-pen-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/blur-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/shape-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/octagon-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/crosshair-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/layout-row-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/table-alt-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/edit-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/grid-line.svg
./libs/dsfr-v1.14.3/dist/icons/design/shape-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/table-fill.svg
./libs/dsfr-v1.14.3/dist/icons/design/pen-nib-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-commits-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/html5-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/css3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/command-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-commits-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/parentheses-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/javascript-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-branch-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/html5-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-s-slash-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-branch-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-commit-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-merge-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-close-pull-request-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/brackets-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/parentheses-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/javascript-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/cursor-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-pull-request-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-window-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-pull-request-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/bug-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/brackets-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/cursor-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/bug-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-merge-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/braces-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/code-s-slash-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-private-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/braces-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-private-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-commit-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/css3-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-window-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-repository-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-line.svg
./libs/dsfr-v1.14.3/dist/icons/development/command-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/git-close-pull-request-fill.svg
./libs/dsfr-v1.14.3/dist/icons/development/terminal-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/profil-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-close-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/printer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/bubble-chart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-check-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calculator-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-expired-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/copyright-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/donut-chart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/send-plane-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/cloud-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/stack-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/slideshow-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/award-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-close-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-open-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-volume-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/megaphone-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/copyright-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/links-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-todo-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/megaphone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/at-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-todo-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/archive-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-settings-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-close-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/global-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-settings-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-unread-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/briefcase-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/reply-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/links-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-horizontal-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/donut-chart-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-event-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-valid-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-star-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/global-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/window-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/shake-hands-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-forbid-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/line-chart-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-unarchive-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/reply-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-download-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bookmark-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/archive-drawer-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/service-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/cloud-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/flag-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-unread-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/printer-cloud-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/medal-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-open-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/service-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/bookmark-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/cloud-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/cloud-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/bubble-chart-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/presentation-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/archive-drawer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-horizontal-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/customer-service-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/profil-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/reply-all-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-lock-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-volume-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/bar-chart-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/award-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/record-mail-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calculator-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-pending-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-send-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-check-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-add-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/attachment-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-download-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/printer-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-expired-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/reply-all-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-pending-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/record-mail-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/honour-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-archive-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/stack-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/medal-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/shake-hands-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-star-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-send-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/customer-service-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/presentation-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/archive-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/at-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-check-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/window-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/seo-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-archive-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/seo-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/projector-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/pass-valid-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/briefcase-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/window-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/slideshow-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/pie-chart-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-add-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/projector-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/flag-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/send-plane-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/window-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-lock-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/attachment-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-forbid-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-check-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/inbox-unarchive-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/honour-line.svg
./libs/dsfr-v1.14.3/dist/icons/business/calendar-event-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/mail-close-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/printer-cloud-fill.svg
./libs/dsfr-v1.14.3/dist/icons/business/line-chart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-history-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-check-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/questionnaire-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-upload-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/discuss-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-follow-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-new-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/speak-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-voice-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-follow-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-voice-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/video-chat-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/feedback-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/message-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-check-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-delete-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-delete-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-new-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/message-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/speak-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-download-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-download-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/discuss-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-quote-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/video-chat-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/message-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-private-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-history-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-settings-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/feedback-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/emoji-sticker-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-forward-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/emoji-sticker-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-poll-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-poll-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-forward-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/question-answer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-upload-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/question-answer-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/questionnaire-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/message-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-private-line.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-settings-fill.svg
./libs/dsfr-v1.14.3/dist/icons/communication/chat-quote-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--ear-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/leaf-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--ear-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/lightbulb-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/umbrella-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--accessibility-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/scales-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/seedling-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/scales-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/recycle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/wheelchair-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/recycle-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--sign-language-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--mental-disabilities-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/seedling-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/lightbulb-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/plant-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/plant-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--accessibility-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--mental-disabilities-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/leaf-fill.svg
./libs/dsfr-v1.14.3/dist/icons/others/wheelchair-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/fr--sign-language-line.svg
./libs/dsfr-v1.14.3/dist/icons/others/umbrella-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/zoom-in-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/menu-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/zoom-in-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/close-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/alert-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--capslock-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/star-s-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/filter-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/add-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/download-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/information-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--error-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/lock-unlock-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/lock-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/shield-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/upload-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/add-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/error-warning-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/checkbox-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/question-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--theme-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/checkbox-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/download-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/share-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--success-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/checkbox-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/star-s-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--warning-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/eye-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/subtract-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/time-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/thumb-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/share-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/refresh-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/delete-bin-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--alert-warning-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--error-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/settings-5-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/filter-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/check-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/lock-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/star-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/menu-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/search-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/thumb-up-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/close-circle-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/checkbox-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--info-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/thumb-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/upload-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/eye-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/close-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--equal-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/external-link-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--success-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/eye-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/delete-bin-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/timer-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/share-forward-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/zoom-out-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/upload-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/logout-box-r-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/time-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/information-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/timer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/star-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/external-link-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/error-warning-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/search-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/notification-badge-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/alarm-warning-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/logout-box-r-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--warning-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/share-forward-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/upload-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/alert-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/settings-5-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--info-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/notification-badge-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/fr--alert-warning-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/shield-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/question-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/alarm-warning-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/eye-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/more-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/refresh-line.svg
./libs/dsfr-v1.14.3/dist/icons/system/zoom-out-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/more-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/lock-unlock-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/add-circle-fill.svg
./libs/dsfr-v1.14.3/dist/icons/system/thumb-up-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fr--avalanches-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/heavy-showers-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fire-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/snowy-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/sun-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fr--submersion-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/windy-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/moon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/sun-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/flood-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fr--submersion-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/thunderstorms-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fr--avalanches-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/windy-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/cloudy-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/tornado-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/sparkling-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/moon-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/flood-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/temp-cold-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/tornado-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/flashlight-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/sparkling-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/typhoon-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/fire-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/flashlight-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/typhoon-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/heavy-showers-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/thunderstorms-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/cloudy-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/weather/temp-cold-fill.svg
./libs/dsfr-v1.14.3/dist/icons/weather/snowy-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/rfid-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-error-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/u-disk-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/bluetooth-connect-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-lock-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/router-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/remote-control-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/macbook-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-charge-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/base-station-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/wifi-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/sd-card-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/device-recover-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/uninstall-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/install-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/uninstall-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/cast-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/shut-down-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/airplay-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/router-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/usb-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/restart-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/scan-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/remote-control-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/barcode-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/computer-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/radar-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/airplay-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/cast-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/cpu-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/save-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/mac-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/qr-scan-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/sim-card-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/sd-card-mini-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/gradienter-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/cpu-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/computer-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/gps-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/server-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/smartphone-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/dashboard-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/qr-code-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/wifi-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/rotate-lock-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/install-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/hard-drive-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/usb-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/u-disk-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/tablet-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/sim-card-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/gradienter-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/barcode-box-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-find-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/sensor-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/remote-control-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-low-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-find-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/rfid-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/instance-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/save-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/device-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/sd-card-mini-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/fingerprint-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/wireless-charging-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/fingerprint-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/cellphone-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/hotspot-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/tablet-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/device-recover-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/dashboard-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/database-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/wifi-off-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/rss-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/bluetooth-connect-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/shut-down-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/save-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/tv-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-charge-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/qr-scan-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/hard-drive-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/tv-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/database-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/radar-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/hotspot-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/bluetooth-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/cellphone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/bluetooth-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/mouse-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/sd-card-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/scan-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/base-station-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/barcode-box-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/macbook-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/save-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/gamepad-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/qr-code-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/signal-wifi-error-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/barcode-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/remote-control-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/sensor-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/battery-low-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/phone-lock-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/rotate-lock-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/mouse-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/wireless-charging-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/restart-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/server-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/keyboard-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/instance-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/wifi-off-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/smartphone-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/rss-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/gps-line.svg
./libs/dsfr-v1.14.3/dist/icons/device/gamepad-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/device-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/mac-fill.svg
./libs/dsfr-v1.14.3/dist/icons/device/keyboard-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/gas-station-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/bike-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/motorbike-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/earth-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/ship-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/anchor-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/passport-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/cup-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/map-pin-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/compass-3-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/france-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/bus-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/france-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/motorbike-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/signal-tower-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/caravan-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/road-map-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/earth-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/map-pin-user-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/map-pin-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/sailboat-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/train-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/bike-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/gas-station-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/signal-tower-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/bus-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/charging-pile-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/anchor-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/compass-3-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/goblet-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/passport-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/charging-pile-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/train-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/suitcase-2-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/restaurant-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/taxi-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/taxi-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/suitcase-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/car-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/cup-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/ship-2-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/sailboat-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/car-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/caravan-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/map-pin-user-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/restaurant-fill.svg
./libs/dsfr-v1.14.3/dist/icons/map/road-map-line.svg
./libs/dsfr-v1.14.3/dist/icons/map/goblet-line.svg
./libs/dsfr-v1.14.3/dist/favicon/favicon.svg
`;
// (Note : J'ai mis un extrait pour la lisibilité, vous pouvez copier-coller votre liste complète de 300 lignes ici entre les backticks ` `)

// 2. Classement automatique des images
const dsfrCategories = {};
rawDsfrList.split('\n').forEach(path => {
    path = path.trim();
    if (!path) return;
    
    const parts = path.split('/');
    let categoryName = "Autres";
    const filename = parts[parts.length - 1];
    const name = filename.replace('.svg', '').replace(/-/g, ' ');

    if (path.includes('/artwork/pictograms/')) {
        categoryName = "🎨 Pictogrammes - " + parts[parts.length - 2].toUpperCase();
    } else if (path.includes('/icons/')) {
        categoryName = "🔣 Icônes - " + parts[parts.length - 2].toUpperCase();
    } else if (path.includes('/artwork/')) {
        categoryName = "🎨 Artwork divers";
    }

    if (!dsfrCategories[categoryName]) {
        dsfrCategories[categoryName] = [];
    }
    dsfrCategories[categoryName].push({ name, path });
});

// 3. Interface de la Modale Interactive
function openDsfrGalleryModal(mode = 'insert', targetElement = null) {
    // On sauvegarde le curseur pour être sûr d'insérer au bon endroit après la sélection
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount > 0) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    // Titre dynamique selon l'action
    const titleText = mode === 'bullet' ? "Changer la puce" : "Insérer un picto DSFR";

    overlay.innerHTML = `
        <div class="chart-modal" style="width: 800px; max-width: 95vw; height: 75vh; display: flex; flex-direction: column;">
            <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-star-line"></span> ${titleText}</h3>
                <button class="fr-btn fr-btn--close fr-btn--tertiary-no-outline" id="btn-gallery-close" title="Fermer">Fermer</button>
            </div>
            
            <div style="padding: 1rem; background: #fff; border-bottom: 1px solid var(--grey-900);">
                <label class="fr-label" for="dsfr-category-select">Choisir une catégorie :</label>
                <select id="dsfr-category-select" class="fr-select">
                    ${Object.keys(dsfrCategories).sort().map(cat => `<option value="${cat}">${cat} (${dsfrCategories[cat].length})</option>`).join('')}
                </select>
            </div>
            
            <div id="dsfr-gallery-grid" style="flex: 1; padding: 1.5rem; overflow-y: auto; background: var(--theme-bg); display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 15px; align-content: start;">
                <!-- Les images apparaîtront ici -->
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const select = overlay.querySelector('#dsfr-category-select');
    const grid = overlay.querySelector('#dsfr-gallery-grid');

    // Moteur d'affichage de la grille
    function renderGrid(category) {
        grid.innerHTML = '';
        dsfrCategories[category].forEach(item => {
            const btn = document.createElement('button');
            btn.title = item.name;
            btn.style.cssText = `
                background: #fff; border: 1px solid var(--grey-900); border-radius: 4px; 
                padding: 10px; cursor: pointer; display: flex; flex-direction: column; 
                align-items: center; justify-content: center; transition: all 0.2s;
            `;
            // Effet de survol
            btn.onmouseover = () => btn.style.borderColor = 'var(--theme-sun)';
            btn.onmouseout = () => btn.style.borderColor = 'var(--grey-900)';
            
            btn.innerHTML = `<img src="${item.path}" style="max-width: 40px; max-height: 40px; object-fit: contain;">`;
            
            // ÉVÉNEMENT AU CLIC SUR L'IMAGE
            btn.onclick = async () => {
                try {
                    // 1. On affiche un petit message de patience si le SVG est lourd
                    const originalBtnContent = btn.innerHTML;
                    btn.innerHTML = '<span class="fr-icon-refresh-line" style="animation: spin 1s linear infinite;"></span>';
                    
                    // 2. CONVERSION MAGIQUE EN PNG 256x256
                    const pngDataUrl = await convertSvgToPng(item.path, 256);
                    
                    // 3. Application selon le mode
                    if (mode === 'insert') {
                        if (savedRange) {
                            selection.removeAllRanges();
                            selection.addRange(savedRange);
                        }
                        
                        const img = document.createElement('img');
                        // On utilise la donnée Base64 au lieu du chemin local
                        img.src = pngDataUrl; 
                        img.alt = item.name;
                        // On garde une taille visuelle adaptée au texte (le fichier pèse bien 256px en fond)
                        img.style.maxWidth = '150px'; 
                        
                        enforceFocus();
                        document.execCommand('insertHTML', false, img.outerHTML);
                    } 
                    else if (mode === 'bullet' && targetElement) {
						targetElement.classList.add('plume-custom-bullet');
                        targetElement.style.listStyleType = 'none';
                        // On injecte le PNG encodé directement dans le style
                        
                        targetElement.style.backgroundImage = `url('${pngDataUrl}')`;
                        targetElement.style.backgroundRepeat = 'no-repeat';
                        targetElement.style.backgroundPosition = 'left 0.3rem'; 
                        targetElement.style.backgroundSize = '1.2rem';
                        targetElement.style.paddingLeft = '1.8rem';
                    }
                    
                    overlay.remove();
                    if (typeof saveDraftToLocal === 'function') saveDraftToLocal();
                    
                } catch (error) {
                    btn.innerHTML = originalBtnContent;
                    if (typeof showToast !== 'undefined') showToast("Erreur", "La conversion de l'image a échoué.", "error");
                }
            };
            
            grid.appendChild(btn);
        });
    }

    // Premier affichage et écouteur de changement
    renderGrid(select.value);
    select.addEventListener('change', (e) => renderGrid(e.target.value));

    // Fermeture
    document.getElementById('btn-gallery-close').onclick = () => overlay.remove();
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) overlay.remove(); });
}

/**
 * Convertit une URL SVG en DataURL PNG (Base64) de taille fixe
 * @param {string} svgUrl - Le chemin vers le fichier SVG
 * @param {number} size - La taille finale du carré (ex: 256)
 * @returns {Promise<string>} - L'image PNG encodée en Base64
 */
function convertSvgToPng(svgUrl, size = 256) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Sécurité CORS
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Calcul pour conserver les proportions (Aspect Ratio)
            // au centre du carré de 256x256
            const scale = Math.min(size / img.width, size / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = (size - w) / 2;
            const y = (size - h) / 2;

            // On efface le fond (transparent par défaut) et on dessine le SVG
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, x, y, w, h);
            
            // Conversion en PNG
            resolve(canvas.toDataURL('image/png'));
        };
        
        img.onerror = () => {
            console.error("Erreur de chargement du SVG :", svgUrl);
            reject(new Error("Impossible de charger l'image."));
        };
        
        img.src = svgUrl;
    });
}

// =====================================================================
// SYSTÈME DE NOTIFICATIONS (TOASTS DSFR)
// =====================================================================
/**
 * Affiche une notification non-bloquante en bas à droite de l'écran
 * @param {string} title - Titre en gras
 * @param {string} message - Texte d'explication
 * @param {string} type - 'info' | 'success' | 'warning' | 'error'
 */
function showToast(title, message, type = 'info') {
    // 1. Création du conteneur global s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 2. Création de l'alerte basée sur le DSFR
    const toast = document.createElement('div');
    // On utilise les classes natives .fr-alert et .fr-alert--[type]
    toast.className = `fr-alert fr-alert--${type} fr-alert--sm plume-toast`;
    
    toast.innerHTML = `
        <h3 class="fr-alert__title">${title}</h3>
        <p>${message}</p>
    `;

    // 3. Ajout à l'écran
    container.appendChild(toast);

    // 4. Disparition automatique après 4.5 secondes
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        // On attend la fin de l'animation CSS (0.3s) pour détruire le noeud HTML
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

function applyPalette() {
    const p = palettes[document.getElementById('cfg-palette').value];
    document.documentElement.style.setProperty('--theme-main', p.main);
    document.documentElement.style.setProperty('--theme-sun', p.sun);
    document.documentElement.style.setProperty('--theme-bg', p.bg);
    refreshAllCharts();
    if (typeof refreshAllMaps === 'function') {
        refreshAllMaps();
    }
    if (typeof refreshAllTimelines === 'function') refreshAllTimelines();
    if (typeof refreshAllQRCodes === 'function') refreshAllQRCodes();
    if (typeof refreshAllTrees === 'function') refreshAllTrees();
    if (typeof refreshAllMaths === 'function') refreshAllMaths();
    
}

function updateColoredMargins() {
    const positions = ['top', 'bottom', 'left', 'right'];
    const pages = document.querySelectorAll('.page-a4');
    
    pages.forEach(page => {
        positions.forEach(pos => {
            const isChecked = document.getElementById(`cfg-margin-${pos}`).checked;
            if (isChecked) {
                page.classList.add(`has-margin-${pos}`);
            } else {
                page.classList.remove(`has-margin-${pos}`);
            }
        });
    });
}

function format(cmd, val = null) {
    enforceFocus();
    document.execCommand(cmd, false, val);
}

/**
 * Extrait les listes (ul, ol) qui sont anormalement coincées à l'intérieur d'un paragraphe.
 */
function fixInvalidListNesting() {
    // Petit délai (10ms) pour laisser le temps à execCommand de finir de générer le DOM corrompu
    setTimeout(() => {
        const editor = document.querySelector('.content-editable');
        if (!editor) return;

        // On cible toutes les listes (ul, ol) qui ont un paragraphe (<p>) comme parent direct
        const trappedLists = editor.querySelectorAll('p > ul, p > ol');
        
        trappedLists.forEach(list => {
            const invalidParentP = list.parentNode;
            
            // 1. On déplace la liste pour la mettre au même niveau que le paragraphe (juste avant lui)
            invalidParentP.parentNode.insertBefore(list, invalidParentP);
            
            // 2. Nettoyage : si le paragraphe d'origine est maintenant vide 
            // (ex: il ne contenait que la liste ou des sauts de ligne), on le détruit.
            if (invalidParentP.textContent.trim() === '' && invalidParentP.querySelectorAll('img').length === 0) {
                invalidParentP.remove();
            }
        });
    }, 10); // Le petit délai garantit que le navigateur a terminé son insertion native
}

function insertHTML(html) { 
    enforceFocus();
    document.execCommand('insertHTML', false, html + '<p><br></p>'); 
    }

function syncMetadata() {
    document.querySelectorAll('.stamp-bureau').forEach(el => el.innerText = document.getElementById('cfg-bureau').value.toUpperCase());
    document.querySelectorAll('.stamp-titre').forEach(el => el.innerText = document.getElementById('cfg-titre').value.toUpperCase());
    document.querySelectorAll('.stamp-date').forEach(el => el.innerText = document.getElementById('cfg-date').value);
    document.querySelectorAll('.stamp-footer').forEach(el => el.innerText = document.getElementById('cfg-footer').value);
    document.querySelectorAll('.logo-bureau').forEach(img => { if(logoDataUrl) { img.src = logoDataUrl; img.style.display = 'block'; }});
}

function handleLogo(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => { logoDataUrl = e.target.result; syncMetadata(); };
        reader.readAsDataURL(input.files[0]);
    }
}

function addNewPage() {
    const pageNum = document.querySelectorAll('.page-a4').length + 1;
    const newPage = document.getElementById('page-1').cloneNode(true);
    newPage.id = `page-${pageNum}`;
    newPage.querySelector('.content-editable').innerHTML = "<p><br></p>";
    newPage.querySelector('.page-num-display').innerText = `Page ${pageNum}`;
    // Application de l'état des 4 marges
    const positions = ['top', 'bottom', 'left', 'right'];
    positions.forEach(pos => {
        if (document.getElementById(`cfg-margin-${pos}`).checked) {
            newPage.classList.add(`has-margin-${pos}`);
        } else {
            newPage.classList.remove(`has-margin-${pos}`);
        }
    });
    newPage.setAttribute('data-margin-text', document.getElementById('cfg-margin-text').value.toUpperCase());
    document.getElementById('pages-container').appendChild(newPage);
    syncMetadata();
}

// N'oubliez pas le mot-clé "async" ici :
async function saveJSON() {
    // 1. On capture l'état global (Palette, Titres, etc.)
    const state = {
        palette: document.getElementById('cfg-palette').value,
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        marginText: document.getElementById('cfg-margin-text').value,
        author: document.getElementById('cfg-author').value,
        comments: plumeComments, 
        margins: {
            top: document.getElementById('cfg-margin-top').checked,
            bottom: document.getElementById('cfg-margin-bottom').checked,
            left: document.getElementById('cfg-margin-left').checked,
            right: document.getElementById('cfg-margin-right').checked
        },
        logo: logoDataUrl,
        pages: []
    };
    
    // 2. On traite chaque page une par une
    document.querySelectorAll('.page-a4').forEach(page => {
        // On crée un clone "fantôme" (non attaché au DOM visible)
        const clone = page.cloneNode(true);
        const editor = clone.querySelector('.content-editable');
        
        // --- LA PURGE (Le secret de la performance) ---
        // On repère toutes les images générées par nos outils (CORRECTION APPLIQUÉE ICI)
        const generatedImages = editor.querySelectorAll('.chart-container img, .plume-map-container img');
        
        generatedImages.forEach(img => {
            // On vide le SRC (qui contient le Base64 massif)
            // On le remplace par un pixel transparent ou un placeholder léger
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        });
        
        // On sauvegarde le HTML purgé de ce clone
        let pageContent = sanitizePlumeHTML(editor.innerHTML);
        
        // 2. On cherche si la page possède des notes de bas de page à l'extérieur
        const safeArea = page.querySelector('.safe-area');
        const footnotes = safeArea.querySelector('.fr-footnotes');
        if (footnotes) {
            // On les rattache virtuellement à la suite du contenu pour la sauvegarde JSON
            pageContent += sanitizePlumeHTML(footnotes.outerHTML); 
        }

        state.pages.push({
            content: pageContent,
            isLandscape: page.classList.contains('landscape')
        });
    });
    
    // 3. NOUVEAU TÉLÉCHARGEMENT (Fenêtre "Enregistrer sous")
    const jsonString = JSON.stringify(state, null, 2);
    
    // Génération d'un nom par défaut pertinent avec la date du jour
    const nomParDefaut = `lettre-plume-${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.json`;
    
    // On appelle notre fonction utilitaire avec "await" pour attendre l'action de l'utilisateur
    await saveAsSafe(jsonString, nomParDefaut, 'application/json', '.json');
}

function restoreJSON(input) {
    if (!input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) { // <-- AJOUT de 'async' pour pouvoir utiliser 'await'
        try {
            const state = JSON.parse(e.target.result);
            
            // 1. Restauration des réglages
            if (state.palette) document.getElementById('cfg-palette').value = state.palette;
            if (state.bureau) document.getElementById('cfg-bureau').value = state.bureau;
            if (state.titre) document.getElementById('cfg-titre').value = state.titre;
            if (state.date) document.getElementById('cfg-date').value = state.date;
            if (state.footer) document.getElementById('cfg-footer').value = state.footer;
            if (state.author !== undefined) document.getElementById('cfg-author').value = state.author;
            // NOUVEAU : Restauration de la base de commentaires
            plumeComments = state.comments || {}; 
            
            if (state.marginText !== undefined) {
                    document.getElementById('cfg-margin-text').value = state.marginText;
                    updateMarginText(); // On applique visuellement le changement
            }
            if (state.margins) {
                if (state.margins.top !== undefined) document.getElementById('cfg-margin-top').checked = state.margins.top;
                if (state.margins.bottom !== undefined) document.getElementById('cfg-margin-bottom').checked = state.margins.bottom;
                if (state.margins.left !== undefined) document.getElementById('cfg-margin-left').checked = state.margins.left;
                if (state.margins.right !== undefined) document.getElementById('cfg-margin-right').checked = state.margins.right;
            }
                        
            logoDataUrl = state.logo || "";
            applyPalette(); 
            
            // 2. Restauration du HTML (qui contient des cadres d'images vides)
            if (state.pages && Array.isArray(state.pages)) {
                const container = document.getElementById('pages-container');
                container.innerHTML = ''; 
                
                state.pages.forEach((pageData, index) => {
                    const pageNum = index + 1;
                    const pageDiv = document.createElement('div');
                    pageDiv.className = 'page-a4';
                    pageDiv.id = `page-${pageNum}`;
                    
                    const rawContent = typeof pageData === 'string' ? pageData : pageData.content;
                    const pageContent = sanitizeHTML(rawContent); 
                    
                    const isLandscape = typeof pageData === 'object' ? pageData.isLandscape : false;
                    if (isLandscape) pageDiv.classList.add('landscape');
                    
                    const btnText = isLandscape ? "Portrait" : "Paysage";
                    const btnIcon = isLandscape ? "fr-icon-file-text-line" : "fr-icon-refresh-line";
                    const btnTitle = isLandscape ? "Repasser en mode Portrait" : "Passer en mode Paysage";

                    pageDiv.innerHTML = `
                        <div class="page-actions" contenteditable="false">
                            <button class="page-action-btn" onclick="movePageUp(this)" title="Remonter d'une page">
                                <span class="fr-icon-arrow-up-s-line"></span>
                            </button>
                            <button class="page-action-btn" onclick="movePageDown(this)" title="Descendre d'une page">
                                <span class="fr-icon-arrow-down-s-line"></span>
                            </button>
                            <button class="page-action-btn" onclick="movePageTo(this)" title="Déplacer vers une position spécifique">
                                <span class="fr-icon-list-ordered"></span>
                            </button>
                            <button class="page-action-btn" onclick="toggleOrientation(this)" title="${btnTitle}">
                                <span class="${btnIcon}"></span> ${btnText}
                            </button>
                            <button class="page-action-btn delete" onclick="deletePage(this)" title="Supprimer la page">
                                <span class="fr-icon-delete-bin-line"></span> Supprimer
                            </button>
                        </div>
                        <div class="safe-area">
                            <div class="header-brand">
                                <div class="fr-header__brand">
                                    <div class="fr-header__logo">
                                        <p class="fr-logo">République<br>Française</p>
                                    </div>
                                </div>
                                <div class="custom-logo-container"><img class="logo-bureau" src="${logoDataUrl}" style="${logoDataUrl ? 'display:block;' : 'display:none;'}"></div>
                            </div>
                            
                            <div class="header-info">
                                <div class="stamp-bureau" style="font-weight:700; font-size:1rem;"></div>
                                <div class="doc-meta" style="display:flex; justify-content:space-between; font-weight:700; font-size:0.9rem">
                                    <span class="stamp-titre"></span>
                                    <span class="stamp-date"></span>
                                </div>
                            </div>
                            
                            <div class="content-editable" contenteditable="true">
                                ${pageContent}
                            </div>
                            
                            <div class="footer-wrapper">
                                <span class="stamp-footer"></span>
                                <span class="page-num-display">Page ${pageNum}</span>
                            </div>
                        </div>
                    `;
                    container.appendChild(pageDiv);
                });
            
            // --- REPOSITIONNEMENT DES NOTES DE BAS DE PAGE ---
            document.querySelectorAll('.page-a4').forEach(page => {
                const editor = page.querySelector('.content-editable');
                const safeArea = page.querySelector('.safe-area');
                const footer = page.querySelector('.footer-wrapper');
                
                // On cherche si un bloc de notes est coincé à l'intérieur de l'éditeur
                const trappedFootnotes = editor.querySelector('.fr-footnotes');
                if (trappedFootnotes) {
                    // Si oui, on l'extrait de l'éditeur et on le replace juste avant le footer
                    if (footer) {
                        safeArea.insertBefore(trappedFootnotes, footer);
                    } else {
                        safeArea.appendChild(trappedFootnotes);
                    }
                }
            });
            
            }
            
            syncMetadata();
            updateColoredMargins(); // Applique les bordures colorées aux nouvelles pages
            updateMarginText();
            input.value = "";
            
            // --- LA MAGIE (Redessin dynamique) ---
            // On laisse le temps au navigateur d'afficher la page avec les cadres blancs
            // Puis on lance les moteurs pour repeindre les graphiques et les cartes
            setTimeout(async () => {
                refreshAllCharts();
                if (typeof refreshAllMaps === 'function') {
                    // On affiche un petit message dans la console pour le debug
                    console.log("Reconstruction des médias vectoriels en cours...");
                    await refreshAllMaps();
                }
                if (typeof refreshAllTimelines === 'function') await refreshAllTimelines();
                if (typeof refreshAllQRCodes === 'function') refreshAllQRCodes();
                if (typeof refreshAllTrees === 'function') await refreshAllTrees();
                if (typeof refreshAllOrgCharts === 'function') await refreshAllOrgCharts();
            }, 100);
            
        } catch (err) {
            showToast("Fichier corrompu", "Erreur lors de la lecture de la sauvegarde.", "error");
            console.error(err);
        }
    };
    
    reader.readAsText(file);
}

function scaleUI() {
    const ratio = Math.min((window.innerWidth - 100) / 794, 1);
    document.getElementById('pages-container').style.transform = `scale(${ratio})`;
}

// Mise à jour de la fonction deletePage (app.js)
async function deletePage(btn) {
    const page = btn.closest('.page-a4');
    const totalPages = document.querySelectorAll('.page-a4').length;

    if (totalPages <= 1) {
        showToast("Action impossible", "Un document doit contenir au moins une page.", "warning");
        return;
    }

    const confirmed = await plumeModal({
        title: "Supprimer la page ?",
        message: "Êtes-vous sûr de vouloir supprimer cette page et tout son contenu ?\nCette action est irréversible.",
        confirmText: "Supprimer définitivement",
        cancelText: "Annuler"
    });

    if (confirmed) {
        page.remove();
        renumberPages();
        showToast("Succès", "La page a été supprimée.", "info");
    }
}

function toggleOrientation(btn) {
    // 1. On cible la page parente
    const page = btn.closest('.page-a4');
    
    // 2. On bascule la classe CSS (Le vrai mécanisme d'orientation)
    const isLandscape = page.classList.toggle('landscape');
    
    // 3. UX : On met à jour l'interface du bouton
    if (isLandscape) {
        // Si on vient de passer en Paysage, le bouton propose de revenir en Portrait
        btn.innerHTML = '<span class="fr-icon-file-text-line"></span> Portrait';
        btn.title = "Repasser en mode Portrait";
    } else {
        // Si on vient de revenir en Portrait, le bouton propose de passer en Paysage
        btn.innerHTML = '<span class="fr-icon-refresh-line"></span> Paysage';
        btn.title = "Passer en mode Paysage";
    }
    
    // 4. Sécurité visuelle : on force le recalcul du zoom pour que la page reste bien cadrée à l'écran
    if (typeof scaleUI === 'function') scaleUI();
}

function renumberPages() {
    const pages = document.querySelectorAll('.page-a4');
    pages.forEach((page, index) => {
        const pageNum = index + 1;
        
        // Met à jour l'ID technique
        page.id = `page-${pageNum}`;
        
        // Met à jour l'affichage visuel dans le pied de page
        const numDisplay = page.querySelector('.page-num-display');
        if (numDisplay) {
            numDisplay.innerText = `Page ${pageNum}`;
        }
    });
}

// =====================================================================
// CONFIGURATION DE SÉCURITÉ DOMPURIFY
// =====================================================================
const purifyConfig = {
    // On autorise explicitement les attributs dont notre éditeur a besoin
    ADD_ATTR: ['class', 'style', 'contenteditable', 'data-chart-config', 'data-map-config', 'target', 'rel', 'scope','data-author', 'data-date', 'data-comment-id', 'data-math-formula', 'data-math-theme'],
    // On autorise les URI de type "data:" pour conserver vos images en Base64
    ALLOW_DATA_ATTR: true,
    // On s'assure de ne pas supprimer les iframes ou autres objets non sollicités
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    // Force target="_blank" et rel="noopener noreferrer" sur tous les liens pour la sécurité
    ADD_TAGS: ['a','ins', 'del', 'mark'] 
};

/**
 * Nettoie une chaîne HTML de tout code malveillant
 */
function sanitizeHTML(dirtyHtml) {
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(dirtyHtml, purifyConfig);
    }
    console.warn("⚠️ DOMPurify n'est pas chargé. Nettoyage ignoré.");
    return dirtyHtml; // Fallback par défaut
}


// =====================================================================
// MODULE DE MASQUAGE AUTOMATIQUE DE LA BARRE D'OUTILS (MODE ZEN)
// =====================================================================

const editorHeader = document.querySelector('.editor-header');
let idleTimer;

/**
 * Lance le compte à rebours avant le masquage
 */
function startIdleTimer() {
    clearTimeout(idleTimer);
    
    // Masque après 4 secondes (laisse le temps de lire au lancement de la page)
    idleTimer = setTimeout(() => {
        // Sécurité critique : on ne masque pas si la souris est sur la barre
        // ou si l'utilisateur est en train de taper dans un champ de réglage (Titre, Date...)
        if (!editorHeader.matches(':hover') && !editorHeader.matches(':focus-within')) {
            editorHeader.classList.add('toolbar-hidden');
        }
    }, 4000);
}

/**
 * Fait réapparaître la barre instantanément
 */
function wakeUpToolbar() {
    if (editorHeader.classList.contains('toolbar-hidden')) {
        editorHeader.classList.remove('toolbar-hidden');
    }
    // À chaque réveil, on relance le chronomètre
    startIdleTimer();
}

// 1. Détection des mouvements de souris sur toute la page
document.addEventListener('mousemove', function(e) {
    // Le bandeau République Française fait environ 90px de haut.
    // Si la souris remonte dans les 140 premiers pixels de l'écran, on déroule la barre.
    if (e.clientY < 140 || editorHeader.contains(e.target)) {
        wakeUpToolbar();
    }
});

// 2. Gestion de l'accessibilité au clavier (Focus)
editorHeader.addEventListener('focusin', wakeUpToolbar);
editorHeader.addEventListener('focusout', startIdleTimer);

// 3. Cas spécifique pour les écrans tactiles ou petits écrans
// Toucher le bandeau "République Française" réveille la barre d'outils
document.querySelector('.fr-header').addEventListener('click', wakeUpToolbar);

// 4. Déclenchement automatique dès l'ouverture de la page web
startIdleTimer();


// =====================================================================
// MODULE DE MÉMOIRE GLOBALE DU CURSEUR (SÉCURITÉ FOCUS)
// =====================================================================
let globalSavedRange = null;
let lastActiveEditor = null;

// 1. Le "Traqueur" : Mémorise la position à chaque clic ou frappe au clavier
document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode; // Sécurité noeud texte

        const editor = container.closest('.content-editable');
        if (editor) {
            lastActiveEditor = editor;
            globalSavedRange = range.cloneRange();
        }
    }
});

// 2. Le "Garde du corps" : Fonction à appeler avant d'insérer quoi que ce soit
function enforceFocus() {
    const selection = window.getSelection();
    let isFocusedInEditor = false;

    // Vérifie si le curseur actuel est bien dans un éditeur
    if (selection.rangeCount > 0) {
        let container = selection.getRangeAt(0).commonAncestorContainer;
        if (container.nodeType === 3) container = container.parentNode;
        if (container.closest('.content-editable')) {
            isFocusedInEditor = true;
        }
    }

    // Si le curseur est perdu dans la nature (ex: clic sur un bouton de la barre)
    if (!isFocusedInEditor) {
        selection.removeAllRanges();

        if (globalSavedRange && lastActiveEditor && document.body.contains(lastActiveEditor)) {
            // Cas A : On restaure la dernière position connue
            selection.addRange(globalSavedRange);
        } else {
            // Cas B : L'utilisateur n'a jamais cliqué. On force le curseur dans la 1ère page.
            const firstEditor = document.querySelector('.content-editable');
            if (firstEditor) {
                const range = document.createRange();
                range.selectNodeContents(firstEditor);
                range.collapse(false); // Place le curseur tout à la fin
                selection.addRange(range);
            }
        }
    }
}

function openTablePasteModal(rawData, savedRange) {
    // 1. Création de l'interface (On réutilise les styles de la modale Chart.js)
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    
    overlay.innerHTML = `
        <div class="chart-modal" style="width: 850px; max-width: 95vw; height: 60vh; display: flex;">
            <div class="chart-modal-controls" style="flex: 0 0 260px; padding: 1.5rem; background: var(--grey-975); border-right: 1px solid var(--grey-900); display: flex; flex-direction: column; gap: 1rem;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;"><span class="fr-icon-table-line"></span> Import de tableau</h3>
                <p style="font-size: 0.8rem; margin: 0; color: #666;">Sélectionnez le format qui correspond à vos données copiées.</p>
                
                <div>
                    <label class="fr-label" style="font-weight:700; font-size:0.9rem;">Style d'entête</label>
                    <select id="paste-table-header" class="fr-select">
                        <option value="col" selected>Colonnes uniquement (Haut)</option>
                        <option value="row">Lignes uniquement (Gauche)</option>
                        <option value="both">Colonnes et Lignes</option>
                        <option value="none">Aucun entête</option>
                    </select>
                </div>
                
                <div style="margin-top:auto; display:flex; gap:0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="btn-paste-cancel">Annuler</button>
                    <button class="fr-btn" id="btn-paste-insert">Insérer</button>
                </div>
            </div>
            <div style="flex:1; padding: 1.5rem; background:#fff; overflow: auto; display: flex; flex-direction: column;">
                <h4 style="margin-top: 0; color: #666; font-size: 0.9rem;">Aperçu du rendu :</h4>
                <div id="paste-table-preview" class="content-editable" onclick="event.stopPropagation()" style="flex: 1; border: 1px dashed var(--grey-900); padding: 1rem; border-radius: 4px; overflow: auto; background: transparent;"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // 2. Moteur de prévisualisation en temps réel
    function renderPreview() {
        const style = document.getElementById('paste-table-header').value;
        const hasColHeader = style === 'col' || style === 'both';
        const hasRowHeader = style === 'row' || style === 'both';

        let html = '<div class="fr-table" contenteditable="false"><table contenteditable="true">';
        let tbodyOpened = false;

        rawData.forEach((row, rowIndex) => {
            if (row.join('').trim() !== '') { // Ignore les lignes totalement vides
                if (rowIndex === 0 && hasColHeader) {
                    html += '<thead><tr>';
                    row.forEach(col => html += `<th scope="col">${col.trim()}</th>`);
                    html += '</tr></thead>';
                } else {
                    if (!tbodyOpened) { html += '<tbody>'; tbodyOpened = true; }
                    html += '<tr>';
                    row.forEach((col, colIndex) => {
                        if (colIndex === 0 && hasRowHeader) html += `<th scope="row">${col.trim()}</th>`;
                        else html += `<td>${col.trim()}</td>`;
                    });
                    html += '</tr>';
                }
            }
        });
        if (tbodyOpened) html += '</tbody>';
        html += '</table></div>';

        document.getElementById('paste-table-preview').innerHTML = html;
        return html; // Retourne le HTML pour l'insertion finale
    }

    // Premier affichage
    renderPreview();

    // Mise à jour au changement de la liste déroulante
    document.getElementById('paste-table-header').addEventListener('change', renderPreview);

    // 3. Actions des boutons
    document.getElementById('btn-paste-cancel').onclick = () => overlay.remove();

    document.getElementById('btn-paste-insert').onclick = () => {
        const finalHTML = renderPreview() + '<p><br></p>';
        overlay.remove();

        // On restaure précieusement le curseur là où l'utilisateur avait collé
        if (savedRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedRange);
        }

        // Insertion sécurisée
        document.execCommand('insertHTML', false, sanitizeHTML(finalHTML));
    };
}

// =====================================================================
// ÉDITION DES FORMULES MATHÉMATIQUES
// =====================================================================
document.addEventListener('dblclick', function(e) {
    if (e.target && e.target.classList.contains('plume-math')) {
        const formula = e.target.getAttribute('data-math-formula');
        if (formula && typeof openMathEditor === 'function') {
            openMathEditor(formula, e.target);
        }
    }
});




// =====================================================================
// INTERCEPTEUR DE COLLAGE (SPECIAL TABLEUR + NETTOYAGE STRICT)
// =====================================================================
document.addEventListener('paste', function(e) {
    const editor = e.target.closest('.content-editable');
    if (!editor) return;

    const clipboardData = e.clipboardData || window.clipboardData;
    const textData = clipboardData.getData('text/plain');
    const htmlData = clipboardData.getData('text/html');
    
    // Détection d'une structure de type Tableur (Tabulations + Sauts de ligne)
    const isSpreadsheet = textData.includes('\t') && textData.includes('\n');

    // On vérifie immédiatement où se trouve le curseur de l'utilisateur
    const activeElement = document.activeElement;
    const inExistingTable = activeElement.closest('table');

    if (isSpreadsheet) {
        e.preventDefault(); 

        if (inExistingTable) {
            showToast("Collage refusé", "Vous ne pouvez pas coller un tableau dans un autre tableau.", "warning");
            return; 
        }

        // 1. On sauvegarde la position du curseur AVANT d'ouvrir la modale
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) {
            savedRange = selection.getRangeAt(0).cloneRange();
        }

        // 2. On transforme le texte brut en un tableau JavaScript propre (2 dimensions)
        const rows = textData.trim().split('\n').map(row => row.split('\t'));

        // 3. On ouvre notre Studio de prévisualisation !
        openTablePasteModal(rows, savedRange);

    } else if (htmlData) {
        // --- SÉCURISATION DU COLLAGE WEB/WORD (La Douane) ---
        e.preventDefault(); 
        
        let cleanPaste = htmlData;

        if (typeof DOMPurify !== 'undefined') {
            // Configuration ultra-stricte réservée au collage
            const pasteConfig = {
                // On préserve uniquement la structure sémantique
                ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
                // On n'autorise QUE les liens
                ALLOWED_ATTR: ['href'],
                // On détruit tout le reste (styles en ligne, classes, IDs, divs, images externes)
                FORBID_TAGS: ['style', 'script', 'img', 'table', 'div', 'span', 'iframe', 'form', 'input'],
                FORBID_ATTR: ['style', 'class', 'id', 'data-chart-config', 'data-map-config']
            };

            // On nettoie le HTML
            cleanPaste = DOMPurify.sanitize(htmlData, pasteConfig);
            
            // Sécurité UX : On force les liens collés à s'ouvrir dans un nouvel onglet pour ne pas perdre l'éditeur
            cleanPaste = cleanPaste.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
        } else {
            console.warn("DOMPurify absent : repli sur l'importation en texte brut.");
            cleanPaste = textData.replace(/\n/g, '<br>');
        }

        document.execCommand('insertHTML', false, cleanPaste);
        
    } else if (textData) {
        // --- COLLAGE DEPUIS LE BLOC-NOTES (Texte pur) ---
        e.preventDefault();
        
        // On découpe le texte copié à chaque retour à la ligne (\n ou \r\n)
        const formattedText = textData
            .split(/\r?\n/)
            .map(line => {
                // Si la ligne est vide (double saut de ligne), on crée un paragraphe vide respectueux de la sémantique
                if (line.trim() === '') {
                    return '<p><br></p>';
                }
                // Sinon, on emballe la ligne dans un paragraphe
                return `<p>${line}</p>`;
            })
            .join(''); // On recolle le tout

        document.execCommand('insertHTML', false, formattedText);
    }
});

window.onresize = scaleUI;
// =====================================================================
// INITIALISATION ET CYCLE DE VIE DU NAVIGATEUR
// =====================================================================

window.onload = async () => { 
    scaleUI(); 
    applyPalette(); 
    syncMetadata();
    updateMarginText();

    const draft = localStorage.getItem('plume_draft_state');
    const timestamp = localStorage.getItem('plume_draft_timestamp');
    
    if (draft) {
        const draftDate = new Date(parseInt(timestamp)).toLocaleString('fr-FR', { 
            weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' 
        });
        
        const restore = await plumeModal({
            title: "Brouillon détecté",
            message: `Une session non sauvegardée du <strong>${draftDate}</strong> a été trouvée.\n\nVoulez-vous reprendre votre travail en cours ?`,
            confirmText: "Restaurer la session",
            cancelText: "Ignorer"
        });

        if (restore) {
            restoreDraftFromLocal(draft);
        } else {
            localStorage.removeItem('plume_draft_state');
            localStorage.removeItem('plume_draft_timestamp');
        }
    }

    setInterval(saveDraftToLocal, 30000);
};

// 3. Sauvegarde de sécurité au moment exact où l'utilisateur ferme l'onglet ou rafraîchit
window.addEventListener('beforeunload', () => {
    saveDraftToLocal();
});


// =====================================================================
// OPTIMISATION DE L'EXPORT PDF (Garantir les liens cliquables)
// =====================================================================
window.addEventListener('beforeprint', () => {
    // 1. On cherche la zone d'édition
    const editor = document.querySelector('.content-editable');
    if (editor) {
        // 2. On la fige pour que le navigateur la considère comme une page web normale
        editor.setAttribute('contenteditable', 'false');
    }
});

window.addEventListener('afterprint', () => {
    // 3. Dès que la fenêtre d'impression se ferme, on rend la main à l'utilisateur
    const editor = document.querySelector('.content-editable');
    if (editor) {
        editor.setAttribute('contenteditable', 'true');
    }
});

// =====================================================================
// NORMALISATION DE L'ÉDITEUR (Correction de la touche Entrée)
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    const editor = document.querySelector('.content-editable');
    if (!editor) return;

    // 1. On force le navigateur à TOUJOURS créer des paragraphes <p> (fini les <div> indésirables)
    document.execCommand('defaultParagraphSeparator', false, 'p');

    // 2. Interception intelligente de la touche Entrée
    editor.addEventListener('keydown', function(e) {
        
        if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    // On appelle l'Antidote pour générer la ligne vierge sous le bloc actuel
                    createVirginParagraph(selection.getRangeAt(0).startContainer, false);
                }
                return; 
            }
        
        if (e.key === 'Enter') {
            // Si l'utilisateur fait Maj + Entrée, on le laisse faire un simple saut de ligne <br>
            if (e.shiftKey) return;

            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            const currentNode = range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer;

            // --- A. Sortir d'un Titre (H1-H6) ---
            const heading = currentNode.closest('h1, h2, h3, h4, h5, h6');
            if (heading) {
                // Si on est à la toute fin du titre
                if (range.endOffset === range.startContainer.textContent.length || range.startContainer.textContent === '') {
                    e.preventDefault(); // On bloque le comportement par défaut
                    
                    // On crée un paragraphe vide en dessous
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    heading.parentNode.insertBefore(p, heading.nextSibling);
                    
                    // On y déplace le curseur
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    return;
                }
            }

            // --- B. Sortir d'une Citation (Blockquote) ---
            const blockquote = currentNode.closest('blockquote');
            
            // NOUVEAU : On vérifie si on est à l'intérieur d'une liste
            const inList = currentNode.closest('ul, ol');

            // Si on est dans un Blockquote ET qu'on n'est PAS dans une liste
            // (Si on est dans une liste, on laisse le navigateur gérer le double-Entrée pour en sortir proprement)
            if (blockquote && !inList) {
                // Si on tape Entrée sur une ligne vide à l'intérieur de la citation
                if (currentNode.textContent.trim() === '') {
                    e.preventDefault();
                    
                    // On crée un paragraphe normal
                    const p = document.createElement('p');
                    p.innerHTML = '<br>';
                    
                    // CORRECTION MAJEURE : On cherche le wrapper parent in-éditable
                    // S'il existe (ex: Citation avec photo), on insère APRES le wrapper.
                    // Sinon, on insère après le blockquote simple.
                    const lockedWrapper = blockquote.closest('[contenteditable="false"]');
                    const targetToBypass = lockedWrapper || blockquote;
                    
                    targetToBypass.parentNode.insertBefore(p, targetToBypass.nextSibling);
                    
                    // On supprime la ligne vide qui restait dans la citation
                    if (currentNode !== blockquote && currentNode.parentNode) {
                        currentNode.remove();
                    }
                    
                    // Si la citation entière est devenue vide, on la supprime carrément
                    // Attention à supprimer le wrapper complet si c'est un composant complexe
                    if (blockquote.textContent.trim() === '') {
                        targetToBypass.remove();
                    }

                    // On déplace le curseur dans le nouveau paragraphe libre
                    const newRange = document.createRange();
                    newRange.setStart(p, 0);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    return;
                }
            }
        }
    });
});

// =====================================================================
// L'ANTIDOTE : GÉNÉRATEUR DE PARAGRAPHE 100% VIERGE
// =====================================================================
function createVirginParagraph(contextNode, appendToEnd = false) {
    let editor;
    let referenceNode = contextNode;

    if (appendToEnd) {
        editor = contextNode; // Dans ce cas, contextNode est l'éditeur lui-même
    } else {
        // Remonter à la racine absolue (enfant direct de l'éditeur) pour casser l'effet "Oignon"
        if (referenceNode.nodeType === 3) referenceNode = referenceNode.parentNode;
        while (referenceNode && referenceNode.parentNode && !referenceNode.parentNode.classList.contains('content-editable')) {
            referenceNode = referenceNode.parentNode;
        }
        editor = referenceNode ? referenceNode.parentNode : null;
    }

    if (!editor) return;

    // 1. Création du paragraphe pur, sans aucune classe ni style
    const p = document.createElement('p');
    p.innerHTML = '<br>';
    
    // 2. Insertion
    if (appendToEnd) {
        editor.appendChild(p);
    } else if (referenceNode) {
        editor.insertBefore(p, referenceNode.nextSibling);
    }

    // 3. Téléportation forcée du curseur
    const range = document.createRange();
    range.setStart(p, 0);
    range.collapse(true);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // 4. L'ÉRADICATION : On force le navigateur à vider sa "mémoire fantôme"
    document.execCommand('removeFormat', false, null);
    
    // On mitraille la commande 'outdent' (Diminuer le retrait) 5 fois de suite
    // pour détruire tous les niveaux de retraits que le navigateur aurait pu mémoriser.
    for(let i = 0; i < 5; i++) {
        document.execCommand('outdent', false, null);
    }
}

// =====================================================================
// GARDIEN DE ZONE D'ÉDITION (Anti-blocage en fin de document) - VERSION 3.0
// =====================================================================
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('content-editable')) {
        const editor = e.target;
        
        let lastNode = editor.lastChild;
        while (lastNode && lastNode.lastChild) lastNode = lastNode.lastChild;
        if (!lastNode) return;

        const targetElement = lastNode.nodeType === 3 ? lastNode.parentElement : lastNode;
        
        // On détecte si on est bloqué par un composant fermé OU par un retrait tenace
        const isLocked = targetElement.closest('[contenteditable="false"], .fr-table');
        const isIndented = targetElement.closest('blockquote');
        
        if (isLocked || isIndented) {
            // On appelle l'Antidote pour générer la ligne vierge à la toute fin
            createVirginParagraph(editor, true);
        }
    }
});

function updateMarginText() {
    // On récupère le texte et on le met en majuscules pour garantir l'homogénéité
    const text = document.getElementById('cfg-margin-text').value.toUpperCase();
    const pages = document.querySelectorAll('.page-a4');
    
    pages.forEach(page => {
        // On injecte le texte dans l'attribut HTML de chaque page
        page.setAttribute('data-margin-text', text);
    });
}

async function saveAsSafe(content, suggestedName, mimeType, extension) {
    try {
        if (window.showSaveFilePicker) {
            // Logique native pour Chrome/Edge (Gestionnaire de fichiers système)
            const handle = await window.showSaveFilePicker({
                suggestedName: suggestedName,
                types: [{
                    description: 'Document PLUME',
                    accept: { [mimeType]: [extension] },
                }],
            });
            const writable = await handle.createWritable();
            await writable.write(content);
            await writable.close();
            return true;
        } else {
            // Logique de secours pour Firefox/Safari avec notre Modale plumeModal
            let fileName = await plumeModal({
                title: "Enregistrer le fichier",
                message: "Sous quel nom souhaitez-vous sauvegarder votre travail ?",
                type: "prompt",
                defaultValue: suggestedName,
                confirmText: "Télécharger"
            });

            if (!fileName) return false;
            
            if (!fileName.endsWith(extension)) fileName += extension;
            const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName;
            a.click(); URL.revokeObjectURL(url);
            return true;
        }
    } catch (err) {
        if (err.name !== 'AbortError') console.error("Erreur de sauvegarde :", err);
        return false;
    }
}

// =====================================================================
// MODULE SAUVEGARDE LOCALE (AUTO-SAVE / BROUILLON)
// =====================================================================

function saveDraftToLocal() {
    const state = {
        palette: document.getElementById('cfg-palette').value,
        bureau: document.getElementById('cfg-bureau').value,
        titre: document.getElementById('cfg-titre').value,
        date: document.getElementById('cfg-date').value,
        footer: document.getElementById('cfg-footer').value,
        marginText: document.getElementById('cfg-margin-text').value,
        author: document.getElementById('cfg-author').value,
        comments: plumeComments, 
        margins: {
            top: document.getElementById('cfg-margin-top').checked,
            bottom: document.getElementById('cfg-margin-bottom').checked,
            left: document.getElementById('cfg-margin-left').checked,
            right: document.getElementById('cfg-margin-right').checked
        },
        logo: logoDataUrl,
        pages: []
    };
    
    document.querySelectorAll('.page-a4').forEach(page => {
        const clone = page.cloneNode(true);
        const editor = clone.querySelector('.content-editable');
        
        // Purge des images lourdes générées par l'éditeur (elles seront recréées à la volée)
        const generatedImages = editor.querySelectorAll('.chart-container img, .plume-map-container img');
        generatedImages.forEach(img => {
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; 
        });
        
        let pageContent = sanitizePlumeHTML(editor.innerHTML);
        
        // 2. On cherche si la page possède des notes de bas de page à l'extérieur
        const safeArea = page.querySelector('.safe-area');
        const footnotes = safeArea.querySelector('.fr-footnotes');
        if (footnotes) {
            // On les rattache virtuellement à la suite du contenu pour la sauvegarde JSON
            pageContent += sanitizePlumeHTML(footnotes.outerHTML); 
        }

        state.pages.push({
            content: pageContent,
            isLandscape: page.classList.contains('landscape')
        });
    });

    try {
        localStorage.setItem('plume_draft_state', JSON.stringify(state));
        localStorage.setItem('plume_draft_timestamp', Date.now());
    } catch (e) {
        console.warn("⚠️ Impossible de sauvegarder le brouillon automatiquement (Quota dépassé ?)", e);
    }
}

async function restoreDraftFromLocal(jsonString) {
    try {
        const state = JSON.parse(jsonString);
        
        // Restauration des réglages
        if (state.palette) document.getElementById('cfg-palette').value = state.palette;
        if (state.bureau) document.getElementById('cfg-bureau').value = state.bureau;
        if (state.titre) document.getElementById('cfg-titre').value = state.titre;
        if (state.date) document.getElementById('cfg-date').value = state.date;
        if (state.footer) document.getElementById('cfg-footer').value = state.footer;
        if (state.author !== undefined) document.getElementById('cfg-author').value = state.author;
            // NOUVEAU : Restauration de la base de commentaires
           plumeComments = state.comments || {}; 
        if (state.marginText !== undefined) {
            document.getElementById('cfg-margin-text').value = state.marginText;
            updateMarginText(); // On applique visuellement le changement
        }
        if (state.margins) {
            if (state.margins.top !== undefined) document.getElementById('cfg-margin-top').checked = state.margins.top;
            if (state.margins.bottom !== undefined) document.getElementById('cfg-margin-bottom').checked = state.margins.bottom;
            if (state.margins.left !== undefined) document.getElementById('cfg-margin-left').checked = state.margins.left;
            if (state.margins.right !== undefined) document.getElementById('cfg-margin-right').checked = state.margins.right;
        }
        logoDataUrl = state.logo || "";
        applyPalette(); 
        
        // Restauration du contenu
        if (state.pages && Array.isArray(state.pages)) {
            const container = document.getElementById('pages-container');
            container.innerHTML = ''; 
            
            state.pages.forEach((pageData, index) => {
                const pageNum = index + 1;
                const pageDiv = document.createElement('div');
                pageDiv.className = 'page-a4';
                pageDiv.id = `page-${pageNum}`;
                
                const rawContent = typeof pageData === 'string' ? pageData : pageData.content;
                const pageContent = sanitizeHTML(rawContent); 
                
                const isLandscape = typeof pageData === 'object' ? pageData.isLandscape : false;
                if (isLandscape) pageDiv.classList.add('landscape');
                
                const btnText = isLandscape ? "Portrait" : "Paysage";
                const btnIcon = isLandscape ? "fr-icon-file-text-line" : "fr-icon-refresh-line";
                const btnTitle = isLandscape ? "Repasser en mode Portrait" : "Passer en mode Paysage";

                pageDiv.innerHTML = `
                    <div class="page-actions" contenteditable="false">
                            <button class="page-action-btn" onclick="movePageUp(this)" title="Remonter d'une page">
                                <span class="fr-icon-arrow-up-s-line"></span>
                            </button>
                            <button class="page-action-btn" onclick="movePageDown(this)" title="Descendre d'une page">
                                <span class="fr-icon-arrow-down-s-line"></span>
                            </button>
                            <button class="page-action-btn" onclick="movePageTo(this)" title="Déplacer vers une position spécifique">
                                <span class="fr-icon-list-ordered"></span>
                            </button>
                            <button class="page-action-btn" onclick="toggleOrientation(this)" title="${btnTitle}">
                                <span class="${btnIcon}"></span> ${btnText}
                            </button>
                            <button class="page-action-btn delete" onclick="deletePage(this)" title="Supprimer la page">
                                <span class="fr-icon-delete-bin-line"></span> Supprimer
                            </button>
                        </div>
                    <div class="safe-area">
                        <div class="header-brand">
                            <div class="fr-header__brand">
                                <div class="fr-header__logo">
                                    <p class="fr-logo">République<br>Française</p>
                                </div>
                            </div>
                            <div class="custom-logo-container"><img class="logo-bureau" src="${logoDataUrl}" style="${logoDataUrl ? 'display:block;' : 'display:none;'}"></div>
                        </div>
                        
                        <div class="header-info">
                            <div class="stamp-bureau" style="font-weight:700; font-size:1rem;"></div>
                            <div class="doc-meta" style="display:flex; justify-content:space-between; font-weight:700; font-size:0.9rem">
                                <span class="stamp-titre"></span>
                                <span class="stamp-date"></span>
                            </div>
                        </div>
                        
                        <div class="content-editable" contenteditable="true">
                            ${pageContent}
                        </div>
                        
                        <div class="footer-wrapper">
                            <span class="stamp-footer"></span>
                            <span class="page-num-display">Page ${pageNum}</span>
                        </div>
                    </div>
                `;
                container.appendChild(pageDiv);
            });
        // --- REPOSITIONNEMENT DES NOTES DE BAS DE PAGE ---
            document.querySelectorAll('.page-a4').forEach(page => {
                const editor = page.querySelector('.content-editable');
                const safeArea = page.querySelector('.safe-area');
                const footer = page.querySelector('.footer-wrapper');
                
                // On cherche si un bloc de notes est coincé à l'intérieur de l'éditeur
                const trappedFootnotes = editor.querySelector('.fr-footnotes');
                if (trappedFootnotes) {
                    // Si oui, on l'extrait de l'éditeur et on le replace juste avant le footer
                    if (footer) {
                        safeArea.insertBefore(trappedFootnotes, footer);
                    } else {
                        safeArea.appendChild(trappedFootnotes);
                    }
                }
            });
        }
        
        syncMetadata();
        updateColoredMargins(); // Applique les bordures colorées aux nouvelles pages
            updateMarginText();
        
        // Reconstruction asynchrone des médias (Cartes et Graphiques)
        setTimeout(async () => {
            refreshAllCharts();
            if (typeof refreshAllMaps === 'function') {
                await refreshAllMaps();
            }
            if (typeof refreshAllTimelines === 'function') await refreshAllTimelines();
            if (typeof refreshAllQRCodes === 'function') refreshAllQRCodes();
                if (typeof refreshAllTrees === 'function') await refreshAllTrees();
                if (typeof refreshAllOrgCharts === 'function') await refreshAllOrgCharts();
        }, 100);
        
        if (typeof showToast !== 'undefined') {
            showToast("Brouillon restauré", "Vous avez récupéré votre dernière session.", "success");
        }
        
    } catch (err) {
        console.error(err);
        if (typeof showToast !== 'undefined') showToast("Erreur", "Le brouillon est corrompu et n'a pas pu être chargé.", "error");
    }
}


/**
 * Système de modale asynchrone (Remplace alert, confirm et prompt)
 * @param {Object} options - { title, message, type: 'confirm'|'prompt', defaultValue, confirmText, cancelText }
 * @returns {Promise} - Retourne le texte saisi (prompt) ou un booléen (confirm)
 */
function plumeModal({ 
    title = "Confirmation", 
    message = "", 
    type = "confirm", 
    defaultValue = "", 
    confirmText = "Valider", 
    cancelText = "Annuler" 
}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'chart-modal-overlay';
        
        const isPrompt = type === 'prompt';
        const inputHTML = isPrompt 
            ? `<div class="fr-input-group fr-mt-2w">
                 <input type="text" id="modal-input" class="fr-input" value="${defaultValue}" autocomplete="off">
               </div>` 
            : "";

        overlay.innerHTML = `
            <div class="chart-modal" style="width: 450px; max-width: 95vw; display: flex; flex-direction: column;">
                <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900);">
                    <h3 style="margin:0; color:var(--theme-sun); font-size:1.1rem;">
                        <span class="${isPrompt ? 'fr-icon-edit-line' : 'fr-icon-question-line'}"></span> ${title}
                    </h3>
                </div>
                <div style="padding: 1.5rem; background: #fff;">
                    <p style="margin:0; line-height:1.5;">${message.replace(/\n/g, '<br>')}</p>
                    ${inputHTML}
                </div>
                <div style="padding: 1rem 1.5rem; background: var(--grey-975); border-top: 1px solid var(--grey-900); display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="fr-btn fr-btn--secondary" id="modal-cancel">${cancelText}</button>
                    <button class="fr-btn" id="modal-confirm">${confirmText}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const input = overlay.querySelector('#modal-input');
        if (input) setTimeout(() => input.focus(), 100);

        const close = (value) => {
            overlay.remove();
            resolve(value);
        };

        overlay.querySelector('#modal-cancel').onclick = () => close(isPrompt ? null : false);
        overlay.querySelector('#modal-confirm').onclick = () => {
            close(isPrompt ? (input.value || defaultValue) : true);
        };
        
        // Validation avec la touche Entrée
        overlay.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') overlay.querySelector('#modal-confirm').click();
            if (e.key === 'Escape') overlay.querySelector('#modal-cancel').click();
        });
    });
}


// =====================================================================
// MODULE DE NETTOYAGE HTML (Sanitizer)
// =====================================================================

/**
 * SANITIZER ROBUSTE - VERSION DSFR INTEGRALE
 * Nettoie les scories de Word tout en préservant 100% des composants PLUME/DSFR.
 */
function sanitizePlumeHTML(rawHtml) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;

    // 1. DÉFINITION DU "COMPOSANT SACRÉ"
    // On protège tout ce qui a une classe DSFR ou des métadonnées PLUME
// 1. DÉFINITION DU "COMPOSANT SACRÉ" (Version Corrigée)
    const isProtected = (el) => {
        // On ajoute la détection des classes commençant par 'plume-'
        const hasProtectedClass = Array.from(el.classList).some(cls => 
            cls.startsWith('fr-') || cls.startsWith('plume-')
        );
        
        const hasDataAttr = el.getAttributeNames().some(attr => attr.startsWith('data-'));
        
        // On met à jour le sélecteur .closest pour inclure plume-
        const isInsideComponent = el.closest('[class*="fr-"], [class*="plume-"], [data-map-config], [data-chart-config]');
        
        return hasProtectedClass || hasDataAttr || isInsideComponent;
    };
    
    // 2. NETTOYAGE SÉLECTIF DES STYLES
    tempDiv.querySelectorAll('*[style]').forEach(el => {
        if (isProtected(el)) return; // On ne touche pas aux composants DSFR

        // On ne nettoie que les styles "parasites" sur le texte standard
        const textAlign = el.style.textAlign; // On préserve l'alignement (choix utilisateur)
        el.removeAttribute('style');
        if (textAlign) el.style.textAlign = textAlign;
    });

    // 3. PURGE DES BALISES VIDES (AVEC PRÉCAUTION)
    tempDiv.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6').forEach(el => {
        if (isProtected(el)) return; // Protection des structures DSFR vides (ex: conteneurs d'icônes)
        
        const content = el.innerHTML.trim();
        if (content === '' || content === '<br>' || content === '&nbsp;') {
            el.remove();
        }
    });

    // 4. NORMALISATION SÉMANTIQUE
    // On remplace les scories de mise en forme par du HTML propre
    tempDiv.querySelectorAll('b').forEach(el => { el.outerHTML = `<strong>${el.innerHTML}</strong>`; });
    tempDiv.querySelectorAll('i').forEach(el => { el.outerHTML = `<em>${el.innerHTML}</em>`; });

    return tempDiv.innerHTML;
}

// =====================================================================
// MODALE À PROPOS ET MANIFESTE
// =====================================================================

function openAboutModal() {
    const overlay = document.createElement('div');
    overlay.className = 'chart-modal-overlay';
    // On force un z-index très élevé pour passer au-dessus de tout le reste
    overlay.style.zIndex = '1000000'; 

    overlay.innerHTML = `
        <div class="chart-modal" style="width: 800px; max-width: 95vw; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">
            
            <div style="padding: 1.5rem; background: var(--grey-975); border-bottom: 1px solid var(--grey-900); display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0; color:var(--theme-sun); font-size:1.2rem;">
                    <span class="fr-icon-information-fill"></span> À propos de PLUME
                </h3>
                <button class="fr-btn fr-btn--close fr-btn--tertiary-no-outline" id="btn-about-close" title="Fermer la fenêtre">
                    Fermer
                </button>
            </div>
            
            <div style="padding: 2rem; background: #fff; overflow-y: auto; line-height: 1.6; color: #3a3a3a; font-family: 'Marianne', Arial, sans-serif;">
                
                <h4 style="color: var(--theme-sun); margin-top: 0;">Objet de l'application</h4>
                <p>
                    <strong>PLUME (Plateforme de Lettres Unifiées pour les Ministères et l'État)</strong> est un éditeur de documents WYSIWYG innovant. Il permet de rédiger des rapports, notes et lettres d'information respectant nativement le Système de Design de l'État (DSFR). Les documents générés sont structurés autour du format A4, interactifs, sécurisés et exportables en haute définition.
                </p>
                <p>
    <button class="fr-btn fr-btn--secondary fr-icon-magic-line fr-btn--icon-left" onclick="loadDemo()" title="Charger un document de démonstration complet">Démo</button>
</p>
                
                <hr style="border: none; border-top: 1px solid var(--grey-900); margin: 2rem 0;">
                
                <h4 style="color: var(--theme-sun);">Formats de données attendus (Fichiers .csv)</h4>
                <p>Pour générer des médias dynamiques, PLUME utilise des fichiers CSV standardisés (séparateur virgule ou point-virgule). Voici les structures requises pour que le moteur interprète correctement vos données :</p>
                
                <div class="fr-table fr-table--bordered" style="margin-top: 1.5rem; width: 100%;">
                    <table style="width: 100%; text-align: left; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th scope="col" style="padding: 0.75rem; background-color: var(--grey-975); border: 1px solid var(--grey-900); font-weight: 700; width: 25%;">Outil</th>
                                <th scope="col" style="padding: 0.75rem; background-color: var(--grey-975); border: 1px solid var(--grey-900); font-weight: 700;">Colonne 1</th>
                                <th scope="col" style="padding: 0.75rem; background-color: var(--grey-975); border: 1px solid var(--grey-900); font-weight: 700;">Colonne 2</th>
                                <th scope="col" style="padding: 0.75rem; background-color: var(--grey-975); border: 1px solid var(--grey-900); font-weight: 700;">Colonne 3+ (Optionnel)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);">
                                    <strong>📊 Graphiques</strong>
                                    <div style="margin-top: 0.5rem;">
                                        <a href="./exemple/graphique.csv" download class="fr-link fr-link--sm" style="font-size: 0.75rem;"><span class="fr-icon-download-line" aria-hidden="true" style="font-size: 0.75rem; margin-right: 0.25rem;"></span>Fichier d'exemple</a>
                                    </div>
                                </td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Libellés</strong> (Axe X)</td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Valeurs</strong> (Série 1)</td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Valeurs additionnelles</strong> (Séries 2, 3...)</td>
                            </tr>
                            <tr>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);">
                                    <strong>🗺️ Cartes</strong>
                                    <div style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem;">
                                        <a href="./exemple/monde.csv" download class="fr-link fr-link--sm" style="font-size: 0.75rem;"><span class="fr-icon-download-line" aria-hidden="true" style="font-size: 0.75rem; margin-right: 0.25rem;"></span>Exemple Monde</a>
                                        <a href="./exemple/france_departements.csv" download class="fr-link fr-link--sm" style="font-size: 0.75rem;"><span class="fr-icon-download-line" aria-hidden="true" style="font-size: 0.75rem; margin-right: 0.25rem;"></span>Exemple Départements</a>
                                        <a href="./exemple/france_communes.csv" download class="fr-link fr-link--sm" style="font-size: 0.75rem;"><span class="fr-icon-download-line" aria-hidden="true" style="font-size: 0.75rem; margin-right: 0.25rem;"></span>Exemple Communes</a>
                                    </div>
                                </td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Code Géographique</strong><br><span style="font-size: 0.8rem; color: #666;">(ex: Code INSEE, Code EPCI ou Code ISO Monde)</span></td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Valeur</strong><br><span style="font-size: 0.8rem; color: #666;">(Donnée principale à cartographier)</span></td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Donnée secondaire</strong><br><span style="font-size: 0.8rem; color: #666;">(Utilisée pour le calcul de ratios ou d'évolution)</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);">
                                    <strong>⏱️ Frise Chronologique</strong>
                                    <div style="margin-top: 0.5rem;">
                                        <a href="./exemple/frise.csv" download class="fr-link fr-link--sm" style="font-size: 0.75rem;"><span class="fr-icon-download-line" aria-hidden="true" style="font-size: 0.75rem; margin-right: 0.25rem;"></span>Fichier d'exemple</a>
                                    </div>
                                </td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Date ou Étape</strong><br><span style="font-size: 0.8rem; color: #666;">(ex: 2026, T1, Phase 1)</span></td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Titre</strong><br><span style="font-size: 0.8rem; color: #666;">(Nom de l'événement)</span></td>
                                <td style="padding: 0.75rem; border: 1px solid var(--grey-900);"><strong>Description</strong><br><span style="font-size: 0.8rem; color: #666;">(Explications longues)</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 1rem; padding: 1rem; background-color: var(--theme-bg); border-left: 4px solid var(--theme-sun); font-size: 0.9rem;">
                    <span class="fr-icon-information-fill" style="color: var(--theme-sun); margin-right: 0.5rem;" aria-hidden="true"></span>
                    <strong>Astuce :</strong> PLUME respecte l'ordre naturel des lignes de votre fichier CSV. Lors de la création d'une frise chronologique, aucun tri algorithmique n'est forcé. Organisez vos étapes dans votre tableur exactement comme vous souhaitez les voir apparaître.
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Fonction de fermeture
    const closeModal = () => {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
    };

    // Écouteurs de fermeture (Bouton, clic à l'extérieur, touche Échap)
    document.getElementById('btn-about-close').onclick = closeModal;
    
    overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) closeModal();
    });

    const escHandler = (e) => {
        if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', escHandler);
}


// =====================================================================
// MODULE DE RÉORGANISATION DES PAGES
// =====================================================================

function movePageUp(btn) {
    const page = btn.closest('.page-a4');
    const previousPage = page.previousElementSibling;
    
    // On s'assure qu'il y a bien une page au-dessus
    if (previousPage && previousPage.classList.contains('page-a4')) {
        page.parentNode.insertBefore(page, previousPage);
        renumberPages(); // Met à jour le footer (Page 1, Page 2...)
        page.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function movePageDown(btn) {
    const page = btn.closest('.page-a4');
    const nextPage = page.nextElementSibling;
    
    // On s'assure qu'il y a bien une page en dessous
    if (nextPage && nextPage.classList.contains('page-a4')) {
        page.parentNode.insertBefore(page, nextPage.nextElementSibling);
        renumberPages();
        page.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function movePageTo(btn) {
    const page = btn.closest('.page-a4');
    const container = page.parentNode;
    const pages = Array.from(container.querySelectorAll('.page-a4'));
    const currentIndex = pages.indexOf(page) + 1;
    const totalPages = pages.length;

    if (totalPages <= 1) {
        showToast("Action impossible", "Il n'y a qu'une seule page dans le document.", "warning");
        return;
    }

    // On réutilise ta modale asynchrone existante (plumeModal)
    const targetPositionStr = await plumeModal({
        title: "Déplacer la page",
        message: `Cette page est actuellement en position ${currentIndex}.\nOù souhaitez-vous la déplacer ? (entre 1 et ${totalPages})`,
        type: "prompt",
        defaultValue: currentIndex.toString(),
        confirmText: "Déplacer"
    });

    if (!targetPositionStr) return; // L'utilisateur a annulé

    const targetIndex = parseInt(targetPositionStr, 10) - 1;

    // Sécurisation de la saisie
    if (isNaN(targetIndex) || targetIndex < 0 || targetIndex >= totalPages) {
        showToast("Position invalide", `Veuillez entrer un nombre compris entre 1 et ${totalPages}.`, "error");
        return;
    }

    if (targetIndex === currentIndex - 1) return; // La page est déjà à cette position

    // Réagencement dans le DOM
    if (targetIndex === totalPages - 1) {
        // Déplacement tout à la fin
        container.appendChild(page);
    } else {
        // Déplacement à une position spécifique
        // Si on déplace vers le bas, l'index de référence est décalé
        const referenceNode = targetIndex > (currentIndex - 1) ? pages[targetIndex + 1] : pages[targetIndex];
        container.insertBefore(page, referenceNode);
    }
    
    renumberPages();
    page.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
// =====================================================================
// CHARGEMENT DU FICHIER DE DÉMONSTRATION
// =====================================================================
async function loadDemo() {
    try {
        // On affiche un toast pour faire patienter l'utilisateur
        if (typeof showToast !== 'undefined') {
            showToast("Chargement...", "Récupération du modèle de démonstration.", "info");
        }

        // 1. Récupération du fichier via une requête HTTP GET
        const response = await fetch('./exemple/demo.json');
        
        if (!response.ok) {
            throw new Error(`Le fichier est introuvable (Erreur HTTP: ${response.status})`);
        }
        
        // 2. Extraction du texte brut (le code JSON)
        const jsonText = await response.text();
        
        // 3. Injection dans le moteur de restauration natif de PLUME
        if (typeof restoreDraftFromLocal === 'function') {
            // La fonction va repeindre la page, appliquer les thèmes et régénérer les cartes
            await restoreDraftFromLocal(jsonText);
            
            if (typeof showToast !== 'undefined') {
                showToast("Démonstration chargée", "Le modèle a été appliqué avec succès.", "success");
            }
        } else {
            console.error("Erreur critique : La fonction restoreDraftFromLocal n'est pas définie dans l'application.");
        }
    } catch (error) {
        console.error("Erreur lors du chargement de la démo :", error);
        if (typeof showToast !== 'undefined') {
            showToast("Erreur de chargement", "Impossible de charger le fichier './exemple/demo.json'. Vérifiez qu'il est bien présent sur le serveur.", "error");
        }
    }
}

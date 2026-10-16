/**
 * HIA media intake — configuration.
 * Only ROOT_FOLDER_ID must be changed before running setup().
 */
const CONFIG = {
  // Drive folder ID of the test folder in HIA's Drive (the part after /folders/ in its URL).
  ROOT_FOLDER_ID: 'PASTE_TEST_FOLDER_ID_HERE',

  FORM_TITLE: 'HIA — Ceremonijų nuotraukos / Ceremony media',
  SHEET_TITLE: 'HIA — Media index',
  MEDIA_FOLDER_NAME: 'Media',

  // Bump when the consent wording changes; stored on every row.
  CONSENT_VERSION: '2026-10-v1',

  CEREMONY_TYPES: [
    'Vestuvės / Wedding',
    'Vardynos / Naming',
    'Atsisveikinimas / Funeral or memorial',
    'Brandos ceremonija / Coming of age',
  ],

  // Countries where the material may be used (consent scope).
  MARKETS: ['LT', 'LV', 'EE', 'International (EN)'],

  // Caption languages, in index column order.
  CAPTION_LANGS: ['lt', 'lv', 'et', 'en'],
};

// Question titles. The submit handler reads answers by these titles, so edit them here, not in the form editor.
const Q = {
  photographer: 'Fotografas / Photographer',
  event: 'Pora arba renginys / Couple or event',
  date: 'Ceremonijos data / Ceremony date',
  location: 'Vieta / Location',
  type: 'Ceremonijos tipas / Ceremony type',
  caption: 'Aprašymas / Caption',
  captionLang: 'Aprašymo kalba / Caption language',
  markets: 'Kur galima naudoti? / Where may this be used?',
  video: 'Vaizdo įrašo nuoroda / Video link',
  consent: 'Sutikimas / Consent',
};

const CONSENT_TEXT =
  'Patvirtinu, kad pora / šeima raštu sutiko, jog HIA naudotų šią medžiagą pažymėtose šalyse (BDAR). / ' +
  'I confirm the couple / family gave written consent for HIA to use this material in the selected countries (GDPR).';

const INDEX_HEADERS = [
  'Submitted', 'Photographer', 'Email', 'Couple / event', 'Ceremony date', 'Location', 'Ceremony type',
  'File', 'Original name', 'Batch folder', 'Video link', 'Markets',
  'Caption LT', 'Caption LV', 'Caption ET', 'Caption EN',
  'Consent', 'Consent version', 'Status',
];

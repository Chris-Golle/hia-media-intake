/**
 * On every form submission:
 *  1. files move to Media/<year>/<date>_<location>_<event>/ and are renamed consistently
 *  2. the caption is translated into LT / LV / ET / EN
 *  3. one row per file is written to the Index sheet
 */
function onFormSubmit(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    processResponse_(e.response);
  } finally {
    lock.releaseLock();
  }
}

/** Debug helper: re-runs the handler on the latest response. */
function reprocessLastResponse() {
  const form = FormApp.openById(prop_('FORM_ID'));
  const responses = form.getResponses();
  if (!responses.length) throw new Error('No responses yet.');
  processResponse_(responses[responses.length - 1]);
}

function processResponse_(response) {
  const answers = {};
  let fileIds = [];

  response.getItemResponses().forEach(ir => {
    const item = ir.getItem();
    if (item.getType() === FormApp.ItemType.FILE_UPLOAD) {
      fileIds = fileIds.concat(ir.getResponse());
    } else {
      answers[item.getTitle()] = ir.getResponse();
    }
  });

  const date = answers[Q.date]; // YYYY-MM-DD
  const batchName = [date, slug_(answers[Q.location]), slug_(answers[Q.event])].join('_');
  const media = DriveApp.getFolderById(prop_('MEDIA_FOLDER_ID'));
  const batch = getOrCreateFolder_(getOrCreateFolder_(media, date.slice(0, 4)), batchName);

  const captions = translateCaption_(answers[Q.caption], answers[Q.captionLang]);
  const consentGiven = (answers[Q.consent] || []).length > 0;

  const base = {
    submitted: response.getTimestamp(),
    photographer: answers[Q.photographer],
    email: response.getRespondentEmail(),
    event: answers[Q.event],
    date: date,
    location: answers[Q.location],
    type: answers[Q.type],
    batchLink: link_(batch.getUrl(), batchName),
    video: answers[Q.video] || '',
    markets: (answers[Q.markets] || []).join(', '),
    captions: captions,
    consent: consentGiven ? 'yes' : 'NO',
  };

  const rows = [];
  fileIds.forEach((id, i) => {
    const file = DriveApp.getFileById(id);
    const original = file.getName();
    const ext = original.includes('.') ? original.slice(original.lastIndexOf('.')) : '';
    const newName = batchName + '_' + String(i + 1).padStart(3, '0') + ext.toLowerCase();
    let status = 'ok';
    try {
      file.moveTo(batch);
      file.setName(newName);
    } catch (err) {
      status = 'not moved: ' + err.message;
    }
    rows.push(row_(base, link_(file.getUrl(), file.getName()), original, status));
  });

  // Video-only submission still gets a row.
  if (!rows.length) rows.push(row_(base, '', '', base.video ? 'video link only' : 'no files'));

  const sheet = SpreadsheetApp.openById(prop_('SHEET_ID')).getSheetByName('Index');
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, INDEX_HEADERS.length).setValues(rows);
}

function row_(b, fileLink, originalName, status) {
  return [
    b.submitted, b.photographer, b.email, b.event, b.date, b.location, b.type,
    fileLink, originalName, b.batchLink, b.video, b.markets,
    ...CONFIG.CAPTION_LANGS.map(l => b.captions[l] || ''),
    b.consent, CONFIG.CONSENT_VERSION, status,
  ];
}

/**
 * Demo: Apps Script's built-in translator.
 * Production: swap for a call to the existing Cloud Run translation-service.
 */
function translateCaption_(text, langLabel) {
  const out = {};
  if (!text) return out;
  const source = (langLabel || 'LT').toLowerCase();
  CONFIG.CAPTION_LANGS.forEach(target => {
    if (target === source) {
      out[target] = text;
      return;
    }
    try {
      out[target] = LanguageApp.translate(text, source, target);
    } catch (err) {
      out[target] = '[translation failed]';
    }
  });
  return out;
}

// --- helpers ---

function prop_(key) {
  const v = PropertiesService.getScriptProperties().getProperty(key);
  if (!v) throw new Error('Missing ' + key + ' — run setup() first.');
  return v;
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

// "Užupio Meno Inkubatorius" → "uzupio-meno-inkubatorius" (NFD strips Lithuanian diacritics)
function slug_(s) {
  return String(s || 'unknown')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 40);
}

function link_(url, label) {
  return '=HYPERLINK("' + url + '","' + String(label).replace(/"/g, '""') + '")';
}

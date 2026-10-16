/**
 * Run once, signed in as the HIA account that owns the test folder.
 * Creates: Media folder, index Sheet, intake Form, and the on-submit trigger.
 */
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('FORM_ID')) {
    throw new Error('Already set up. Run reset() first to start over.');
  }

  const root = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  const media = root.createFolder(CONFIG.MEDIA_FOLDER_NAME);

  const ss = SpreadsheetApp.create(CONFIG.SHEET_TITLE);
  buildIndexSheet_(ss);

  const form = FormApp.create(CONFIG.FORM_TITLE);
  buildForm_(form);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  DriveApp.getFileById(ss.getId()).moveTo(root);
  DriveApp.getFileById(form.getId()).moveTo(root);

  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();

  props.setProperties({
    FORM_ID: form.getId(),
    SHEET_ID: ss.getId(),
    MEDIA_FOLDER_ID: media.getId(),
  });

  Logger.log('Form (edit):  ' + form.getEditUrl());
  Logger.log('Form (share): ' + form.getPublishedUrl());
  Logger.log('Index sheet:  ' + ss.getUrl());
  Logger.log('NEXT: open the form editor and add one "File upload" question (Apps Script cannot create it).');
}

function buildForm_(form) {
  form
    .setDescription(
      'Įkelkite ceremonijos nuotraukas. Dideliems vaizdo failams naudokite nuorodą.\n' +
      'Upload ceremony photos. For large video files, paste a link instead.')
    .setCollectEmail(true)
    .setAllowResponseEdits(false);

  form.addTextItem().setTitle(Q.photographer).setRequired(true);
  form.addTextItem().setTitle(Q.event).setRequired(true);
  form.addDateItem().setTitle(Q.date).setRequired(true);
  form.addTextItem().setTitle(Q.location).setRequired(true);
  form.addMultipleChoiceItem()
    .setTitle(Q.type)
    .setChoiceValues(CONFIG.CEREMONY_TYPES)
    .showOtherOption(true)
    .setRequired(true);

  form.addSectionHeaderItem()
    .setTitle('Failai / Files')
    .setHelpText('Nuotraukos įkeliamos žemiau. / Photos are uploaded below.');
  // ← add the File upload question right after this header (manual step).

  form.addTextItem()
    .setTitle(Q.video)
    .setHelpText('Google Drive, WeTransfer, Vimeo…')
    .setValidation(FormApp.createTextValidation().requireTextIsUrl().build());

  form.addParagraphTextItem()
    .setTitle(Q.caption)
    .setHelpText('1–2 sakiniai. Bus išversta automatiškai. / 1–2 sentences. Translated automatically.');
  form.addMultipleChoiceItem()
    .setTitle(Q.captionLang)
    .setChoiceValues(CONFIG.CAPTION_LANGS.map(l => l.toUpperCase()));

  form.addCheckboxItem()
    .setTitle(Q.markets)
    .setChoiceValues(CONFIG.MARKETS)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle(Q.consent)
    .setChoiceValues([CONSENT_TEXT])
    .setRequired(true);
}

function buildIndexSheet_(ss) {
  const sheet = ss.getSheets()[0].setName('Index');
  sheet.getRange(1, 1, 1, INDEX_HEADERS.length)
    .setValues([INDEX_HEADERS])
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1000, INDEX_HEADERS.length).createFilter();
}

/** Removes the trigger and stored IDs (does not delete files). */
function reset() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  PropertiesService.getScriptProperties().deleteAllProperties();
  Logger.log('Reset done. Created files were left in Drive.');
}

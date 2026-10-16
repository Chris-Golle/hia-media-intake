# HIA media intake

One Google Form replaces email hand-offs. Photos land in a dated Drive folder, a Sheet becomes the searchable index, captions arrive in four languages, consent is recorded per batch.

## Flow

```
Photographer ──▶ Google Form ──▶ onFormSubmit (Apps Script)
                                   ├─ Media/2026/2026-10-12_uzupis_ruta-jonas/  (files moved + renamed)
                                   ├─ Caption → LT / LV / ET / EN
                                   └─ Index sheet: one row per file
```

## Demo setup (10 minutes)

1. Signed in as **christophe@hia.lt**, open [script.google.com](https://script.google.com) → New project.
2. Create files `Config.gs`, `Setup.gs`, `Intake.gs` and paste the contents. Project Settings → show `appsscript.json` → paste.
3. In `Config.gs`, set `ROOT_FOLDER_ID` to the test folder's ID.
4. Run `setup()` and approve permissions. The log prints the form and sheet links.
5. **Manual step:** open the form editor and add a **File upload** question under the "Failai / Files" header. Apps Script cannot create this question type. Suggested limits: images and videos, up to 10 files, 1 GB each.
6. Submit a test response, then check the Index sheet and `Media/` folder.

`reprocessLastResponse()` re-runs the handler for debugging. `reset()` removes the trigger and stored IDs.

Later, with [clasp](https://github.com/google/clasp): `clasp clone <scriptId>` in this repo to push from Git.

## Operations manual section (revised)

**Media intake.** Photographers submit through one Google Form instead of email: photographer, couple or event, date, location, ceremony type, photos (upload) and a link field for large video. Files move automatically into `Media/<year>/<date>_<location>_<event>/` and are renamed consistently.

**Index.** The linked Sheet holds one row per file, filterable by photographer, place, date, type and market.

**Markets and captions.** Each batch records where it may be used (LT, LV, EE, International). The caption is translated into Lithuanian, Latvian, Estonian and English on arrival.

**Consent.** Confirmed per batch with a required checkbox. The consent wording version is stored on every row, so changing the wording never blurs what was agreed.

## Notes for production

- **Uploading requires a Google account.** Forms only allows file uploads from signed-in users. Photographers without one use the video/link field.
- **Upload storage** counts against the form owner's Drive. Moving the form to a Shared Drive owned by HIA keeps files with the organisation.
- **Translation:** the demo uses Apps Script's built-in translator. For production, call the existing Cloud Run `translation-service` so captions share one glossary with the document pipeline.
- **Funerals and memorials** are sensitive. Consider keeping them out of the "International" option by default and setting a retention period.
- **Consent evidence:** the checkbox is the photographer's confirmation. The signed couple consent should be stored with the ceremony contract.

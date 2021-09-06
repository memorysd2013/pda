reference: https://github.com/jakearchibald/idb

## openDB
- `name`: Name of the database.
- `version` (optional): Schema version, or `undefined` to open the current version.
- `upgrade` (optional): Called if this version of the database has never been opened before. Use it to specify the schema for the database. This is similar to the [`upgradeneeded` event](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event) in plain IndexedDB.
  - `db`: An enhanced `IDBDatabase`.
  - `oldVersion`: Last version of the database opened by the user.
  - `newVersion`: Whatever new version you provided.
  - `transaction`: An enhanced transaction for this upgrade. This is useful if you need to get data from other stores as part of a migration.
- `blocked` (optional): Called if there are older versions of the database open on the origin, so this version cannot open. This is similar to the [`blocked` event](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/blocked_event) in plain IndexedDB.
- `blocking` (optional): Called if this connection is blocking a future version of the database from opening. This is similar to the [`versionchange` event](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/versionchange_event) in plain IndexedDB.
- `terminated` (optional): Called if the browser abnormally terminates the connection, but not on regular closures like calling `db.close()`. This is similar to the [`close` event](https://developer.mozilla.org/en-US/docs/Web/API/IDBDatabase/close_event) in plain IndexedDB.
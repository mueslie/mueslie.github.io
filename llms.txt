# Building a Dapp Builder Code App — instructions for coding agents

Drop this file into your agent's instructions (CLAUDE.md, AGENTS.md, a system
prompt, …) when you want it to write an app for Dapp Builder. It states the
complete contract; the agent needs nothing else from the repository.

## What you are producing

A **Code App** is a small set of plain files that Dapp Builder syncs
peer-to-peer between the members of a dapp and runs inside a sandboxed iframe:

- `index.html` — the only entry point (required)
- `manifest.yaml` — routes, identity, declared capabilities (required)
- any number of linked files: `styles.css`, `app/*.js`, `vendor/*.js`,
  `icons/*.svg`, `i18n/<lang>.json` (optional; up to 64 files, 4 MB total,
  subdirectories allowed)

Your deliverable is that file map, nothing more. The user pastes the files into
the dapp's code editor (Builder → the dapp → **Code**, one file at a time,
"Add file" for extra files) or you hand them a `.dapp.json` export. There is no
build step, no package.json, no server, no backend.

## Hard constraints (the sandbox enforces these — designs that violate them fail silently)

1. **No network.** `fetch`, XHR, WebSocket, `<script src=https://…>`,
   `<link href=https://…>`, web fonts, CDNs: all blocked by CSP unless the
   manifest grants an exact HTTPS origin under `permissions.network`
   (see below). Default to fully offline.
2. **No ES modules.** `<script type="module">` is removed. Split files are
   *classic* scripts in `<script src>` document order that share code through
   one global namespace, e.g. `globalThis.MyApp = { … }`. No `import`/`export`.
3. **No frameworks by default.** Vanilla HTML/CSS/JS. If a framework is
   explicitly requested, vendor a no-build library into the file map
   (Preact + `htm` works; React needs a bundler and is not recommended).
4. **Local references only.** `<script src="app/main.js">`,
   `<link rel="stylesheet" href="styles.css">`, `<img src="icons/x.svg">` are
   inlined at boot. Relative paths only: no `..` above the root, no query
   strings, no absolute URLs. Anything else is dropped.
5. **One HTML file.** Other `.html` files are inert. Multiple "pages" are
   `$router` routes that show/hide views inside `index.html`.
6. **No `eval`, no `new Function`, no inline event handlers that need it.**
   Inline `<script>` blocks and `<style>` are fine.
7. **No forms.** `<form>` submission is blocked. Use `<button type="button">`
   with click handlers and call `input.reportValidity()` yourself.
8. **Links** to `http(s)://` open in the top-level tab on a real click;
   `javascript:`, `data:`, `mailto:` hrefs are stripped. `alert`/`confirm`/
   `prompt` work.
9. **Blob and data URLs** from `$files.objectUrl` and data-URL images are
   allowed for `<img>`/`<video>`.

## Data model you can rely on

Every member's device keeps a full copy; there is no server and no single
source of truth. Writes are signed by the writing device and merged as CRDT
state. Consequences for your design:

- **Order by timestamps you store**, never by insertion order.
- **Whole-record last-writer-wins**: two members editing the same record at
  the same time keep the later write. Model concurrent edits as separate
  records when that matters (one record per message, per vote, per score).
- **Keep records small.** Base64 images inside records live in history
  forever on every device; downscale and cap them (≈ 800 px, ≤ 200 KB) or use
  `$files` for real files.
- **Roles**: `owner` (created the dapp, can edit code, approve members),
  `editor` (read/write records), `viewer` (read only). Writes from viewers
  are rejected by the bridge; design the UI to hide write controls when
  `context.role === 'viewer'`.
- Record ids are assigned by `$store.create` (do not invent your own unless
  you need deterministic ids; if you do, pass an `id` field).

## `manifest.yaml`

YAML 1.2 (JSON syntax also parses). Unknown keys are **rejected**, so only use
what is listed here. Validation fails closed: an invalid manifest stops the
app from installing and shows the reason in the editor.

## Sharing source

An owner can create a reusable, 24-hour **source-share link** from Dapp
Settings. It transfers a signed definition containing source files and display
metadata only; it never joins the recipient to the original dapp or transfers
records, members, credentials, P2P files, or channels. The owner device must
stay online while the recipient opens the link. Recipients review the definition
before either installing an independent dapp or, if they own one already,
replacing only that dapp's source and manifest (its data and members remain).

```yaml
name: Shopping List        # ≤ 80 chars; the app's display name everywhere
icon: 🛒                   # one emoji, ≤ 16 chars
color: '#c2410c'           # #rgb or #rrggbb — quote it, YAML treats # as a comment
routes:                    # 1–32 unique routes; the first is usually /
  - path: /
    label: List
    icon: list             # optional: code | home | list | dashboard | settings
  - path: /archive
    label: Archive
    hidden: true           # omitted from the sidebar, still navigable — NOT access control
display:                   # optional
  chrome: fullscreen       # default landing without the framework sidebar
  frameButton: false       # optional: hide the corner "Show app framework" button in fullscreen
entities:                  # optional but recommended: documents your collections
  - id: items              # the $store collection name
    name: Items
    icon: 🛒
    color: '#c2410c'
    fields:                # 1+ fields; types: text number boolean date datetime select
      - id: title
        name: Title
        type: text
        required: true
      - id: done
        name: Done
        type: boolean
db:                        # optional: sortable fields for $db (large collections)
  indexes:
    - collection: items
      field: title
bindings:                  # optional: typed events/actions for dapp-to-dapp wiring
  events:
    - id: item.checked     # lowercase, starts with a letter, dots/underscores ok
      label: Item checked
      payload:             # field types: string number boolean string[] number[] boolean[] json
        - name: itemId
          type: string
          required: true
  actions:
    - id: item.add
      label: Add an item
      payload:
        - name: title
          type: string
          required: true
channels:                  # optional: share a slice with contacts (needs permissions.host.sharing)
  shares:
    - id: list-share
      label: Share this list
      events: [item.checked]
      actions: [item.add]
      routes:
        - eventId: item.checked
          actionId: item.add
          fieldMap: { title: itemId }   # destination field ← source field; omit when names match
      maxParticipants: 8   # 1–16
roles:                     # optional app-level roles (≤ 16); `extends` is a ceiling, never a grant
  - id: buyer
    label: Buyer
    extends: editor
permissions:               # optional; everything defaults to off
  host:
    codeEditor: true       # $ui.openCodeEditor
    settings: true         # $ui.openSettings
    contacts: true         # $contacts.pick / $contacts.invite
    sharing: true          # $share.*
    files: true            # $files.*
  network:
    connect: [https://api.example.com]   # exact https origins only, ≤ 32; server must send CORS *
    images: [https://images.example.com]
  device:
    camera: true                       # $camera.start / .frame / .stop (host camera bridge)
shareTarget:               # optional: appear in the OS "share to" picker
  accepts: [text, url]
```

Declared route paths start with `/`, use URL-safe segments, and carry no
query string or hash. At runtime a query string is fine for deep links:
`$router.navigate('/item?id=' + id)` navigates to the declared `/item`
route and `$router.query('id')` reads the id back (subscribers also fire
when only the query string changes).

## Runtime API (globals injected before your scripts run)

Wait for the bridge before touching data:

```js
Dapp.onReady(async (context) => {
  // context.meta {name, icon, color}, context.role 'owner'|'editor'|'viewer',
  // context.identity {publicKey, displayName}, context.appRole, context.roles,
  // context.permissions (normalized), context.language
});
```

All calls return promises unless noted. Errors reject with a message string
you can show the user.

| Global | Use | Notes |
| --- | --- | --- |
| `$store.query(col, filter?)` | read records | `filter` is an equality object `{ done: false }` |
| `$store.create(col, data)` | add a record | returns the record incl. `id`, `createdAt` |
| `$store.update(col, id, patch)` | change fields | reserved fields (`id`, `createdAt`, signatures) are ignored |
| `$store.delete(col, id)` | remove | signed tombstone; peers converge |
| `$store.subscribe(col, filter, cb)` | live list | `cb(records)` runs now and on every synced change; returns unsubscribe |
| `$data.get/set(key, value)` | small JSON state | key ≤ 128 chars, value ≤ 256 KB, whole-value LWW; `$data.subscribe(cb)`, `$data.snapshot()` |
| `$db.query(col, {index, range, direction, limit, cursor, match})` | sorted, paged reads | needs `db.indexes` in the manifest; `range: {eq|gt|gte|lt|lte}`, `match: [{field, op: eq|contains|gte|lte, value}]`; returns `{rows, cursor}` |
| `$db.get(col, id)`, `$db.count(col, opts?)`, `$db.subscribe(col, cb)` | | subscribe is an invalidation signal: re-run your query |
| `$router.current()` / `.navigate(path)` / `.subscribe(cb)` | routes | only declared routes; `.query(name)`, `.search()` for the host query string |
| `$router.chrome()` / `.setChrome('fullscreen'|'standard')` | hide/show the framework sidebar | never resets your JS state |
| `$events.publish(id, payload)` | emit a declared event | payload validated against the manifest schema |
| `$actions.handle(id, async (payload, {deliveryId}) => {})` | receive a declared action | payload arrives validated; needs editor/owner to write |
| `$roles.current()` (sync), `.list()` (sync), `.assignments()`, `.assign(publicKey, roleId)` | app roles | assign is owner-only |
| `$contacts.pick({ min?, max?, label? })`, `$contacts.invite()` | host contact picker | resolves to an **array** of opaque handles `{ handle, displayName, verified }` (empty when cancelled) |
| `$share.open({ shareId, contacts })`, `.list()`, `.participants(instanceId)`, `.close(instanceId)`, `.leave(instanceId)` | contact-scoped channels | host shows a consent dialog; `instanceId: null` means declined |
| `$files.list()`, `.get(id)`, `.objectUrl(id)`, `.add({name, mime, data})`, `.delete(id)` | P2P file store | `get` can take up to 2 min over the wire |
| `$camera.start({facingMode: 'environment'})`, `.frame()`, `.stop()` | live camera preview / detection | needs `permissions.device.camera`; start returns `{width,height}`; frame returns `{bytes: ArrayBuffer,mime,width,height}` (JPEG, ≤1280 px, ≤15 fps) |
| `$ui.openCodeEditor({file})`, `$ui.openSettings({section})` | host modals | resolve when the modal closes; `{opened:false}` is a soft decline |
| `$t(key, params?)`, `$i18n.language()` / `.available()` / `.subscribe(cb)` | translations | dictionaries in `i18n/<lang>.json`; keys are your English strings |

`$store` collection names are free-form; declaring them under `entities` is
documentation for the host UI, not a requirement. `$db` is for collections
too large to hold in memory in the iframe (thousands of rows); everything
else should just use `$store.subscribe` and render from the delivered array.

### Live camera

Use **`$camera`**, never native `getUserMedia`: browsers reject the sandbox's
opaque origin even with `allow="camera"`. The host requests browser camera
permission on HTTPS/localhost and returns successive device-local frames.
After `$camera.start()` from a button click, await `$camera.frame()` in a loop,
decode `new Blob([frame.bytes], {type: frame.mime})` with `createImageBitmap`
(or an `Image` and an object URL), draw to a canvas, then draw detection overlays.
Close each bitmap / revoke each object URL. Keep only one frame request in flight.
Use `.stop()` on pause or route exit and handle rejection in both start and the
frame loop. Hiding the page or closing/reloading the app stops capture; restart
from a user action. Frames are not saved or synced by the host.

## Recommended structure

```
index.html        markup + <link>/<script> tags only
styles.css        mobile-first, 44 px touch targets, [hidden]{display:none!important}
app/state.js      globalThis.App = { state, data access, $store subscriptions }
app/view.js       render functions; no data access
app/main.js       Dapp.onReady wiring, event delegation, route switching
i18n/de.json      optional translations
```

Boot pattern every app should follow:

```js
(function () {
  let route = '/';
  let items = [];
  const render = () => App.view.render(route, items);

  Dapp.onReady(async (context) => {
    document.body.dataset.role = context.role;          // CSS hides write controls for viewers
    route = $router.current();
    $router.subscribe((next) => { route = next; render(); });
    await $store.subscribe('items', {}, (records) => { items = records; render(); });
  });

  document.querySelector('.nav').addEventListener('click', (event) => {
    const target = event.target.dataset.route;
    if (target) $router.navigate(target);
  });
})();
```

Views are sections with `data-view="/path"`; the route subscriber sets
`view.hidden = view.dataset.view !== route`. Use event delegation on stable
containers rather than re-binding handlers after each render. Escape user
text before inserting it as HTML (`textContent`, or a tiny `esc()` helper).

## Sharing a slice with a contact (channels)

Use this when a person outside the dapp should get *part* of the data (one
diary entry, one expense split) without joining the whole dapp. Declare the
events/actions, a `channels.shares` entry that lists them, and
`permissions.host.sharing: true`. Then:

```js
const contacts = await $contacts.pick({ min: 1 });               // needs permissions.host.contacts
if (!contacts.length) return;
const opened = await $share.open({ shareId: 'list-share', contacts });
if (opened.instanceId) await $events.publish('item.checked', { itemId });
$actions.handle('item.add', async (payload, { deliveryId }) => { /* apply, dedupe by deliveryId */ });
```

Never put a member's public key or device id inside a payload; use the
handles the host gives you. The recipient must have the same app installed
(the share offer can carry the app definition when the sender is the owner).

## Checklist before you hand the files over

- [ ] `manifest.yaml` has `routes` with at least `/`, and every key used is in the list above.
- [ ] Every `$router.navigate` target and every `data-route` is a declared path.
- [ ] Every `$events.publish` / `$actions.handle` id is declared under `bindings`.
- [ ] Every `$share.open` shareId is declared under `channels.shares` and `permissions.host.sharing` is set.
- [ ] `$files`, `$contacts`, `$ui` calls have their `permissions.host` flag.
- [ ] Live camera uses `$camera` with `permissions.device.camera: true`, starts from a user action, and stops on pause/route exit.
- [ ] No `type="module"`, no external URLs, no `<form>` submits, no `eval`.
- [ ] Every linked file exists in the file map with the exact relative path.
- [ ] Viewers see a read-only UI; writes are wrapped in try/catch and show the error.
- [ ] Lists are sorted by a stored field (`createdAt`, `sentAt`, `dueDate`), not insertion order.
- [ ] Images stored in records are downscaled and capped; real files go through `$files`.
- [ ] Works at 360 px wide and on touch; `[hidden]` rule present in the CSS.
- [ ] `<html lang>`, `<meta viewport>`, and a `<title>` are set.

## Minimal complete example

`manifest.yaml`

```yaml
name: Counter
icon: 🔢
color: '#2563eb'
routes:
  - path: /
    label: Counter
```

`index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Counter</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 1rem; }
    button { min-height: 44px; min-width: 44px; font-size: 1.25rem; }
    [hidden] { display: none !important; }
    body[data-role="viewer"] .write { display: none; }
  </style>
</head>
<body>
  <h1>Shared counter</h1>
  <p><output id="value">0</output></p>
  <p class="write">
    <button type="button" id="dec">−</button>
    <button type="button" id="inc">+</button>
  </p>
  <p id="status" aria-live="polite"></p>
  <script>
    (function () {
      let count = 0;
      const show = () => { document.getElementById('value').textContent = String(count); };
      const bump = async (delta) => {
        try { await $data.set('count', count + delta); }
        catch (error) { document.getElementById('status').textContent = String(error); }
      };
      Dapp.onReady(async (context) => {
        document.body.dataset.role = context.role;
        count = (await $data.get('count')) || 0;
        show();
        await $data.subscribe((state) => { count = state.count || 0; show(); });
      });
      document.getElementById('inc').addEventListener('click', () => bump(1));
      document.getElementById('dec').addEventListener('click', () => bump(-1));
    })();
  </script>
</body>
</html>
```

That is a complete, installable app. Larger apps add `styles.css`, split
`app/*.js` files, `entities`, and `$store` collections following the boot
pattern above. When in doubt, prefer fewer files, fewer manifest sections, and
plain DOM code over abstractions.

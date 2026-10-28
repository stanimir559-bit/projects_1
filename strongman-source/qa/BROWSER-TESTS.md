# Real browser audit

Run from the project root after building the standalone pages:

```sh
npm install --prefix qa/harness
cd qa/harness
npx playwright install chromium
cd ../..
node build.cjs
node qa/test-ui.cjs
node qa/test-browser.cjs
```

The browser suite starts and stops its own loopback HTTP server on an available port. It uses fictional records in isolated browser contexts. It does not read an existing browser profile, use a production access code or send test writes to the hosted competition.

On a machine with an existing supported Chromium browser, set `SM_BROWSER_EXECUTABLE` to its executable. `SM_PLAYWRIGHT_MODULE` optionally selects a preinstalled Playwright package. Neither variable contains credentials.

The suite checks real CSS layout and scrolling at 320×568, 390×700, 390×844, 768×1024 and 1280×720; configuration draft recovery; all ten scoring forms; the complete competition/review/finalization flow; undo/redo; Word, CSV and JSON downloads; archive recovery; all 28 demo stages; service-worker offline reload; two isolated referee sessions and queued replay; spectator profiles/event selection/TV; and stored-markup escaping.

The 3.5.1 candidate adds spectator keyboard focus checks for live result updates, mobile event rows, filter and overall controls, athlete profiles, TV enter/exit and Escape; mobile connection status accessibility; and `node test-sw.cjs` for cache-write event lifetime. Competition and season TV are tested with 15 long-name athletes and long titles at 1280×720, 320×740, 320×568, 320×480, 768×1024 and 568×320, including Standard, Logo and Poster backgrounds at all phone/tablet sizes. Checks cover no scroll, all pages, automatic/manual paging, pause, translation, dark theme, final status and read-only behavior. The DOM and browser harnesses read the generated pages from `../strongman/`, matching the repository build output.

The local HTTP synchronization adapter uses the real scoring/operation core. Run `node test-server.cjs` and `node cloudflare/test-worker.mjs` separately to verify the actual backend implementations, authorization and SQL/CAS paths.

Results are written to `qa/browser-audit-results.json`. The screenshot and example export artifacts use the `qa/audit-*` prefix. These generated fictional data files are development evidence and are not published with the application. `SM_TEST_FILTER` may select a named scenario in the software DOM suite while debugging; unset it for the full DOM run.

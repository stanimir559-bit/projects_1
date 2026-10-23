# Strongman Arena audit

Audit date: 23 October 2026. Scope: data model, scoring, event catalog/source applicability, season aggregation, browser storage, referee and visitor workflows, synchronization, public API boundaries, exports and responsive appearance.

This is the implementing agent's engineering audit. It is not an independent security certification, sports-federation approval, WCAG certification or a completed live-event field trial.

## Findings corrected

| Finding | Correction | Evidence |
|---|---|---|
| A queued edit could refer to a previous competition | New operations carry the competition ID; servers reject mismatches. Old queued operations are upgraded on load; an old running client must refresh before new writes. | Audit regression and API checks |
| Backup validation checked data but not complete history metadata | Validate revision, operation shape, unique IDs and exact undo/redo stack transitions before initialization/import/load. Invalid local content is retained, with recovery download rather than silent replacement. | Core and DOM checks |
| LocalStorage quota could make a long season non-durable | IndexedDB retains larger sessions; localStorage holds a small pointer after a successful write. Pending/failed device writes are visible. | Quota-failure and reload scenario |
| Stale setup/event forms could overwrite concurrent configuration | Field baselines for setup and an event-array baseline for event configuration now detect conflicts. Existing result and season baseline protection remains. | Stale setup/result DOM tests and operation checks |
| Same-device referee tabs could overwrite browser storage | Another write to the session key puts the older tab into read-only recovery mode until reload. | Code review; separate-device integration uses isolated storage |
| Tiny positive values could display as zero but earn points | Zero achievement uses the stated hundredth-unit precision. A required positive time that rounds to zero is invalid. | All measurement families and subprecision regression checks |
| Extreme numeric inputs and unsafe IDs were accepted | Bound finite measurements, validate IDs/bibs and event parameter combinations, and reject invalid finished competitions. | Injection, overflow and invalid-data regression checks |
| CSV quoting alone did not stop spreadsheet formulas | Formula-like string values are exported as literal text. Actual numeric values stay numeric. | CSV regression checks |
| Titan's Turntable template assumed metres | New template uses referee placings because the official WSM target is angular. Existing configured competitions are not silently migrated. | Source recheck and catalog test |
| Every unchanged visitor poll loaded full private history | Revision-aware public projection memoization avoids loading snapshot chunks for cached unchanged polls. Publication changes invalidate it. | 100 concurrent simulated spectator polls |
| Offline update could find an older cache first | Service worker v2 uses its own cache and removes only superseded Strongman shell caches. | Source review; real-device airplane-mode lifecycle remains a field check |
| Stream chunks could split Cyrillic in the optional Node server | Decode request bodies as UTF-8 streams. Worker reads are also byte-limited while streaming. | Server/API regression checks |
| Public page could call disabled publishing “Offline” | Separate Awaiting publication status, with prior results removed on disable. | DOM and browser workflow checks |
| Theme and focus defects | Semantic colors, measured contrast pairs, 44px header controls, persistent form focus, theme-independent print rules. | Contrast suite and browser layout inspection |

## Automated verification

- `node test.cjs`: 21 original scoring/history checks, including ties, penalties, zeros, withdrawals, countback and event cutoffs.
- `node test-season.cjs`: fixed scale, all-round totals, ties, DQ, absence, stable identity mapping, correction, malformed archive rejection, undo/new competition and no champion from an all-DNS/DQ points table.
- `node test-audit.cjs`: 12 additional regression checks; includes every catalog entry and every scoring mode. Deterministic 150-athlete × 50-event data set validates and produces repeatable totals. The local Node run was about 60–80 ms for this synthetic test, not a Cloudflare throughput measurement.
- `node test-contrast.cjs`: 18 principal semantic text-color pairs meet 4.5:1. This does not assess every possible overlay, browser variation or assistive-technology combination.
- `node test-server.cjs`: authentication, initialization, independent edits, conflicts, idempotency, ETag, disk backup and restart persistence.
- `node cloudflare/test-worker.mjs`: D1-shaped SQLite adapter exercises real SQL and handler code, concurrent CAS retries, public enable/disable, sanitization, authorization, ETag and multichunk Unicode snapshots. One hundred concurrent unchanged viewer requests return 304 without reloading snapshot/history. This is not a production D1 load test.
- `node qa/test-ui.cjs`: software DOM scenarios cover themes, field retention, next-missing navigation, undo, invalid input, setup drafts, stale edits, IndexedDB fallback, corruption recovery, offline replay, athlete links/follows, filter retention and publication state. A real browser is checked separately.

## Browser and export checks

An isolated local competition was used; no production competition data or private organizer access code was used for test writes. Referee entry, theme switching with typed input, skipping an already scored athlete, truck-pull DNF distance, completion feedback, public athlete profile/back navigation, season access and export controls were exercised through the real browser. Phone-width overflow and control sizes were inspected at 390 CSS pixels. Both Bulgarian and English remain available.

Competition and season Word files were downloaded through the interface. ZIP CRC, XML parsing, Cyrillic content, three tables each and expected competition totals 3/2/1 and season totals 45/41/36 passed. Native Word visual verification could not be completed: a screenshot capture timed out and the Word window disappeared during recovery. No visual Word-layout or cross-version compatibility claim is made. Browser print rules were reviewed and exercised by software events; physical printing remains unverified.

## Rules and data applicability

The 52 entries are configurable event templates and variants, not an exhaustive universal rulebook. Primary sources support the event families and measurement methods; technical judging choices still require the organizer's approval. Bulgarian municipal/university sources support the specific published events, but do not provide a comprehensive national scoring manual. See RESEARCH.md for the complete source list and the Turntable/relay/max-attempt caveats. The season scale is an organizer proposal. Roster N is fixed after the app's start; pre-start withdrawals must be resolved before locking it.

## Remaining verification limits

- No separate physical iOS/Android phones, outdoor glare/gloves, hardware stopwatch integration or long-duration venue Wi-Fi test was available.
- Production judge writes using the private organizer code were not exercised. Isolated server/worker tests cover those paths; production deployment and public pages are checked separately.
- The shared-code model has no individual judge permissions, account revocation or tamper-proof audit signing. An authorized code holder can edit the session by design.
- The hub and other same-origin projects share an origin with this app. Browser storage and the organizer code must not be treated as isolated from arbitrary JavaScript hosted on that same origin.
- Browser storage remains subject to device quota and browser-data clearing. IndexedDB improves capacity; it is not an external backup. Keep JSON archives. Pending/failed writes are reported rather than hidden.
- The 30 MB sync limit is an input limit, not a guarantee that every maximum-sized history will fit all Cloudflare memory limits or all phones. Synthetic scoring and bounded handler tests do not establish production spectator capacity.
- No claim of exhaustive security testing or absence of all defects is made. A real-event rehearsal and organizer rule approval remain appropriate acceptance steps.

## Release use

Refresh every referee device after deployment. Keep one referee tab per device; visitors can use their separate public page. Before a real event, verify one representative finishing time, one partial distance, a tie, a zero/DNS, correction/undo and an offline reconnect with your organizer's actual settings. This is a bounded release acceptance check, not a replacement for the engineering test evidence above.

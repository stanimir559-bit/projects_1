# Verification record

## Field Edition 2.1

Run the same commands below. The UI suite now contains 20 scenarios, including saved-result acknowledgements, direct event results, TV pagination/pause, partial standings and public disable. The contrast suite covers 23 principal pairs. Real browser testing used an isolated shared fixture; no production scoring data was changed. See [FIELD-EDITION.md](FIELD-EDITION.md).

21 October 2026

- 19 scoring/core tests passed, including finishers/non-finishers, tied places, zero policies, series timing, medley progression, heavy/light priorities, penalties, measurement precision, height countback, overall tiebreaks, fixed field size, undo/redo and concurrent edits.
- Node server integration passed: authentication, initialisation, independent updates, conflicting writes, idempotent retries, ETags, backup file and restart persistence.
- Cloudflare handler tested against actual SQLite using the D1 API shape: transaction-based compare-and-swap, concurrent independent edits, same-field conflicts, idempotency, ETags, chunked Unicode snapshots, old-snapshot cleanup and existing hub passthrough.
- Wrangler 4.151.3 deployment dry run passed. GitHub/Cloudflare production builds for commits 40d2398 and 12ed99d passed.
- The published app at https://projects.stanimir559.workers.dev/strongman/strongman-arena was opened successfully. Desktop and 390-pixel mobile layouts were inspected. Page and navigation horizontal overflow were checked; all six mobile navigation actions fit.
- Browser workflow passed: setup and event confirmation; decimal-comma input; draft restored after reload; a completed 42.37 s truck pull beat tied 18.5 m non-finishers; final points were 3, 1.5, 1.5 for three athletes; undo/redo; Bulgarian/English switching; two separate origins used as judges; concurrent stale editing was blocked without overwriting the saved result.
- Word export downloaded from the UI as a real DOCX. ZIP CRC, all XML parts, Cyrillic text and expected summary rows passed validation using Python and python-docx. Visual Word/LibreOffice rendering was unavailable because the packaged renderer could not find LibreOffice. No sample result document is included as a user deliverable.
- Cloudflare D1 database strongman-scores was created and bound as SM_DB. The user configured the SM_KEY runtime secret. The live API then returned UNAUTHORIZED (401) to an unauthenticated request, rather than NOT_CONFIGURED (503). The private judge code was not read or copied into source files. Authenticated production competition writes were not exercised with that private code; the server/handler write paths were exercised in isolated tests.

Research scope: 52 suggested templates/variants, not a claim of an exhaustive official event list. Actual technical rules must be confirmed by the organiser. A comprehensive public Bulgarian rulebook covering every scoring edge case was not located. Primary sources and applicability notes are included in the app and RESEARCH.md.

Checkpoint update: 21 core tests passed. Browser fixture with two events verified event-1 totals 3/2/1 versus full totals 4/4/4, cutoff persistence after reload, next-event navigation, banner, and English translation. Downloaded checkpoint DOCX verified the correct title, event subset and totals.

Season/visitor update verification: 21 existing core tests plus dedicated season tests (fixed scale, ties/countback, correction, DQ, absence, stable identity, duplicate mapping, incomplete/nested archive rejection, scale validation, public projection, undo/new round). Cloudflare handler verifies unauthenticated public viewing only when enabled, sanitized payload, ETag and 401 on judge reads/writes. Existing server tests pass. Isolated browser workflow: created season, mapped 3 entrants, saved round for 25/20/16 points, enabled visitor view without access code, checked individual athlete results and public annual winner, reopened season and started next competition with archived round retained. Mobile viewer at 390px has no page overflow. Season Word downloaded from UI: ZIP CRC/XML/Cyrillic and two tables with expected totals passed. LibreOffice visual render unavailable. No production competition data or private access code used in testing.

23 October 2026 audit/redesign: see AUDIT.md and UX-RESEARCH.md. 21 core tests, season suite, 12 new data/security regressions, 18 contrast pairs, Node API tests, Cloudflare SQL/handler tests with 100 concurrent unchanged spectator polls, and 14 software DOM scenarios passed. Real browser exercised theme/input retention, missing-result queue, DNF, phone-width visitor profiles and Word downloads. DOCX totals verified: competition 3/2/1, season45/41/36. Native Word capture timed out and the window disappeared, so native visual Word layout remains unverified. No production private code or competition data used in test writes.

Event review follow-up (2.1.1): the UI suite now has 24 scenarios, including the full event-overview/cutoff-standings/next-event flow, refresh, correction, Undo and explicit final completion.

2.1.2: 25 DOM scenarios; added coverage for visible total-column order, identical compact totals, missing event points and eight-event compact programmes.

2.1.3: 28 DOM scenarios; added new-competition visibility/localization, cancellation, JSON backup contents, preserved season archive/publication, reload, Undo and pending-sync checks. Browser verified the overview action at 390px and the More confirmation using isolated test data.

2.1.4: 31 DOM, 23 core and 12 audit checks, plus seasonal/server/Worker suites. Added explicit degree units, total angles above 360°, ties/zero/invalid units, catalogue/setup choice, public projection, visitor EN/BG formatting, reload, Word XML and legacy backed-up correction with Undo. Real browser at 390px: entered 810°, saved to event review, verified shared first place (2.5 points each), no horizontal page overflow.

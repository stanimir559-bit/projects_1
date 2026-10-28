# Strongman Arena — session handoff

Updated 2026-10-28. Checkout: C:/Users/OpenClaw/Documents/Codex/strongman-work. Branch: codex/arena-audit-2026-10-28. Production main is now 3.5.1. The GitHub plugin recreated the verified local trees as new commit objects, so local and remote commit SHAs differ; fetch remote main and compare tree SHAs before further work. On resume, run git status --short, git log -1 --oneline, and git ls-remote origin refs/heads/main.

## Completed 3.5.1 release

- Fixed QA harness page paths for the actual repository layout. The initial qa/test-ui.cjs failure was ENOENT; the corrected command now passes.
- Strengthened core history validation and Undo/Redo target semantics; generated cloudflare/scoring.mjs from core.js. A first backward-only patch was falsified by a valid root replacement plus nested score, then replaced with reverse-to-base and forward replay. Demo season fixtures now record their changes as operations.
- Kept Service Worker cache writes alive with event.waitUntil; cache namespace v3-5-1; added test-sw.cjs.
- Paused spectator polling in hidden tabs and refreshed on return. Connection clocks are visible but non-live, while a transition status remains accessible at 320px.
- Preserved focus for spectator athlete/event/season/TV controls, including mobile duplicate rows and Escape. Localized judge and spectator shell accessibility labels in BG/EN without overwriting an open dialog's specific name.
- Replaced overflowing season TV detail cards with paged season standings. The browser regression covers 15 long-name athletes and a long season title at 1280×720, 320×740 and 320×568, all pages, automatic/manual paging, pause, BG/EN, dark mode, final status, ordinary detail cards and no spectator-side write.
- Reproduced competition TV overflow and used the same viewport-aware pagination. Independent Edge review found more branded overflow at portrait phone, tablet and landscape sizes, then a 320×480 embedded case; compact Poster/Logo controls, a full-width landscape heading and a single row below 540 px height now fit. Both TV modes traverse all 15 long-name athletes under Standard, Logo and Poster at 320×740, 320×568, 320×480, 768×1024 and 568×320. Independent Edge retests found no vertical or horizontal overflow and visible controls in all 24 risky combinations, including the six added 320×480 cases. Visually inspected actual 320×568 and 568×320 Poster screenshots.
- Copied user-provided AGENTS.md, agent-ops guidance and .codex agent profiles into the real Git checkout. ROADMAP and DECISIONS contain evidence, priority estimates and release boundaries.

## Final local verification

From strongman-source/: node build.cjs; test.cjs 23 PASS; test-audit.cjs 16 PASS; test-season.cjs PASS; test-server.cjs PASS; cloudflare/test-worker.mjs PASS; test-demo.cjs 28 fixture stages PASS; test-contrast.cjs 59 pairs PASS; test-sw.cjs 2 PASS; qa/test-ui.cjs 47 PASS; qa/test-browser.cjs 34 PASS using installed Microsoft Edge on fictional loopback data. Repeated build produced identical SHA-256 for judge HTML, viewer HTML and scoring.mjs. git -c core.whitespace=cr-at-eol diff --check is clean. Independent rules reviewer checked 600 valid mixed operations and 1,500 operations on a 150-athlete/50-event synthetic fixture; independent TV review found branded-mobile overflow that was repaired; scoped accessibility review found no remaining concrete regression after repairs.

Production release verification: approved SQL export of the two Strongman D1 tables was saved outside the repository, restored to in-memory SQLite with integrity ok, and its document passed the new history validator. The GitHub plugin uploaded blobs with matching Git SHAs, created three trees exactly matching local trees, and advanced main with an expected-head lease. Cloudflare's main build succeeded and deployed 100%; hosted judge/viewer HTML and sw.js matched local SHA-256 hashes. Hub, judge, viewer and public viewer API returned 200; the judge API without a code returned 401. No production test writes were made.

Limits: no real Android/iOS/Messenger device, physical Word print, real Service Worker restart during update or production competition write was tested. The history check detects internal inconsistencies, not a fully coherent forged archive without a trusted signature.

## Next actions

1. Run a real-device read-only smoke check in Messenger, Android and iOS, especially branded TV at short viewport heights.
2. Investigate large-history startup and isolated multi-device sync with fictional data; do not use live competition test writes.
3. For any future release, fetch remote main, compare trees, make a new private backup, and obtain separate production approval.

Exact resume instruction: "Resume Strongman Arena in C:/Users/OpenClaw/Documents/Codex/strongman-work, read strongman-source/AGENTS.md, RUNBOOK, ROADMAP, DECISIONS and this handoff, inspect git status and fetch remote main, compare trees rather than commit SHAs, then continue the highest-evidence safe item. Obtain fresh approval for any further production data access or deployment."

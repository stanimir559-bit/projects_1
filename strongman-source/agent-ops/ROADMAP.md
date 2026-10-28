# Strongman Arena — evidence-based improvement board

Updated 2026-10-28. Production main is 3.5.1 after an approved release and a verified D1 SQL backup. Priority estimates use (impact 1–5 × confidence 0–1 × frequency 1–5) / (effort 1–5 × change risk 1–5). Frequencies are guesses, not telemetry. Data integrity and security override the score.

| ID | Evidence and proposed action | State | Estimated priority |
|---|---|---|---:|
| SM-01 | core.js accepted a current snapshot inconsistent with the operation log and a forged Undo that changed an unrelated field. Validate replay and target semantics; test root replacement plus first nested result. | Released; independent valid-history fuzz, full tests, and the current production document passed the new validator. | Critical override |
| SM-02 | sw.js returned navigation before cache.put completed. Bind the write to the fetch lifetime with waitUntil. | Implemented; VM cache-lifetime and browser offline tests. | 12 = 4×1×3 / 1×1 |
| SM-03 | QA harness looked for generated HTML inside strongman-source instead of ../strongman; observed ENOENT. | Implemented; DOM/browser suites run from real checkout. | 20 = 4×1×5 / 1×1 |
| SM-04 | Spectator re-render lost keyboard focus, including hidden desktop duplicate at 320px, TV Esc and season round links. | Implemented; DOM and Edge regressions. | 3 = 4×1×3 / 2×2 |
| SM-05 | Hidden spectator tab polled every 2.5 s; connection clocks repeated as live regions; mobile status was hidden from the accessibility tree. | Implemented; visibility, mutation and 320px computed-style tests. Actual traffic effect unknown. | 6 = 3×1×4 / 2×1 |
| SM-06 | Fifteen-athlete season TV overflowed a 1280×720 and 320×740 viewport. | Implemented: compact paged season standings, manual/automatic paging and short-viewport spacing; real Edge tests cover all 15 athletes, long names and a long title down to 320×568. | 0.8 estimate |
| SM-07 | Judge shell aria labels remained English in Bulgarian mode (build.cjs). | Released; BG/EN judge and spectator DOM regression. | 8.1 estimate |
| SM-08 | Real-device Messenger/Android/iOS and large-history startup remain unverified. | Open investigation with fictional isolated data; no live writes. | Unscored |
| SM-09 | Competition TV with six long-name rows required 822 px at 1280×720. Independent Edge review then found logo/poster overflow on 320 px phones, 768 px tablets and a 568×320 landscape phone; 320×480 embedded view also scrolled. | Implemented: viewport paging, compact branded controls and one-column landscape heading; a 16-viewport/background matrix covers both TV modes. | 2.4 estimate |

Release evidence: all 34 real-browser, 47 DOM, core, audit, season, server, Worker, demo, contrast and Service Worker tests passed. An isolated D1 SQL export was restored to SQLite and the current document passed the new history validator. Cloudflare's production build succeeded; the hosted judge HTML, viewer HTML and Service Worker matched local SHA-256 hashes; the public routes returned 200 and the unauthenticated judge API returned 401. Further production changes still require a separate approval under the user-provided master prompt.

# Strongman Arena — evidence-based improvement board

Updated 2026-10-28. Production main is 3.5.0; this local topic branch is an unreleased 3.5.1 candidate. Priority estimates use (impact 1–5 × confidence 0–1 × frequency 1–5) / (effort 1–5 × change risk 1–5). Frequencies are guesses, not telemetry. Data integrity and security override the score.

| ID | Evidence and proposed action | State | Estimated priority |
|---|---|---|---:|
| SM-01 | core.js accepted a current snapshot inconsistent with the operation log and a forged Undo that changed an unrelated field. Validate replay and target semantics; test root replacement plus first nested result. | Implemented locally; independent valid-history fuzz and full tests are release gates. | Critical override |
| SM-02 | sw.js returned navigation before cache.put completed. Bind the write to the fetch lifetime with waitUntil. | Implemented; VM cache-lifetime and browser offline tests. | 12 = 4×1×3 / 1×1 |
| SM-03 | QA harness looked for generated HTML inside strongman-source instead of ../strongman; observed ENOENT. | Implemented; DOM/browser suites run from real checkout. | 20 = 4×1×5 / 1×1 |
| SM-04 | Spectator re-render lost keyboard focus, including hidden desktop duplicate at 320px, TV Esc and season round links. | Implemented; DOM and Edge regressions. | 3 = 4×1×3 / 2×2 |
| SM-05 | Hidden spectator tab polled every 2.5 s; connection clocks repeated as live regions; mobile status was hidden from the accessibility tree. | Implemented; visibility, mutation and 320px computed-style tests. Actual traffic effect unknown. | 6 = 3×1×4 / 2×1 |
| SM-06 | Twelve-athlete season TV renders 12 rows without paging in a read-only fixture. | Open: measure actual viewport overflow before designing pagination. | 0.8 estimate |
| SM-07 | Judge shell aria labels remained English in Bulgarian mode (build.cjs). | Implemented locally; BG/EN judge and spectator DOM regression. | 8.1 estimate |
| SM-08 | Real-device Messenger/Android/iOS and large-history startup remain unverified. | Open investigation with fictional isolated data; no live writes. | Unscored |

Release gate: inspect the exact diff, current GitHub head, generated outputs, service-worker cache version, BG/EN and phone layouts. A local topic commit is allowed. A default-branch push, merge or Cloudflare deployment requires explicit approval under the user-provided master prompt. No real SM_KEY or competition data is needed.

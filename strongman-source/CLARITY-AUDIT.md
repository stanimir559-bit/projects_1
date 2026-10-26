# UX clarity audit — Arena 3.1.0

23 October 2026. Scope: referee and spectator navigation, result entry, result scope and responsive presentation; regression checks for scoring, persistence, sync and exports. This is a focused usability/code audit, not an independent accessibility certification or a new universal sport rulebook.

| Finding | Change | Verification |
| --- | --- | --- |
| Measurement dominated the workstation (90–100+ px and very large numbers) | 54 px phone / 58 px desktop measurement input, attached unit, clear focus; less desktop spacing | Browser computed dimensions at 390 and 1366 px; save/next, draft reload |
| Competition name obscured the current task | Explicit section heading, competition context, active menu fill, page/landmark title; sticky phone scoring context | Programme/scoring/standings/review navigation and reload tests |
| No dedicated programme screen | Programme lists every event with completion count/status and direct scoring/review action; available in desktop header and More | DOM programme draft/navigation/reload regression; 768 px browser |
| Overall points and event performances were easy to confuse | Explicit Overall / By event switch; total labels; visible performance with its event name; event-only ranking labels | DOM and browser overall/event/profile checks, both languages |
| Followed athletes could appear ahead of higher-ranked athletes | Favorites retain a star/highlight; rows always follow core rank order | Rank-order regression with lower-ranked favorite |
| Dense profile/event tables were difficult on phones | Mobile event rows and profile event cards; desktop/print tables retained | 320 px English dark profile; 390 px Bulgarian event and totals |
| Narrow English footer labels overlapped | Flexible Competition/Season columns and 44 px utility controls | 320 px measured all footer buttons fit their text, no page overflow |
| Event choice was lost on refresh/sharing | Persist selected event; shared links carry event id; narrowing cumulative scope clears excluded event | Deep link, reload/context and cutoff regressions |
| Missing statuses relied on abbreviations | Awaiting result, full DNS/WD/DQ labels, unfinished distance with DNF | Browser truck/DNF and pending profile results |
| Dialogs were always announced as Event settings | Accessible name follows the actual dialog heading | Shared dialog helper and seasonal confirmations; existing workflows pass |

## Verification

- 34 DOM integration scenarios pass (including the new programme and spectator rank/deep-link regressions).
- 23 core scoring checks, 12 audit/data checks, season suite, Node server integration and Cloudflare handler/SQL tests pass. These cover ties, zero/missing results, degrees, cutoff totals, undo/redo, archive retention, concurrent writes, offline queue replay and authenticated/public API separation.
- 23 principal semantic text-color pairs pass 4.5:1. Selected navigation uses the same high-contrast ink/paper pair.
- Real browser: 1366 px judge/event tables, 768 px programme and More, 390 px score/save/next and spectator modes, 320 px English dark profile/footer. Checked page widths do not overflow horizontally. Phone measurement is 54 px and desktop measurement is 58 px.
- Browser QA uses fictional isolated localhost data. No production competition results or private access code were used for test writes. API concurrency tests use an isolated Node/SQL harness.
- Word export content (including degrees) remains covered by DOM/XML regression; native Word print rendering was not revalidated. Physical iOS/Android keyboard/sunlight/venue testing and a moderated usability study remain outside this audit.

Browser proofs are retained locally under qa/clarity-scoring-mobile.png, qa/clarity-spectator-mobile.png and qa/clarity-profile-320-dark-en.png. Test data is fictional.

## 3.3.1 — smaller measurement fields (2026-10-26)

The time/distance/weight measurement entry is now capped at 240 px, with a 44 px input (46 px including the border) and 1.4rem digits. The same compact width applies on phones. Browser checks at desktop, 390 px and 320 px confirmed the dimensions and no horizontal overflow. Entering 1:02.37 and saving advanced to the next athlete and displayed 62.37 seconds. Scoring, validation and stored results are unchanged.

# Field Edition 2.1 — 23 October 2026

This release integrates the useful interaction patterns from a separate Lovable design prototype into the existing dependency-free Strongman Arena app. The prototype uses sample data and is not the authoritative competition record. Production continues to use core.js and the existing Cloudflare Worker/D1 setup. No scoring rules, backend schema, secret or audience setting changed.

## Referee
- Compact overview: next useful action, live top-three preview, correct progress totals, event programme, backup and connection shortcuts.
- Four labelled navigation icons, fixed at the bottom on phones.
- Prominent current athlete and bib; roster changes in a native disclosure. The next missing athlete still advances automatically after Save → next.
- Larger measurement inputs, finish/DNF quick selection, optional notes/penalties, and Undo last change next to Save.
- Saved-result receipt identifies the previous athlete and measurement; device/server acknowledgement updates without replacing the next athlete's typed input.
- Sticky current-event label on phones, and explicit Update wording when correcting a saved result.

## Spectators
- Compact warm light and navy dark themes; existing device preference retained.
- Search and archive filters share one mobile row. Core action targets are at least 44px; no horizontal page overflow at the checked 390px and 320px widths (horizontal event/table rails remain intentionally scrollable).
- One-tap overall/event selector with saved-result counts and complete/in-progress/upcoming labels. Athlete profiles remain one tap away.
- Compact top-three cards use actual core ranks and only athletes with positive totals; provisional labels remain explicit.
- Venue TV button displays unfiltered, correctly ranked results, live/offline status and Escape/Exit. More than six entrants automatically cycle across pages every 12s; Pause and Next remain available. A direct viewer URL can include ?tv=1 (or &tv=1 with other parameters).
- TV uses the public viewer API and stops showing results when publication is disabled. It never includes a judge access code.

## Validation
- 20 software DOM integration scenarios; 21 core tests; 12 audit regressions; seasonal assertions; Node HTTP integration; Cloudflare handler SQL-adapter tests; 23 principal text contrast pairs >=4.5:1.
- Real browser interaction with an isolated test session: save/next, live spectator update, athlete/event selection, theme/language, TV entry/exit and mobile layout. Production checks are read-only.
- No physical iOS/Android field test, authenticated production mutation or native Word print-layout verification was performed in this release. Earlier audit limitations still apply (AUDIT.md).

Lovable design workspace: https://lovable.dev/projects/1a69c402-ad0c-4f3c-8680-3b8d2fe178cd

## 2.1.1 — review each event before advancing

The final missing athlete uses Save → overview. Once all results are saved, the scoring continuation button opens the event overview without a duplicate save. The overview lists athlete performances, event places and points, with row-based correction. Continue opens provisional overall standings through that event only, followed by the next event. On the last event, finishing remains an explicit action after the review. Corrections validate before navigation; both review views survive refresh. Missing results after Undo block advancement. 24 DOM scenarios and 21 core checks pass; browser QA uses a six-athlete, four-event fixture.

## 2.1.2 — totals without horizontal scrolling

Overall standings show Total directly after the athlete name. Desktop tables wrap event names within fixed-width columns. Phones and larger event programmes use compact athlete rows with immediately visible totals and expandable per-event points. The scoring data and Word/CSV export formats are unchanged. 25 DOM scenarios pass.

## 2.1.3 — visible new competition action

Overview now places + New competition beside the competition status; More offers the same action directly. Confirmation downloads a JSON backup before replacing the active competition, preserves season rounds and publication settings, and warns connected judges that the replacement is shared. Pending unsynced changes block replacement. The new setup opens at the competition title. 28 DOM scenarios pass, including cancellation, backup contents, season preservation, reload, Undo and pending sync. A real browser check at 390px confirmed the action is visible without scrolling or horizontal overflow; the More confirmation was opened and canceled in an isolated test session.

## 2.1.4 — Conan’s Wheel in degrees

The Conan catalogue template now uses an explicit degree unit, with total-angle entry (one revolution is 360°, so two revolutions plus 90° is 810°). Greater angle wins, including values above 360°; equal measurements share occupied-place points. Distance events have an explicit metres/degrees selector during setup. Unit metadata survives public and season projections; judge, visitor and Word result formatters use it. Legacy events without unit metadata retain metres. A legacy Conan notice provides a confirmed, backed-up unit correction without changing numeric measurements or archived rounds, with history and Undo. 31 DOM, 23 core and 12 audit scenarios pass, plus seasonal, server and Worker handler checks. A real mobile browser entry of 810° correctly produced a tied first place and 2.5 points for each athlete in a three-athlete fixture. Word XML contents were checked; native Word print layout remains unverified.

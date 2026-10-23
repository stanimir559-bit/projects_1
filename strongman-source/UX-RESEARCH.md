# UX research and feature decisions

Reviewed 23 October 2026. The primary objective is field scoring and easy public tracking, with frequent actions within one or two taps. This is a research-informed redesign, not a moderated usability study.

Competition Corner's official score-entry guide uses expected/entered counts, a Missing Scores filter and nearby leaderboard access. Iron Podium's Strongman guide uses event tabs, score restoration and organizer-controlled ordering. These support refining the existing scoring workflow rather than adding another parallel entry system.

Sources: [Competition Corner score entry](https://help.competitioncorner.net/en/articles/1153572-entering-scores), [Iron Podium getting started](https://ironpodium.com/docs/getting_started), [Competition Corner features](https://get.competitioncorner.net/features).

## Implemented

| Change | Interaction and purpose |
|---|---|
| Persistent light/dark switch | One header tap on both pages. Initial appearance follows the operating system; an explicit choice stays on that device. Theme changes preserve form input and competition data. |
| Four primary destinations | Overview, Score, Standings, More. Setup, Season, History, Rules and Connect are under More, at most two taps away. Overview has direct season, connection, undo and backup actions. |
| Next-action overview | Readiness checks, entered/expected counts, event progress and Resume scoring. |
| Missing-result queue | One-tap missing/all filter and athlete chips. Save → next missing skips scores already entered, focuses the next measurement, and stops when the event is complete. Enter in a measurement field also saves and advances. |
| Less repeated input | Athlete count follows names. Existing season profiles can populate a round's roster. Connection setup detects create-versus-join; server address is under Advanced. The access code's origin is explained. |
| Focused result form | Primary measurement remains prominent. Notes and penalties are disclosed when needed. Errors remain on screen and preserve input. Race finish/DNF has explicit quick actions. |
| Visitor leaderboard first | Compact ranked cards; one tap to athlete results and one tap back. Search remains visible; archives and checkpoint filters are secondary. |
| Follow and share | Follow an athlete locally, retain filters and selection after refresh, and share a direct athlete/round/season link. No judge access code enters that link. |
| Honest save/sync states | Device save, pending synchronization, offline state and stopped conflicts are distinct. The viewer says Awaiting publication rather than Offline when public access is disabled. |
| Accessibility and print | Frequent controls target at least 44 CSS pixels, visible keyboard focus, numeric keyboards, reduced-motion support, print colors independent of theme and automatic expansion of printable event details. |

[W3C target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html) describes the enhanced 44×44 criterion; this is not the WCAG AA minimum. [Contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) supports 4.5:1 normal-text contrast. [Status guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html) and [redundant entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html) support clear save feedback and reused data. [GOV.UK error messages](https://design-system.service.gov.uk/components/error-message/) supports specific feedback without clearing answers. [Apple dark-mode guidance](https://developer.apple.com/design/human-interface-guidelines/dark-mode) supports semantic color tokens and checking both appearances. These references inform the work; they do not certify this application as WCAG conformant.

## Useful next additions

| Addition | Why it is deferred |
|---|---|
| Organizer-selected running order | Useful for reverse standings or previous-event order; requires an explicit competition policy rather than silently changing bib order. |
| Delayed release of completed events | Useful where live provisional scores should stay private until reviewed. Current public view explicitly labels provisional results. |
| Venue-screen display | A large-type screen can reuse the public API; no judging controls or extra scoring model is needed. |
| Reusable event programs and printable scorecards | Useful for recurring rounds; weights, course lengths and technical rules still need organizer confirmation. |
| Named judge accounts and permissions | A separate authentication project. Current deployment intentionally retains the existing shared organizer code. |
| Timer or Bluetooth integration | Requires the actual hardware model and supported protocol; guessed integrations could cause field failures. |

## Human decisions retained

Technical rule approval, athlete identity mapping for namesakes, explicit DNS/DQ decisions, conflict resolution and declaring final results remain deliberate actions. Automatically guessing those decisions would reduce input at the expense of scoring correctness.

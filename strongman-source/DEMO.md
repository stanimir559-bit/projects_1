# Interactive demo — Arena 3.3.0

26 October 2026.

The single Demo / Демо button appears in the persistent referee navigation, including the phone footer. It opens a full-screen, bilingual, 28-stage walkthrough: setup, catalogue, event configuration, rules, start, time and DNF entry, event review, checkpoint standings, programme, Conan degrees, repetitions/statuses, history, finish, exports, shared-session simulation, outage/reconnect, public standings/event/profile/TV, seasonal profiles and annual winner, appearance, backups and free practice.

Auto-play advances after 14 seconds of ready content. Interaction inside the sample pauses it. Reduced-motion preference starts paused. Previous, Next, direct stage selection, restart and Exit remain available. Each stage starts from a prepared example; practice edits are temporary. Exit restores focus to Demo and leaves the parent page, score draft, competition and judge credentials intact.

## Isolation

The walkthrough embeds the actual referee and public-viewer application code in a sandboxed srcdoc frame. The sandbox permits scripts/forms, explicit downloads and print dialogs, but deliberately omits same-origin, popups and top navigation. The frame therefore has an opaque origin and cannot access parent storage or DOM.

A memory-only Storage implementation is installed before application startup. IndexedDB is disabled in the child and its storage adapter uses memory. The seed is created exclusively by demo-data.js with SM.fresh, SM.operation and SM.apply; the parent competition and sync state are never copied. Judge credentials in the simulation are literal demo-only values for demo.invalid.

A restrictive frame CSP blocks all real network connections and external resources. The sample API responds in memory to state, operation and public-viewer requests. Offline/reconnect scenes replay the same queued sample operation against a separate sample server document.

Child messages are accepted only from the current frame window with the current stage token. Exports pass a Blob with a bounded size and an allowed filename/extension to a visible parent download link. Nothing downloads automatically. Exported filenames start with DEMO-. Frame navigation and exit revoke object URLs and clear timers. Public sharing and offline HTML-copy actions direct users back to the real application instead of producing unusable demo links or a simulated application copy.

Scoring rules, persistence and authenticated production API behavior are unchanged. The public production viewer does not expose referee editing through this feature.

## Verification

- All 28 bilingual stage documents and pending operations validate against the current core. Tests check truck ties (4 / 3 / 1.5 / 1.5), final leader total 10.5, undo/redo, idempotent offline replay and the two-round annual winner (50 points).
- 36 software DOM scenarios pass. New coverage proves the demo seed contains neither a private parent title nor its judge secret, exit/restart retain a typed result and its saved record, and forged/stale messages are ignored.
- 59 principal text/background pairs, including demo controls and the download link, meet 4.5:1. This is not a full accessibility certification.
- Real browser: all 28 stages loaded; auto-play advanced to the next stage; actual Save → next entered 42.37 s; the last DNF opened the event overview; the parent competition remained a separate six-athlete fixture after exit.
- A real DEMO-strongman-results.docx was downloaded using the visible link. ZIP integrity, document XML, expected final total and degree results passed. Native Word print layout was not revalidated.
- Desktop and 390/320 px layouts were checked. Demo is one visible footer action; parent scrolling is locked while the overlay is open. The child keeps its own navigation and scroll area. Physical mobile keyboard behavior was not tested.

Browser and software QA use fictional/local records. No production competition writes or private access code were used.

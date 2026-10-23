# Arena 3 — meet-day scorebook

The visual direction was developed in the existing [Lovable project](https://lovable.dev/projects/1a69c402-ad0c-4f3c-8680-3b8d2fe178cd), revision `9473b1325f37c9727027a3a868c1c47be1938a04`, on 23 October 2026. The redesign turn used 9 Lovable credits. Its class-based design notes and stylesheet were inspected, then adapted to the existing standalone application. The Lovable prototype contains fictional local data; it is not the scoring authority or the production data store.

## Visual language

The scorebook uses an almost-white canvas, charcoal type, a chartreuse primary action and quiet horizontal separators. Dark mode uses neutral charcoal rather than navy panels. A condensed sports typeface supplies hierarchy, while form labels and body copy retain a wider readable face. Repeated metric cards and spectator podium tiles give way to a flat programme and results rows.

| Role | Light | Dark |
| --- | --- | --- |
| Canvas | `#fafaf9` | `#121211` |
| Main text | `#1c1c1a` | `#f0f0ee` |
| Secondary text | `#676661` | `#999894` |
| Surface | `#ffffff` | `#1a1918` |
| Quiet band | `#f0f0ee` | `#232321` |
| Separator | `#d8d7d4` | `#373734` |
| Primary action | `#ceeb46` with `#1c1c1a` text | same |
| Selection tint | `#ecf6cd` | `#272b1a` |

Sofia Sans is used for the interface and Sofia Sans Condensed for competition titles, athlete names, bibs and totals. Both include Cyrillic and are embedded as WOFF2 subsets in `fonts.css`, so downloaded HTML needs no font request. The shared SIL Open Font License is included in the CSS and `SOFIA-SANS-OFL.txt`. Sources: [Google Fonts / Sofia Sans](https://github.com/google/fonts/tree/main/ofl/sofiasans), [Sofia Sans Condensed](https://github.com/google/fonts/tree/main/ofl/sofiasanscondensed).

## Application adaptation

- `arena.css` owns the current visual tokens and presentation over the existing layout primitives. Both generated pages use the same typography and controls.
- Overview is recomposed around real competition metadata, one compact progress strip, the next useful action, a numbered programme and current standings.
- The scoring workstation has a prominent athlete identity and an attached unit beside the measurement. Labels, field names, form values and validation remain unchanged.
- Wide desktop navigation remains in the sticky header; compact screens retain More and phones retain the permanent footer. Save/review controls clear the footer and safe areas.
- Spectators get flat athlete rows with adjacent totals, a compact provisional label, event selection and one-tap profiles. Profile tools have room on phones. TV mode retains the existing behavior.
- Toasts sit above persistent actions and do not intercept pointer input. Motion respects the reduced-motion preference.

## Boundaries and verification

No scoring rules, seasonal formulas, authentication, API routes, storage keys, sync operations or backend schema were copied from the prototype or changed for this redesign. Production remains the existing Cloudflare Worker/D1 application. User theme/language preferences and competition records are retained.

Validation includes 32 DOM integration scenarios, degree-field unit/form compatibility, contrast calculations for 23 actual semantic text pairs (all at least 4.5:1), and browser checks of light/dark, Bulgarian/English, desktop, 390px and 320px screens. Tests exercised saving through event review, drafts, totals, spectator profiles and TV. Embedded fonts loaded and the checked pages had no horizontal page overflow; local event rails remain scrollable. Browser fixtures are isolated fictional competitions. Physical mobile keyboard behavior, an independent full accessibility certification and native Word print layout remain unverified.

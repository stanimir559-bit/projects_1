# Spectator backgrounds — Arena 3.5.0

The picture button in the spectator header opens three choices. TV mode has the same button beside Exit.

- **Standard / Стандартен** retains the current light or dark layout.
- **Logo / Лого** uses a quiet charcoal canvas and the upper central logo from the supplied poster.
- **Poster / Плакат** uses the original image under a dark overlay, with a separate logo in the heading.

Names, performances, ranks and totals remain on opaque panels. Search, filters, connection status, share fallback, page indicators and profile/season panels also have their own surfaces. The appearance choice does not edit competition data, change the light/dark preference or call the judge API. Choosing Standard restores the selected light/dark appearance.

The choice is stored under `sm-visitor-background-v1` on that device. Shared spectator links include `background=logo` or `background=poster` when selected. The viewer accepts only the three known values. The print view omits the poster, logo and background controls.

## Image provenance and offline behavior

The organizer supplied the image in this conversation. `assets/strongman-poster.b64` contains its unchanged PNG bytes; the source resolution is 1927×1080 and the size is 2,168,429 bytes. SHA-256: `ada2f9680d0d3f84437b8568e8b287aa927ee7b62630c907ac41fade07caff83`.

The logo is a CSS viewport onto the upper centre of that same original, without redrawing the lettering. The original poster's date and athlete list are decoration; current competition details and results are rendered separately from the actual competition state.

The build embeds one image copy in each standalone HTML file. There is no external image host or font request. The decorative image increases the standalone download to about 3.6 MB for the judge/demo file and 3.4 MB for the visitor file before HTTP compression.

The sandboxed demo sends only the embedded image bytes to its current child frame, using the existing source/token checks. The child creates its own local Blob URL. This keeps each `srcdoc` below 1 MB, retains its opaque origin and network-blocking CSP, and avoids copying private competition data. Image caches are discarded when the demo closes.

## Verification

- 40 software DOM scenarios pass, including local persistence, unchanged filters/results, valid shared-link values and nonduplicated controls.
- 27 real-browser scenarios pass across the audited suite. The background matrix covers Standard/Logo/Poster, light/dark and 320/390/768/1280 px widths. Names and totals have measured contrast of at least 4.5:1 against opaque cells.
- The original image actually decodes at 1927×1080 in both the visitor and sandboxed demo.
- All 28 demo stages load. Demo interaction retains the parent competition.
- Six TV rows fit at 1280×720. Escape closes the background dialog while retaining TV mode and returns focus to its control.
- Offline appearance changes, reload persistence, shared URLs and the clean print view are checked. Scoring, storage schema and server operations are unchanged.

These are browser simulations, not a physical-device test of every Messenger, Android or iOS version.

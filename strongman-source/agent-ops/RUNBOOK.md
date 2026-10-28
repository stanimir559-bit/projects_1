# Autonomous engineering runbook

**Scope and startup** — Launch Codex from `strongman-source/`, confirm that it trusts this repository, and paste `MASTER-PROMPT.md` from the Codex chat. Project `.codex/config.toml` configures up to five concurrent subagents, and `.codex/agents/` defines 10 specialists. Not every role should edit at once; concurrency should maximize independent verified work, not file collisions.

**Verified architecture** — `core.js` owns score/sync state semantics; `catalog.js` event catalog; `app.js` referee app; `field.js` referee shortcuts; `season-ui.js` season; `visitors.js` public viewer; `visitor-ux.js`, `audience.js` viewer affordances; `cloudflare/worker.mjs` protected/public API; `build.cjs` creates `../strongman/*.html` and regenerates `cloudflare/scoring.mjs`. `wrangler.jsonc` and root `strongman-worker.mjs` are shared deployment touchpoints: default DO NOT EDIT.

**Pipeline** — Map and baseline → 5 parallel read-only audits (rotate other experts next batch) → consolidate repro-and-impact backlog → assign non-overlapping edits or serialize changes → run affected suites → independent review → full regressions → update issue/backlog/decision/handoff → repeat.

**Standard commands** (from `strongman-source/`; check files and dependencies exist):

```sh
node build.cjs
node test.cjs
node test-audit.cjs
node test-season.cjs
node test-server.cjs
node cloudflare/test-worker.mjs
node test-demo.cjs
node test-contrast.cjs
node qa/test-ui.cjs
node qa/test-browser.cjs
```

If QA packages unavailable, use `npm install --prefix qa/harness` only after reading `qa/harness/package.json`; browser install may be necessary (`npx playwright install chromium` from `qa/harness`). Do not use production credentials or records. No blanket `npm audit fix`/dependency upgrades without review.

**Write conflict map** — High-conflict files: `core.js`, `app.js`, `build.cjs`, `storage.js`, `cloudflare/*`, global CSS files, `season-ui.js`, `visitors.js`, generated HTML. Assign exactly one writer; specialized peers review and write tests separately. Keep changes in small isolated topic branches/commits, review diffs, avoid force push or direct default-branch push. If git status has unrelated local modifications, preserve them; do not reset/stash blindly.

**Release gates** — New/fixed features must have exact repro + test assertions, supporting full suite, BG/EN + phone + offline impact review, no private-data exposure and owner-approved rule assumptions. Production deployment (especially auto-deploy via `main`) is a separate human-approved action after a preview/release checklist. No live competition test writes. Root index and other projects must remain byte-for-byte unchanged.

**When blocked** — Switch to non-conflicting safe work; document one exact approval question, not open-ended planning. If the session ends, write handoff with most recent git status, verified commands, remaining failures, active agent outputs, branch/commit and next exact task. A prompt alone cannot guarantee unattended around-the-clock execution.

**Backlog scoring** — `(impact*confidence*frequency)/(effort*risk)` using ordinal impact/frequency/effort/risk 1..5, confidence 0..1. Unknown estimates labeled. Correctness/security/data loss outrank formulas.

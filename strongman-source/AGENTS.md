# Strongman Arena — project guidance for Codex

Scope: `strongman-source/` within `stanimir559-bit/projects_1`. This is the canonical source. Generated pages are `../strongman/strongman-arena.html` and `../strongman/visitors.html`; `build.cjs` also regenerates `cloudflare/scoring.mjs`. Preserve all other projects in the repository.

Read `README.md`, `agent-ops/RUNBOOK.md`, current audit notes and relevant tests before touching behavior. Inspect git status; do not overwrite existing work. The production app is a bilingual, offline-first referee/season/visitor tool with real scoring and protected Cloudflare D1 sync. Treat it as safety- and data-integrity-sensitive.

When tasked with independent parallel work, spawn named specialist subagents from `.codex/agents/` (or equivalent when unavailable). Prefer parallel read-only audits; serialize writes for shared modules. One write owner per file; reviewer/test agent separately validates. Main agent must integrate, verify and own the release decision. Roles are expertise, not independent permission boundaries.

Execute the existing test commands from this directory (check existence first): `node build.cjs`; `node test.cjs`; `node test-audit.cjs`; `node test-season.cjs`; `node test-server.cjs`; `node cloudflare/test-worker.mjs`; `node test-demo.cjs`; `node test-contrast.cjs`; `node qa/test-ui.cjs`; `node qa/test-browser.cjs`. Browser dependencies in `qa/harness/` may need deliberate setup. Report exact verified/skipped results.

Do not change the event scoring semantics, athlete/season identity logic, sync/conflict guarantees, public privacy boundary, secret handling, or production data absent explicit organizer approval and verified migration/fallback. Never run production writes or deployment without approval. Never touch root `index.html`, Dennylicious, or unrelated projects. A successful local build is not approval to publish. Be strict about unknown external libraries, cost, license and supply-chain risk.

Autonomy: read, research, prioritize, implement scoped and reversible local patches, test, get independent review, document, repeat. If blocked on a privileged action, continue safe backlog items. Maintain durable state in `agent-ops/ROADMAP.md`, `DECISIONS.md` and `SESSION-HANDOFF.md`. Do not assume continuous background operation beyond a Codex session. Ask only when truly necessary. Communicate summary and blockers in Bulgarian.

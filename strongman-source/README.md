# Strongman Arena

Standalone Bulgarian/English scoring. Open `/strongman/strongman-arena.html`. Cloudflare Worker setup: [cloudflare/DEPLOY-BG.md](cloudflare/DEPLOY-BG.md). Research and 52 suggested templates: [RESEARCH.md](RESEARCH.md).

Rebuild from the repository root: `node strongman-source/build.cjs`. Scoring checks: `node strongman-source/test.cjs`. Cloudflare SQL/handler checks (Node 24): `node strongman-source/cloudflare/test-worker.mjs`.

The app stores local results and drafts, an audit log, undo/redo, JSON backup, real DOCX and CSV exports. Shared scoring uses D1 through the namespaced Worker API. No secrets or tournament data are committed. Word ZIP/XML/table structure was verified; a Word/LibreOffice visual render was unavailable in the development environment.

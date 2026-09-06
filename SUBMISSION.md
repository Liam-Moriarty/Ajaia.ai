# Submission

Ajaia Full Stack Product Engineer take-home — collaborative document editor.

## Included in this repository

- **Source code** — `apps/web` (the product; React + TypeScript + Vite), `supabase/migrations/0001_init.sql` (schema + RLS policies). `apps/server` is an unused stub, intentionally not built on (see `docs/TDD.md`).
- **`README.md`** — setup/run instructions, required env vars, supported import file types.
- **`docs/PDD.md`** — Product Design Document.
- **`docs/TDD.md`** — Technical Design Document (data model, RLS policies, data flow, error handling).
- **`docs/architecture-note.md`** — condensed architecture note: what was prioritized and why, what's incomplete.
- **`docs/ai-workflow-note.md`** — AI tools used, where they sped things up, what was changed/rejected, how correctness was verified.
- **This file (`SUBMISSION.md`)**.

## Not included in this repository (add before final submission)

- **Live deployment URL** — Vercel project is linked; confirm the deployed URL after pushing this branch and add it here.
- **Walkthrough video** — 3-5 minute recording covering the main user flow, what works end to end, what was deprioritized, and how AI supported the workflow. Add the URL (Loom/YouTube unlisted) in a plain text file alongside this one, per the assessment's submission format.
- **Test account credentials / seeded users**, if you want reviewers to skip signing up two accounts themselves to exercise sharing.
- **Screenshots or a demo GIF**, only if any setup step needs more than what's in the README.

## What's working

Sign-up/sign-in, document create/rename/edit with autosave, bold/italic/underline/headings/bulleted+numbered lists, `.txt`/`.md` import as a new document, and email-based sharing with a visible owned-vs-shared distinction that persists across refresh and re-login — enforced at the data layer via Postgres RLS, not just hidden in the UI.

## What's incomplete

See `docs/architecture-note.md`'s "What's incomplete" section: no revoke-access action, no conflict handling for simultaneous multi-tab edits, markdown import doesn't handle nested lists/links/code blocks, and automated test coverage is limited to the import-parsing logic.

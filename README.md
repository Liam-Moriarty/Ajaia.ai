# Collaborative Document Editor

A lightweight, Google Docs-inspired document editor built for Ajaia's Full Stack Product Engineer take-home assessment. Users sign up, create and format rich-text documents, import `.txt`/`.md` files as new documents, and share documents with other users by email.

See `docs/PDD.md` (product design) and `docs/TDD.md` (technical design) for the full design rationale, and `docs/architecture-note.md` / `docs/ai-workflow-note.md` for the condensed writeups required by the assessment.

## Stack

- **Frontend**: React + TypeScript + Vite (`apps/web`), Tiptap for rich text, React Router for navigation.
- **Backend**: Supabase (Postgres + Auth + Row Level Security) — no custom API server; the client talks to Postgres directly and RLS enforces access control.
- **Deployment**: Vercel (`apps/web`).

## Local setup

Prerequisites: Node 18+, pnpm 8 (`corepack enable` will pick up the pinned version).

```sh
pnpm install
```

Create `apps/web/.env` (see `apps/web/.env.example`) with your Supabase project's credentials:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

The schema (`profiles`, `documents`, `document_shares` tables + RLS policies) lives in `supabase/migrations/0001_init.sql`. Apply it to your Supabase project via the SQL editor in the Supabase dashboard, or `supabase db push` if you have the CLI linked.

In the Supabase dashboard, under **Authentication → Providers → Email**, turn **Confirm email** off. Supabase's built-in email sender has a low rate limit (a few emails/hour), and sign-up will otherwise fail with "email rate limit exceeded" after a couple of test accounts. With confirmation off, `signUp()` logs the user in immediately with no email sent.

Run the app:

```sh
pnpm --filter web dev
```

## Testing

```sh
pnpm --filter web test       # unit tests (Vitest)
pnpm --filter web typecheck
pnpm --filter web lint
```

The one automated test covers `apps/web/src/lib/parseImport.ts` — the `.txt`/`.md` → Tiptap-JSON conversion, which is the highest-risk hand-written logic in the app.

## Supported file imports

Only `.txt` and `.md` files can be imported as new documents. Any other file type is rejected client-side with an explicit error message. The original uploaded file is not retained — only its parsed content is saved as a new document.

## Sharing

Share a document with another registered user by entering their email in the editor's "Share" dialog. Shared documents appear under "Shared with me" on the document list, visibly distinct from "My documents". There are no permission tiers — anyone a document is shared with can view and edit it.

## What's out of scope

Real-time multi-cursor collaboration, view-only vs. edit permission tiers, `.docx` import, comments/suggestion mode, version history, and PDF export are all explicitly deprioritized — see `docs/TDD.md` for the full list and reasoning.

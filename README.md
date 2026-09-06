# Collaborative Document Editor

A lightweight, Google Docs-inspired document editor built for Ajaia's Full Stack Product Engineer take-home assessment. Users sign up, create and format rich-text documents, import `.txt`/`.md`/`.pdf`/`.docx` files as new documents, and share documents with other users by email.

See `docs/PDD.md` (product design) and `docs/TDD.md` (technical design) for the full design rationale, and `docs/architecture-note.md` / `docs/ai-workflow-note.md` for the condensed writeups required by the assessment.

## Live deployment

**https://ajaia-ai-web-git-main-fernando-ordiales-projects.vercel.app/**

No test account is required — sign-up works with any email/password (see "Local setup" below for disabling email confirmation), or a reviewer can create two accounts to exercise the sharing flow.

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

The automated tests cover `apps/web/src/lib/parseImport.ts` — the `.txt`/`.md` → Tiptap-JSON conversion, which is the highest-risk hand-written logic in the app (PDF/DOCX extraction delegates to `pdfjs-dist`/`mammoth` and isn't separately unit tested) — plus `apps/web/src/lib/formatUpdatedAt.ts`'s relative-timestamp formatting.

## Supported file imports

Only `.txt`, `.md`, `.pdf`, and `.docx` files can be imported as new documents (`.pdf` via `pdfjs-dist`, `.docx` via `mammoth`, both parsed client-side). Any other file type (e.g. `.doc`, `.rtf`, `.odt`, images) is rejected before upload with an explicit error message, both in the file picker's `accept` filter and in a validation check on the selected file. The original uploaded file is not retained — only its parsed content is saved as a new document.

## Validation and error handling

- **Import**: file type is checked against the supported-extension allowlist before parsing (`apps/web/src/lib/parseImport.ts`), with a matching pre-check in the UI (`apps/web/src/pages/DocumentListPage.tsx`) that surfaces a specific error message before any upload happens. Parsing failures (corrupt/unreadable files) are caught and shown as a user-facing error rather than failing silently.
- **Auth**: sign-in/sign-up forms use HTML5 `required` fields and a minimum password length; Supabase auth errors (e.g. wrong password, existing account) are caught and rendered inline on the form.
- **Sharing**: the share dialog distinguishes "no user found for that email" from "already shared with this user" (a Postgres unique-constraint violation) and shows a specific message for each, rather than a generic failure.
- **Data loading/saving**: document list and document editor hooks track a Supabase query/save error in state and render it inline instead of leaving the UI in a stuck loading state; documents show explicit "No documents yet." / "Nothing shared with you yet." empty states rather than a blank list.

## Sharing

Share a document with another registered user by entering their email in the editor's "Share" dialog. Shared documents appear under "Shared with me" on the document list, visibly distinct from "My documents". There are no permission tiers — anyone a document is shared with can view and edit it.

## What's out of scope

Real-time multi-cursor collaboration, view-only vs. edit permission tiers, comments/suggestion mode, version history, and PDF export are all explicitly deprioritized — see `docs/TDD.md` for the full list and reasoning.

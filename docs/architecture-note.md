# Architecture Note

Condensed from `docs/TDD.md` — see that document for the full data model, RLS policies, and error-handling design.

## What was built

A React + TypeScript + Vite single-page app (`apps/web`) talking directly to Supabase (Postgres + Auth) — no custom backend. Postgres Row Level Security is the authorization boundary, not a hand-rolled API layer.

- **Editing**: Tiptap (ProseMirror) for bold/italic/underline/headings/bulleted+numbered lists, autosaved to Postgres on a ~1s debounce.
- **Import**: `.txt`/`.md`/`.pdf`/`.docx` files are parsed client-side (`pdfjs-dist` for PDF, `mammoth` for `.docx`) into Tiptap's JSON document format and inserted as new documents. Other file types are rejected with an explicit message.
- **Sharing**: entering a collaborator's email resolves it to a `profiles` row and inserts a `document_shares` row; RLS grants that user read/update access on their next query. The document list shows "My documents" and "Shared with me" as visibly separate sections.
- **Auth**: Supabase email/password, gating all document routes behind a route guard that redirects to `/login`.

## Why this architecture, given the timebox

- **No custom server**: an Express layer in `apps/server` was considered and rejected. Talking to Supabase directly from the client cuts an entire layer of CRUD boilerplate, while Postgres RLS still demonstrates a real, testable access-control design — the thing actually being evaluated. `apps/server` is left unused.
- **Supabase over a hand-rolled store**: gets Postgres, Auth, and RLS for free, with no paid dependency for reviewers.
- **Tiptap over a from-scratch contentEditable implementation**: rich-text editing (marks, node hierarchy, serialization) is exactly the kind of problem not worth re-solving in a 4-6 hour window.
- **Sharing has no permission tiers**: presence of a `document_shares` row is the only access signal (view+edit, not view-only vs. edit). A simple, correct model beats a partially-implemented richer one.
- **Import doesn't retain the original file**: no Supabase Storage bucket is used; only the parsed content is kept. Avoids a second storage system for a feature whose value is the resulting document, not the file itself.

## Deliberate scope cuts

Real-time multi-cursor collaboration, view-only vs. edit permission tiers, comments/suggestion mode, version history, and PDF export were all explicitly deprioritized — none were required by the assessment brief, and each would have traded core-feature depth for breadth.

## What's incomplete / what I'd build next with 2-4 more hours

- Automated tests only cover `parseImport.ts` (the highest-risk pure logic). With more time: component/integration tests for the auth flow, share flow, and RLS-enforced access boundaries (e.g. a non-shared user genuinely cannot read a document).
- No optimistic UI/conflict handling if two tabs edit the same document simultaneously (last write wins via the debounced autosave) — acceptable given no real-time collaboration is in scope, but worth flagging.
- Markdown import handles headings, bold, italic, and single-level bullet/numbered lists; it doesn't handle nested lists, links, or code blocks.
- No revoke-access action in the share dialog yet — sharing is add-only.

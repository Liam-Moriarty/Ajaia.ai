<!-- Technical Design Documentation -->

# Technical Design Document

## Tech Stack

- **Frontend**: React + TypeScript + Vite (`apps/web`, already scaffolded).
- **Editor**: Tiptap (ProseMirror-based) for rich text — bold/italic/underline/headings/lists out of the box.
- **Backend-as-a-service**: Supabase — Postgres (data), Auth (email/password), Row Level Security (authorization). No custom backend server; `apps/server` stub is unused/removed for this feature.
- **Testing**: Vitest (already configured at the repo root and in `packages/ui`).
- **Deployment**: Vercel for `apps/web` (static Vite build), env vars for Supabase URL + anon key.
- **Tooling**: existing turborepo/pnpm workspace, ESLint/Prettier/Husky/commitlint/changesets — unchanged.

## High-Level Architecture

```
Browser (apps/web)
  ├─ Supabase Auth  ──────────────► manages sessions, issues JWT
  ├─ Supabase JS client ──────────► reads/writes Postgres directly
  │                                  (documents, document_shares, profiles)
  └─ Tiptap editor  ──────────────► in-browser rich-text state, synced
                                     to `documents.content` (debounced)

Supabase (hosted)
  ├─ Postgres  ── documents, document_shares, profiles tables + RLS policies
  ├─ Auth      ── email/password users
  └─ trigger: on new auth.users row → insert into profiles(id, email)
```

There is no custom API layer: the web app talks to Supabase directly, and Postgres RLS is the authorization boundary. This was chosen over a thin Express layer in `apps/server` to keep the surface area small given the timebox, while RLS policies still demonstrate real access-control design.

## Data Model (Low-Level)

### `profiles`

| column | type         | notes                                                                                                                    |
| ------ | ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| id     | uuid, pk     | = `auth.users.id`                                                                                                        |
| email  | text, unique | populated by trigger on signup; lets us resolve a share-by-email to a user id (client can't query `auth.users` directly) |

### `documents`

| column     | type                   | notes                                |
| ---------- | ---------------------- | ------------------------------------ |
| id         | uuid, pk               | default `gen_random_uuid()`          |
| owner_id   | uuid, fk → profiles.id |                                      |
| title      | text                   | default `"Untitled document"`        |
| content    | jsonb                  | Tiptap's native JSON document format |
| created_at | timestamptz            | default `now()`                      |
| updated_at | timestamptz            | updated on write                     |

### `document_shares`

| column         | type                    | notes                                                                                                  |
| -------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| id             | uuid, pk                |                                                                                                        |
| document_id    | uuid, fk → documents.id |                                                                                                        |
| shared_with_id | uuid, fk → profiles.id  | presence of a row = access granted; no separate permission levels (everyone shared-with can view+edit) |
| created_at     | timestamptz             |                                                                                                        |

### RLS Policies

- `documents`: owner has full select/insert/update/delete on rows where `owner_id = auth.uid()`; a user also has select/update on rows where a matching `document_shares` row exists for `auth.uid()`.
- `document_shares`: a document's owner can insert/select/delete share rows for their own documents; a shared user can select rows where `shared_with_id = auth.uid()` (to know what's shared with them).
- `profiles`: readable by any authenticated user (needed to resolve share-by-email), writable only by trigger.

## Frontend Structure (Low-Level)

```
apps/web/src/
├─ lib/supabase.ts          # client init
├─ lib/parseImport.ts       # .md/.txt → Tiptap JSON (pure function, unit tested)
├─ hooks/useAuth.ts
├─ hooks/useDocuments.ts     # list owned + shared documents
├─ hooks/useDocument.ts      # single doc read/write/autosave
├─ pages/LoginPage.tsx
├─ pages/DocumentListPage.tsx   # owned vs. shared sections, new/import actions
├─ pages/DocumentEditorPage.tsx # Tiptap editor, title rename, share dialog
├─ components/DocumentCard.tsx
├─ components/ShareDialog.tsx
└─ components/EditorToolbar.tsx
```

Shared, reusable UI primitives (buttons, dialogs) live in `packages/ui`; the Tiptap editor wrapper stays local to `apps/web` since it has a single consumer.

## Data Flow

1. Sign-in → Supabase Auth session established, JWT used for all subsequent Postgres requests.
2. Document list page queries `documents` (owned) and a join through `document_shares` (shared-with-me), rendered in two visibly distinct sections.
3. Editor page loads one `documents` row, hydrates Tiptap from `content`; on change, writes are debounced (~1s) back to `content`/`updated_at`.
4. Import: `FileReader` reads the picked file client-side → `parseImport.ts` converts `.md`/`.txt` to Tiptap JSON → inserts a new `documents` row → navigates to its editor page. No Supabase Storage bucket is used; the raw file is not retained, only its parsed content.
5. Share: user enters a collaborator's email → resolve to `profiles.id` → insert a `document_shares` row → RLS grants that user access on their next query.

## Error Handling

- Auth: invalid credentials/duplicate email surfaced inline from Supabase's error response.
- Import: unsupported extension blocked client-side with an explicit message naming the two supported types (`.txt`, `.md`).
- Share: email not found among registered users, or already shared, surfaced inline; no silent failures.
- Save/query failures: inline retry-capable error state rather than a blank/broken screen.
- Route guard redirects unauthenticated users to `/login`.

## Testing

- Unit test (Vitest) on `parseImport.ts`: pure, deterministic, and the highest-risk hand-written logic in the app (markdown → Tiptap JSON mapping for headings/bold/italic/lists) — best return on one meaningful automated test given the timebox.

## Deliverables Mapping

- `README.md` — setup/run instructions, required Supabase env vars, stated supported import file types.
- `docs/architecture-note.md` — condensed version of this document: what was prioritized and why.
- `docs/ai-workflow-note.md` — AI tools used, where they sped things up, what was changed/rejected, how correctness was verified.
- `SUBMISSION.md` — exact list of what's included in the submission.
- Live deployment: `apps/web` on Vercel.

## Explicitly Deprioritized (Scope Cuts)

- Real-time collaboration/multi-cursor.
- View-only vs. edit permission tiers (shared = edit access only).
- `.docx` import.
- Storage-backed retention of the original uploaded file.
- Comments/suggestion mode, version history, PDF export (all optional stretch, not committed scope).

---

## Monorepo Structure

```
ajaia/
├── .github/
├── .husky/
│ ├── _/
│ ├── pre-commit ← lint-staged
│ ├── commit-msg ← commitlint
│ ├── pre-push ← turbo test + typecheck
│ ├── post-merge ← reinstall if lockfile changed
│ ├── pre-rebase ← block rebase on main
│ └── post-checkout ← reinstall if lockfile changed
├── apps/
│ ├── web/       ← the product (this feature lives here)
│ └── server/    ← unused stub for this feature; not extended
├── context/      ← assessment brief and source materials
├── docs/
├── packages/
│ ├── eslint-config/ ← shared ESLint rules
│ ├── typescript-config/
│ └── ui/         ← shared UI primitives
├── .commitlintrc.js
├── .eslintrc.js
├── commitlint.config.js
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── pnpm-lock.yaml
```

# AI Workflow Note

## Tools used

Claude Code (Anthropic) was the only AI tool used, end to end: drafting the Product Design Doc and Technical Design Doc, planning the implementation, writing the application code and its test, and writing this set of deliverable docs.

## Process

Work was deliberately sequenced rather than prompted straight into code: Product Design Doc (`docs/PDD.md`) → Technical Design Doc (`docs/TDD.md`, including the full data model and RLS policy design) → Supabase schema/project setup and Vercel project linking → an explicit implementation plan reviewed before any code was written → implementation, in dependency order (client → hooks → pages → import logic + test → docs). Locking product and technical scope first, in writing, before generating any code meant the implementation stayed aligned to a fixed feature set instead of drifting.

## Where AI materially sped things up

- Generating the full CRUD + auth + routing scaffold (hooks, pages, components) in one pass from an already-agreed technical design, rather than building each piece interactively.
- Writing `parseImport.ts`'s markdown→Tiptap-JSON mapping test-first: specifying the exact expected JSON shape for headings/bold/italic/lists up front made the implementation itself close to mechanical, and caught the parser producing the right output on the first implementation attempt.
- Producing this and the architecture note as structured writeups grounded directly in the TDD, instead of reconstructing the reasoning after the fact.

## What AI-generated output was changed or rejected

- The scaffold's `apps/web/package.json` had `@repo/ui` pinned to a Windows-path tarball (`file:..\\..\\packages\\ui\\repo-ui-0.0.0.tgz`) instead of `workspace:*` — a template leftover, not something to build on; changed to a normal workspace dependency.
- The initial `useAuth` hook was a bare hook, not a context provider — every consumer would have opened its own Supabase auth subscription and could momentarily disagree on session state. Restructured into a single `AuthProvider` + `useAuth` context before wiring it into more than one page.
- `apps/web`'s lint script (`eslint "src/**/*.ts"`) silently excluded every `.tsx` file — meaning the entire UI layer was never being linted. Caught by noticing zero lint errors on a codebase full of new components, which didn't add up; fixed the glob to include `.tsx`.
- The DB's `documents.content` column defaults to `'{}'::jsonb`, which is not a valid Tiptap document. New-document creation was changed to explicitly insert a valid empty doc (`{type:"doc",content:[{type:"paragraph"}]}`) rather than relying on that default.

## How correctness was verified

- `parseImport.ts` has 9 unit tests (Vitest) covering plain-text line wrapping, heading levels, bold/italic inline marks, bulleted and numbered lists, and a mixed document — all passing.
- `pnpm --filter web typecheck`, `pnpm --filter web lint`, `pnpm --filter web test`, and `pnpm --filter web build` were all run and confirmed green after implementation, not assumed from the generated code alone; the type/lint fixes above were found this way.
- End-to-end manual verification of the live flows (sign-up, formatting, rename, import, cross-account sharing after refresh) against the deployed app is called out separately in `docs/architecture-note.md` and should be done by a human reviewer in the browser — this is explicitly not something automated in this pass.

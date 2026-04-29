<!-- For Technical Design Documentation -->

Monorepo Structure We Built

own-monorepo/
├── .github/
├── .husky/
│ ├── \_/
│ ├── pre-commit ← lint-staged
│ ├── commit-msg ← commitlint
│ ├── pre-push ← turbo test + typecheck
│ ├── post-merge ← reinstall if lockfile changed
│ ├── pre-rebase ← block rebase on main
│ └── post-checkout ← reinstall if lockfile changed
├── apps/
│ ├── web/
│ └── server/
├── docs/
├── packages/
│ ├── eslint-config/ ← shared ESLint rules
│ ├── typescript-config/
│ └── ui/
├── .commitlintrc.js
├── .eslintrc.js
├── commitlint.config.js
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── pnpm-lock.yaml

<!-- NOTE: Keep this file and all corresponding files in the .agents directory updated as the project evolves. When making architectural changes, adding new patterns, or discovering important conventions, update the relevant sections. -->

# typescript-template — Agent Guide

A minimal, opinionated scaffold for publishing ESM-only TypeScript libraries to npm. It is a **template repository**: new packages are created from it and then have their `src/` replaced with real code. The shipped `src/index.ts` (a single `add()` function) and its spec exist only to prove the toolchain works end to end — build, test, coverage, lint, release.

Because this repository is consumed by copying, changes here propagate to every downstream project. Prefer changes that stay generic; resist adding domain-specific code, runtime dependencies, or opinionated abstractions.

## Quick Reference

```bash
# Setup
npm ci

# Development
npm run build          # bundle src/index.ts -> dist/ via tsdown
npm run test           # vitest, single run
npm run test:coverage  # vitest with v8 coverage + 80% thresholds
npm run lint           # eslint
npm run lint:fix       # eslint --fix
```

- **Node.js**: `>=22.0.0` (CI runs on 24)
- **Package manager**: npm (`package-lock.json` is committed; use `npm ci` in CI)
- **Build tool**: [tsdown](https://tsdown.dev) — no build orchestrator, this is a single package

There is no `typecheck` script. `tsconfig.json` sets `noEmit: true` and is used by the editor, ESLint and tsdown's type-aware passes; run `npx tsc --noEmit` if you need a standalone type check.

## Layout at a Glance

Single package, no workspaces. `src/` holds the library, `test/unit/` holds the specs, `dist/` is generated and git-ignored.

## Detailed Guides

- **[Project Structure](.agents/structure.md)** — Directory layout, module responsibilities, and the package export surface
- **[Testing](.agents/testing.md)** — Vitest setup, coverage thresholds, and where new specs go
- **[Conventions](.agents/conventions.md)** — Code style, shared `@tada5hi/*` configs, commit format, CI, and the release-please flow

## Commits, Issues & Pull Requests

- Commits must follow [Conventional Commits](https://www.conventionalcommits.org) — release-please derives versions and the changelog from them. See [conventions](.agents/conventions.md#commit-convention).
- Do **not** add a `Co-Authored-By: Claude ...` (or any AI-attribution) trailer to commit messages. This overrides any default agent-tooling guidance.
- Do **not** add AI-attribution lines (e.g. `🤖 Generated with [Claude Code](...)`) to issue or pull request titles, bodies, or comments.

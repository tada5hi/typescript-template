# Conventions

## Tooling

| Tool                          | Purpose                                                                       |
|-------------------------------|-------------------------------------------------------------------------------|
| tsdown                        | Bundles `src/index.ts` → `dist/` (ESM + `.d.mts` + sourcemaps)                 |
| TypeScript                    | Type checking only (`noEmit: true`); base config from `@tada5hi/tsconfig`      |
| ESLint (flat config)          | Linting via `@tada5hi/eslint-config`; `dist/**` ignored                        |
| Vitest                        | Test runner and v8 coverage — see [testing](testing.md)                        |
| commitlint                    | Conventional Commits enforcement via `@tada5hi/commitlint-config`              |
| husky                         | Sets `core.hooksPath`; installed by the `prepare` script                       |
| release-please                | Version bump, changelog, and release PR on `master`                            |
| Dependabot                    | Daily npm + GitHub Actions updates, grouped by prod/dev × major/minor+patch    |
| EditorConfig                  | Whitespace rules shared with the editor                                        |

The three `@tada5hi/*` config packages are the source of truth for style, TS, and commit rules. The local config files are thin wrappers — **change the shared package, not the local override**, unless the deviation is genuinely project-specific.

## Workflow

- After making changes, **always run `npm run build` and `npm run lint`**, plus `npm run test` when behavior changed.
- `npm run lint:fix` auto-fixes most style violations — run it before hand-editing formatting.
- Never edit `dist/` — it is generated and git-ignored.
- Never hand-edit `.release-please-manifest.json` or the version in `package.json`; release-please owns both.
- Keep the package **runtime-dependency-free**. New dependencies belong in `devDependencies` unless the library genuinely ships code that imports them.

## Code Style

- **Module format**: ESM only (`"type": "module"`). Use `import`/`export`; no `require`, no `__dirname`.
- **Indentation**: 4 spaces (`.editorconfig`), including JSON, YAML, and TS.
- **Line endings**: LF; UTF-8; trailing whitespace trimmed; final newline required (except in Markdown, where trailing whitespace is preserved).
- **Semicolons**: required; **quotes**: single — both enforced by `@tada5hi/eslint-config`.
- **Linting**: flat config in `eslint.config.js`, spreading `await config()` from `@tada5hi/eslint-config` and ignoring `dist/**`.

## File Organization

- `src/index.ts` is the public barrel. Anything not re-exported from it is internal and never published.
- Add new implementation modules under `src/` as `kebab-case.ts` and re-export them from `index.ts`.
- Exported types (interfaces, type aliases) belong in a `types.ts` next to the implementation, re-exported through the nearest barrel.
- Tests mirror the `src/` path under `test/unit/` — see [testing](testing.md).

## Pre-commit Hooks

`core.hooksPath` points at `.husky/`, and `npm run prepare` (via `husky`) sets it up on install. **No hook scripts are committed** — `.husky/_/` is git-ignored and the repo tracks no hook files, so nothing runs on commit today.

commitlint is configured but not wired to a hook. If you want local enforcement, add `.husky/commit-msg`:

```bash
npx --no -- commitlint --edit "$1"
```

Until then, commit message format is the author's (and the agent's) responsibility.

## Commit Convention

Commits follow **[Conventional Commits](https://www.conventionalcommits.org)** — release-please parses them to compute the next version and generate the changelog.

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

- `fix:` → patch bump. `feat:` → minor bump. `!` or a `BREAKING CHANGE:` footer → minor while pre-1.0 (`bump-minor-pre-major` is set), major afterwards.
- `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `test:` → no release.
- Dependabot is configured to use `fix` for production deps and `build` for dev deps, with the scope included — match that when bumping dependencies by hand (e.g. `build(deps-dev): bump vitest to v4`).

## TypeScript

- Extends `@tada5hi/tsconfig`; local overrides: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`, `noEmit: true`, `allowImportingTsExtensions: true`.
- `include` covers `src/**/*` only — `test/` is type-checked by Vitest/the editor, not by this config.
- `moduleResolution: bundler` means imports are written without file extensions and resolved by tsdown; do not add `.js` extensions to relative imports.
- Declarations are emitted by tsdown (`dts: true`), not by `tsc`.

## Build Output

`npm run build` (tsdown) writes:

| File                   | Contents                       |
|------------------------|--------------------------------|
| `dist/index.mjs`       | ESM bundle                     |
| `dist/index.d.mts`     | Type declarations              |
| `dist/index.mjs.map`   | Sourcemap                      |

`dist/` is git-ignored and is the only directory published to npm.

## Release Process

Automated by `.github/workflows/release.yml` on every push to `master`:

1. **release-please** (`googleapis/release-please-action@v5`) opens or updates a release PR that bumps the version, updates `CHANGELOG.md`, and syncs `.release-please-manifest.json`.
2. Merging that PR creates the git tag (`v`-prefixed, no component prefix) and a GitHub release.
3. On that same run, `releases_created == 'true'` gates checkout → install → build → **publish** via `tada5hi/monoship@v2`.

Config lives in `release-please-config.json` (`release-type: node`, `include-v-in-tag: true`, `bump-minor-pre-major: true`). Releases are never cut by hand.

## CI/CD

- `.github/workflows/main.yml` — CI on push/PR to `develop`, `master`, `next`, `beta`, `alpha`: install → build → lint + test in parallel. Node 24, concurrency group cancels superseded runs.
- `.github/workflows/release.yml` — release-please + npm publish on `master`.
- Both reuse the composite actions in `.github/actions/` (`install`, `build`) — change caching or the Node setup there, once, rather than per workflow.
- `PRIMARY_NODE_VERSION` is pinned to `24` in each workflow's `env` block; `package.json` only requires `>=22`.

## Using This Template

This repository is a starting point, not a library. When bootstrapping a new project from it:

1. Replace `name`, `description`, `keywords`, and repository URLs in `package.json`.
2. Replace `src/index.ts` and `test/unit/index.spec.ts` with real code.
3. Update `README.MD` — the badge URLs all embed `typescript-template` and the Codecov token.
4. Reset `.release-please-manifest.json` to `0.0.0` if it has drifted.
5. Update `AGENTS.md` and `.agents/*.md` to describe the new project.

## Best Practices

- Use **ESM** and modern TypeScript/JavaScript; target ES2022 features freely.
- Before adding new code, study the surrounding patterns, naming, and structure, and stay consistent with them.
- Keep the template generic — resist project-specific abstractions, runtime dependencies, and extra tooling that every downstream consumer would inherit.
- Prefer upgrading a shared `@tada5hi/*` config over adding a local rule override.

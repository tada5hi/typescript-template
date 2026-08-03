# Testing

## Setup

- **Runner**: [Vitest](https://vitest.dev)
- **Test location**: `test/unit/**/*.{test,spec}.{js,ts}` — files outside this glob are **not** picked up
- **Config**: `test/vitest.config.ts` (not in the project root — the npm scripts pass `--config` explicitly)
- **Prerequisite**: `npm ci`. No database, container, or external service is required.

## Running Tests

```bash
npm run test                                          # run all tests once
npm run test:coverage                                 # run all tests with coverage
npx vitest --config test/vitest.config.ts             # watch mode
npx vitest --config test/vitest.config.ts --run test/unit/index.spec.ts   # single file
```

`npm run test` already passes `--run`, so it never enters watch mode — safe for CI and for agents.

## Test Layers

### Unit Tests

`test/unit/` holds the only test layer. Specs import from the **source**, not from `dist/`:

```typescript
import { describe, expect, it } from 'vitest';
import { add } from '../../src';

describe('src/index.ts', () => {
    it('should add numbers', () => {
        const result = add(1, 2);
        expect(result).toEqual(3);
    });
});
```

Conventions visible in the existing spec:

- The top-level `describe` names the source file under test (`'src/index.ts'`).
- `it` titles read as `should ...`.
- Import through the barrel (`'../../src'`) rather than deep paths, so tests exercise the public surface.

There are no integration tests, no fixtures, and no test helpers. If a downstream project needs them, add a sibling directory (e.g. `test/integration/`) **and** widen the `include` glob in `test/vitest.config.ts` — otherwise the new tests are silently skipped.

## Testing Philosophy

Tests should assert *expected* behavior based on the module contract — not merely confirm what the implementation currently does. If a test fails, it may surface a real bug in the implementation rather than a test error.

Prefer real implementations and small fake objects over `vi.fn()` / `vi.mock()`. Module mocking couples tests to import structure and hides breaking changes; a hand-written fake that satisfies the same interface keeps tests honest. Reach for `vi.mock` only for genuinely unavoidable boundaries (clock, filesystem, network).

## Code Coverage

```bash
npm run test:coverage
```

Provider is **v8**, and coverage is measured over `src/**/*.{ts,tsx,js,jsx}` only. Thresholds are enforced — the command **fails** below any of them:

| Metric     | Threshold |
|------------|-----------|
| Branches   | 80%       |
| Functions  | 80%       |
| Lines      | 80%       |
| Statements | 80%       |

Reports land in `coverage/` (git-ignored). The README links a Codecov badge, but no upload step is wired into CI.

## CI Pipeline

GitHub Actions (`.github/workflows/main.yml`) on pushes and PRs to `develop`, `master`, `next`, `beta`, `alpha`:

```
install ──► build ──┬──► lint   (npm run lint)
                    └──► tests  (npm run test)
```

Node 24, `npm ci`, with `node_modules` cached by `package-lock.json` hash and `dist/` cached by commit SHA. Note CI runs `npm run test`, **not** `test:coverage` — coverage thresholds are not gating merges today.

## Writing New Tests

1. Place the file in `test/unit/` with a `.spec.ts` (or `.test.ts`) extension, mirroring the `src/` path it covers.
2. Import the symbol under test from the barrel (`'../../src'`).
3. Name the outer `describe` after the source file and phrase `it` titles as `should ...`.
4. Run `npm run test` to verify, and `npm run test:coverage` if the change could move coverage below 80%.

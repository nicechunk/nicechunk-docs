# NiceChunk Supply Chain Security

This document explains how NiceChunk handles dependency risk, lockfiles, and audit findings. It is written for maintainers, external reviewers, and automated agents that need reproducible supply-chain evidence.

## Dependency Principles

- `package-lock.json` is committed and must be reviewed with dependency changes.
- Use `npm install` only when intentionally updating dependency metadata.
- Do not run `npm audit fix --force` without reviewing the proposed package graph change. npm may suggest major downgrades that break Solana compatibility.
- Public release validation must distinguish unexpected vulnerabilities from tracked upstream advisories.
- Split repositories that include `package.json` also include the lockfile produced from the main working tree.

## Commands

Run the controlled dependency audit:

```bash
npm run audit:deps
```

Run full release validation, including dependency audit:

```bash
npm run validate:release:full
```

## Current Controlled Exceptions

The dependency audit allows only these tracked upstream findings:

| Package | Advisory | Source | Status |
| --- | --- | --- | --- |
| `bigint-buffer` | `GHSA-3gc7-fjrx-p6mg` | Transitive dependency of `@solana/spl-token` through `@solana/buffer-layout-utils` | No non-breaking fix is available in the current `@solana/spl-token` package line. |
| `uuid` | `GHSA-w5hq-g745-h8pq` | Transitive dependency of `@solana/web3.js` through `jayson` | npm's suggested fix downgrades `@solana/web3.js` to an unusable pre-1.x version. |

These exceptions are not treated as permanent. Recheck them whenever Solana packages publish a compatible upgrade.

## Resolved In This Repository

- Vite was upgraded to the current major line to remove the old `esbuild` development-server advisory.
- Mocha's transitive `diff` and `serialize-javascript` packages are pinned with npm `overrides` to patched versions while keeping the current Mocha test runner.

## Review Requirements

Dependency changes should include:

- the package names and versions changed
- whether `package-lock.json` changed
- `npm run audit:deps` output
- `npm run test:core` output when test tooling or protocol-facing dependencies changed
- `npm run build` output when browser build dependencies changed
- a note when an npm audit suggestion was rejected because it is a breaking downgrade

## Escalation

If a new advisory appears outside the controlled exceptions:

1. Do not hide it by expanding the allowlist without review.
2. Check whether a compatible package upgrade exists.
3. If no compatible upgrade exists, document the affected code path and runtime exposure.
4. Add a temporary exception only with a clear reason, advisory URL, and follow-up condition.

# NiceChunk Public Review Guide

This guide is written for external reviewers, automated agents, and evaluators who need to judge whether the NiceChunk repository set is professional, complete, and safe to inspect.

Use it as an evidence-first review path. Do not rely on project claims when a command, file, or split repository can prove the same point directly.

## Fast Review Path

Start with these files in order:

1. `README.md` for the project map and current protocol scope.
2. `docs/architecture-and-audit.md` for ownership boundaries and audit expectations.
3. `docs/threat-model.md` for protected assets, trust boundaries, and high-risk change classes.
4. `docs/validation-matrix.md` for command-to-risk coverage.
5. `docs/repository-maturity-scorecard.md` for the evidence-based repository maturity grade.
6. `docs/review-ownership.md` for code ownership and high-risk review triggers.
7. `docs/release-readiness.md` for release gates, provenance, and rollback rules.
8. `docs/supply-chain-security.md` for dependency audit policy and controlled exceptions.
9. `docs/asset-manifest.md` and `public/asset-manifest.json` for media asset provenance.
10. `docs/browser-smoke-audit.md` for built browser route smoke coverage.
11. `docs/guardian-load-audit.md` for deterministic Guardian core load coverage.
12. `docs/ci-workflow-spec.md` for the pending CI workflow and local equivalent commands.
13. `docs/license-status.md` for Apache-2.0 licensing status.
14. `SECURITY.md` and `CONTRIBUTING.md` for repository hygiene and contribution rules.

Then run:

```bash
npm run validate:repo
npm run validate:splits
npm run audit:maturity
npm run release:evidence
npm run test:core
npm run build
npm run audit:browser-smoke
```

Run Guardian validation when reviewing Guardian code, protocol behavior, or service configuration:

```bash
npm run validate:guardian
```

## What A Strong Review Should Verify

| Review Area | Evidence To Inspect | Expected Standard |
| --- | --- | --- |
| Repository professionalism | `README.md`, `CONTRIBUTING.md`, `SUPPORT.md`, issue templates, PR template | A reviewer can understand scope, contribution flow, support boundaries, and validation expectations without private context. |
| Review ownership | `.github/CODEOWNERS`, `docs/review-ownership.md` | High-risk surfaces have explicit review ownership and evidence expectations. |
| Security hygiene | `SECURITY.md`, `docs/threat-model.md`, `npm run validate:repo` | Public repositories contain no secrets, deployment-only scripts, private keys, server addresses, or local debug material. |
| Supply-chain security | `docs/supply-chain-security.md`, `package-lock.json`, `npm run audit:deps` | Dependency risks are gated, lockfile changes are reviewable, and upstream exceptions are explicit. |
| Asset provenance | `docs/asset-manifest.md`, `public/asset-manifest.json`, `nicechunk-assets` | Public media and sample assets have hashes, dimensions, source status, product surface, and canonical flags. |
| Architecture clarity | `docs/architecture-and-audit.md`, split repository READMEs | Browser, Solana programs, SDK, Guardian, worldgen, rules, docs, and assets have clear ownership boundaries. |
| Auditability | `docs/validation-matrix.md`, `scripts/audit-repository-health.mjs`, `.split-repos/split-audit.json` | Claims are backed by reproducible commands and generated split reports. |
| Repository maturity | `docs/repository-maturity-scorecard.md`, `npm run audit:maturity` | Third-party reviewers get a scored JSON report with blockers, warnings, and known manual gaps. |
| Release readiness | `docs/release-readiness.md`, `npm run validate:release`, `npm run validate:release:full` | Releases have explicit gates, provenance expectations, and rollback guidance. |
| CI readiness | `docs/ci-workflow-spec.md`, `npm run validate:release:full` | The intended GitHub Actions checks are documented and reproducible locally before workflow publication is possible. |
| Licensing clarity | `LICENSE`, `NOTICE`, `docs/license-status.md` | Reviewers know the project uses Apache-2.0 while third-party asset and dependency notices remain preserved. |
| Protocol compatibility | `programs/`, `tests/`, SDK helpers, protocol docs | PDA seeds, account layouts, instruction builders, decoders, and deterministic worldgen fixtures are reviewed together. |
| Runtime completeness | `src/`, `public/`, generated locale files, `npm run build` | Browser routes compile, locale assets generate, and public pages have inspectable outputs. |
| Browser smoke coverage | `docs/browser-smoke-audit.md`, `npm run audit:browser-smoke` | Built routes are served through Chromium and checked for DOM content, local asset failures, runtime page errors, and nontrivial screenshots. |
| Service boundary | `Guardian/`, `docs/nicechunk_guardian.md`, `npm run validate:guardian` | Guardian remains a relay/service layer and does not become settlement authority. |
| Guardian core load | `docs/guardian-load-audit.md`, `Guardian/tests/load_test.cpp`, `npm run validate:guardian` | Deterministic movement, AOI fanout, range checks, MOVE_BATCH encoding, and rate-limit behavior pass under repeatable local load. |
| Split repository integrity | `.split-repos/nicechunk-*`, generated health files | Each public split is self-contained enough to review its own surface. |

## Review Commands

Repository hygiene and split audit:

```bash
node scripts/split-github-repos.mjs
npm run validate:repo
npm run validate:splits
npm run audit:maturity
npm run release:evidence
```

Core protocol and SDK tests:

```bash
npm run audit:deps
npm run test:core
npm run audit:browser-smoke
```

Browser build and generated public assets:

```bash
npm run build
```

Release gates:

```bash
npm run validate:release
npm run validate:release:full
```

Guardian C++ tests:

```bash
cmake -S Guardian -B Guardian/build -DCMAKE_BUILD_TYPE=Release
cmake --build Guardian/build -j
npm run validate:guardian
```

## Split Repository Review

NiceChunk uses the main working tree as the source of truth. Public GitHub repositories under `nicechunk/*` are generated review surfaces.

When reviewing a split repository:

1. Confirm it has the standard health files: `README.md`, `.gitignore`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `.github/CODEOWNERS`, and GitHub issue/PR templates.
2. Confirm it does not contain forbidden paths such as `.auth/`, `.deploy/`, `.gh-config/`, `.ssh/`, `debug/`, `deploy/`, `dist/`, `build/`, `target/`, or `Guardian/build/`.
3. Confirm its latest sync commit uses `nicechunk <293527782+nicechunk@users.noreply.github.com>`.
4. Compare the split surface against the relevant main-tree docs before accepting protocol, SDK, worldgen, or Guardian changes.

## Security Review Questions

For high-risk changes, answer these before accepting the change:

1. Which trust boundary changed?
2. Which protected asset is affected?
3. Which command proves the expected behavior?
4. Could the diff expose a private operational file, credential, server address, deployment script, or local debug artifact?
5. Does documentation use placeholder domains, safe local paths, or documentation-reserved IP ranges instead of real infrastructure?
6. Does the public commit attribution use the `nicechunk` noreply identity?

## Current Known Gaps

These gaps are documented so reviewers can distinguish known future work from hidden omissions:

- NiceChunk uses Apache-2.0; third-party assets and dependencies keep their upstream terms. See `LICENSE`, `NOTICE`, and `docs/license-status.md`.
- GitHub Actions workflow publication needs credentials with `workflow` scope before workflow files can be pushed; see `docs/ci-workflow-spec.md` for the intended workflow.
- npm audit has tracked Solana upstream exceptions; see `docs/supply-chain-security.md`.
- Full Solana BPF builds across every program and local-validator integration tests are not part of default validation yet.
- Browser route smoke checks and deterministic Guardian core load checks are automated, but screenshot baseline comparison, wallet-extension flows, mobile visual coverage, networked Guardian soak testing, slow-client backpressure, and production host capacity review are not automated yet.
- Deterministic worldgen golden fixtures exist for representative terrain, water, and tree outputs, but should be expanded before treating worldgen as finalized protocol behavior.

## Review Outcome Template

Use this compact outcome format when recording a review:

```text
Repository:
Commit:
Scope reviewed:
Commands run:
Security findings:
Architecture findings:
Completeness findings:
Residual gaps:
Decision:
```

The decision should be based on evidence from the files and commands above, not on informal confidence.

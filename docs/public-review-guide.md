# NiceChunk Public Review Guide

This guide is written for external reviewers, automated agents, and evaluators who need to judge whether the NiceChunk repository set is professional, complete, and safe to inspect.

Use it as an evidence-first review path. Do not rely on project claims when a command, file, or split repository can prove the same point directly.

## Fast Review Path

Start with these files in order:

1. `README.md` for the project map and current protocol scope.
2. `docs/evaluator-dossier.md` for the compact evidence package and third-party decision template.
3. `docs/review-readiness-acceptance.md` for the final local accept-or-hold gate.
4. `docs/architecture-and-audit.md` for ownership boundaries and audit expectations.
5. `docs/threat-model.md` for protected assets, trust boundaries, and high-risk change classes.
6. `docs/validation-matrix.md` for command-to-risk coverage.
7. `docs/repository-maturity-scorecard.md` for the evidence-based repository maturity grade.
8. `docs/split-publication-status.md` for split repository publication state and upstream expectations.
9. `docs/review-ownership.md` for code ownership and high-risk review triggers.
10. `docs/release-readiness.md` for release gates, provenance, and rollback rules.
11. `docs/supply-chain-security.md` for dependency audit policy and controlled exceptions.
12. `docs/asset-manifest.md` and `public/asset-manifest.json` for media asset provenance.
13. `docs/browser-smoke-audit.md` for built browser route smoke coverage across desktop and mobile viewports.
14. `docs/wallet-flow-audit.md` for mock wallet UI flow coverage.
15. `docs/fourier-pickaxe-showcase.md` for the GPU-oriented voxel function showcase and documentation-first review path.
16. `docs/guardian-load-audit.md` for deterministic Guardian core load coverage.
17. `docs/ci-workflow-spec.md` for the pending CI workflow and local equivalent commands.
18. `docs/license-status.md` for Apache-2.0 licensing status.
19. `docs/publication-blockers.md` for external publication blockers and manual release-claim boundaries.
20. `docs/github-repository-bootstrap.md` for new split repository creation settings and first-push acceptance checks.
21. `docs/external-blocker-evidence.md` for command-level proof that external blockers are not hidden source-quality failures.
22. `docs/manual-gate-decision-policy.md` for review-ready versus release-claim decisions.
23. `SECURITY.md` and `CONTRIBUTING.md` for repository hygiene and contribution rules.

Then run:

```bash
npm run validate:repo
npm run validate:splits
npm run audit:evaluator-dossier
npm run audit:split-remotes
npm run audit:split-publication-docs
npm run audit:maturity
npm run audit:deps
npm run release:evidence
npm run audit:licenses
npm run audit:manual-gates
npm run audit:external-blockers
npm run audit:publication-blockers
npm run audit:public-copy
npm run review:package
npm run audit:review-package
npm run audit:review-readiness
npm run test:core
npm run build
npm run audit:browser-smoke
npm run audit:wallet-flows
npm run audit:fourier-pickaxe-docs
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
| Security hygiene | `SECURITY.md`, `docs/threat-model.md`, `npm run validate:repo` | Public repositories contain no secrets, `.env` files, deployment-only scripts, private keys, keypair arrays, webhook URLs, literal credential assignments, server addresses, or local debug material. |
| Supply-chain security | `docs/supply-chain-security.md`, `package-lock.json`, `npm run audit:deps` | Dependency risks are gated, lockfile changes are reviewable, and upstream exceptions are explicit. |
| License metadata | `docs/license-status.md`, `docs/supply-chain-security.md`, `npm run audit:licenses` | Root Apache-2.0 metadata, dependency license identifiers, and tracked lockfile license exceptions are reviewable. |
| Asset provenance | `docs/asset-manifest.md`, `public/asset-manifest.json`, `nicechunk-assets` | Public media and sample assets have hashes, dimensions, source status, product surface, and canonical flags. |
| Architecture clarity | `docs/architecture-and-audit.md`, split repository READMEs | Browser, Solana programs, SDK, Guardian, worldgen, rules, docs, and assets have clear ownership boundaries. |
| Auditability | `docs/validation-matrix.md`, `scripts/audit-repository-health.mjs`, `.split-repos/split-audit.json` | Claims are backed by reproducible commands and generated split reports. |
| Evaluator handoff | `docs/evaluator-dossier.md`, `npm run audit:evaluator-dossier` | Third-party reviewers get a compact evidence map, decision template, and automated dossier presence check. |
| Review readiness acceptance | `docs/review-readiness-acceptance.md`, `npm run audit:review-readiness` | External reviewers get a single machine-checked accept-or-hold decision after the evidence package is built. |
| Machine-readable review package | `npm run release:evidence`, `npm run review:package`, `npm run audit:review-package` | External agents get compact JSON containing maturity score, repository health totals, security scan coverage, release evidence, split status, recommended commands, and known manual gates, plus schema audits before relying on it. |
| Split publication | `docs/split-publication-status.md`, `npm run audit:split-remotes`, `npm run audit:split-publication-docs` | Reviewers can distinguish local generated splits from repositories that have been pushed and have upstreams, and the documentation is checked against the local split audit. |
| Repository maturity | `docs/repository-maturity-scorecard.md`, `npm run audit:maturity` | Third-party reviewers get a scored JSON report with blockers, warnings, and known manual gaps. |
| Manual gate consistency | `docs/release-readiness.md`, `docs/validation-matrix.md`, `npm run audit:manual-gates` | Reviewer-facing documents and machine-readable evidence agree on what is still manual. |
| Manual gate decisions | `docs/manual-gate-decision-policy.md`, `docs/manual-release-gates.md` | Deferred manual gates are acceptable for repository review readiness but block runtime, hosted CI, wallet, GPU, on-chain, production, or network-scale claims until evidence exists. |
| Publication blockers | `docs/publication-blockers.md`, `npm run audit:publication-blockers` | External blockers such as workflow scope, unpublished split upstream, and manual runtime evidence are explicit, machine-readable, and not confused with hidden source quality issues. |
| External blocker evidence | `docs/external-blocker-evidence.md`, `npm run audit:external-blockers` | Reviewers can reproduce which claims are blocked by GitHub permissions, missing upstreams, or runtime evidence and which local source-quality claims remain valid. |
| Split repository bootstrap | `docs/github-repository-bootstrap.md`, `docs/split-publication-status.md` | New split repositories can be created without GitHub-generated files, unrelated initial history, or ambiguous first-push evidence. |
| Release readiness | `docs/release-readiness.md`, `npm run validate:release`, `npm run validate:release:full` | Releases have explicit gates, provenance expectations, and rollback guidance. |
| CI readiness | `docs/ci-workflow-spec.md`, `npm run validate:release:full` | The intended GitHub Actions checks are documented and reproducible locally before workflow publication is possible. |
| Licensing clarity | `LICENSE`, `NOTICE`, `docs/license-status.md` | Reviewers know the project uses Apache-2.0 while third-party asset and dependency notices remain preserved. |
| Protocol compatibility | `programs/`, `tests/`, SDK helpers, protocol docs | PDA seeds, account layouts, instruction builders, decoders, and representative plus wide-range deterministic worldgen fixtures are reviewed together. |
| Runtime completeness | `src/`, `public/`, generated locale files, `npm run build` | Browser routes compile, locale assets generate, and public pages have inspectable outputs. |
| Browser smoke coverage | `docs/browser-smoke-audit.md`, `npm run audit:browser-smoke` | Built routes are served through Chromium on desktop and mobile viewports and checked for DOM content, local asset failures, runtime page errors, and nontrivial screenshots. |
| Wallet flow coverage | `docs/wallet-flow-audit.md`, `npm run audit:wallet-flows` | Public wallet routes cover no-wallet states and mock injected-provider behavior without using private keys or real extensions. |
| Fourier Pickaxe showcase | `docs/fourier-pickaxe-showcase.md`, `fourier-pickaxe/README.md`, `npm run audit:fourier-pickaxe-docs` | GPU-oriented voxel function work is documented, scoped, and reviewable without pretending that headless validation proves GPU runtime behavior. |
| Service boundary | `Guardian/`, `docs/nicechunk_guardian.md`, `npm run validate:guardian` | Guardian remains a relay/service layer and does not become settlement authority. |
| Guardian core load | `docs/guardian-load-audit.md`, `Guardian/tests/load_test.cpp`, `npm run validate:guardian` | Deterministic movement, AOI fanout, range checks, MOVE_BATCH encoding, and rate-limit behavior pass under repeatable local load. |
| Split repository integrity | `.split-repos/nicechunk-*`, generated health files, split `CHANGELOG.md` files | Each public split is self-contained enough to review its own surface, has source anchors for main-tree and split commits, and keeps release-note safety rules visible. |

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
npm run audit:wallet-flows
npm run audit:fourier-pickaxe-docs
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
2. Confirm it does not contain forbidden paths such as `.auth/`, `.deploy/`, `.env`, `.env.*`, `.gh-config/`, `.ssh/`, `debug/`, `deploy/`, `dist/`, `build/`, `target/`, or `Guardian/build/`.
3. Confirm its latest sync commit uses `nicechunk <293527782+nicechunk@users.noreply.github.com>`.
4. Compare the split surface against the relevant main-tree docs before accepting protocol, SDK, worldgen, or Guardian changes.

## Security Review Questions

For high-risk changes, answer these before accepting the change:

1. Which trust boundary changed?
2. Which protected asset is affected?
3. Which command proves the expected behavior?
4. Could the diff expose a private operational file, credential assignment, keypair file, webhook, server address, deployment script, or local debug artifact?
5. Does documentation use placeholder domains, safe local paths, or documentation-reserved IP ranges instead of real infrastructure?
6. Does the public commit attribution use the `nicechunk` noreply identity?

## Current Known Gaps

These gaps are documented so reviewers can distinguish known future work from hidden omissions:

- NiceChunk uses Apache-2.0; third-party assets and dependencies keep their upstream terms. See `LICENSE`, `NOTICE`, and `docs/license-status.md`.
- GitHub Actions workflow publication needs credentials with `workflow` scope before workflow files can be pushed; see `docs/ci-workflow-spec.md` for the intended workflow.
- npm audit has tracked Solana upstream exceptions; see `docs/supply-chain-security.md`.
- Full Solana BPF builds across every program and local-validator integration tests are not part of default validation yet.
- Browser route smoke checks across desktop/mobile viewports, mock wallet UI flows, Fourier Pickaxe documentation checks, and deterministic Guardian core load checks are automated, but screenshot baseline comparison, real wallet-extension approval, mobile deep links, transaction signing, Fourier Pickaxe GPU proof-search benchmarking, networked Guardian soak testing, slow-client backpressure, and production host capacity review are not automated yet.
- Deterministic worldgen golden fixtures now cover representative and wide-range terrain, water, depth, protocol block ID, and tree outputs; protocol-final worldgen changes still require explicit owner review.

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

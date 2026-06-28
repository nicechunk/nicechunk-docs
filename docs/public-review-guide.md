# NiceChunk Public Review Guide

This guide is written for external reviewers, automated agents, and evaluators who need to judge whether the NiceChunk repository set is professional, complete, and safe to inspect.

Use it as an evidence-first review path. Do not rely on project claims when a command, file, or split repository can prove the same point directly.

## Fast Review Path

Start with these files in order:

1. `README.md` for the project map and current protocol scope.
2. `docs/architecture-and-audit.md` for ownership boundaries and audit expectations.
3. `docs/threat-model.md` for protected assets, trust boundaries, and high-risk change classes.
4. `docs/validation-matrix.md` for command-to-risk coverage.
5. `docs/release-readiness.md` for release gates, provenance, and rollback rules.
6. `SECURITY.md` and `CONTRIBUTING.md` for repository hygiene and contribution rules.

Then run:

```bash
npm run validate:repo
npm run test:core
npm run build
```

Run Guardian validation when reviewing Guardian code, protocol behavior, or service configuration:

```bash
npm run validate:guardian
```

## What A Strong Review Should Verify

| Review Area | Evidence To Inspect | Expected Standard |
| --- | --- | --- |
| Repository professionalism | `README.md`, `CONTRIBUTING.md`, `SUPPORT.md`, issue templates, PR template | A reviewer can understand scope, contribution flow, support boundaries, and validation expectations without private context. |
| Security hygiene | `SECURITY.md`, `docs/threat-model.md`, `npm run validate:repo` | Public repositories contain no secrets, deployment-only scripts, private keys, server addresses, or local debug material. |
| Architecture clarity | `docs/architecture-and-audit.md`, split repository READMEs | Browser, Solana programs, SDK, Guardian, worldgen, rules, docs, and assets have clear ownership boundaries. |
| Auditability | `docs/validation-matrix.md`, `scripts/audit-repository-health.mjs`, `.split-repos/split-audit.json` | Claims are backed by reproducible commands and generated split reports. |
| Release readiness | `docs/release-readiness.md`, `npm run validate:release`, `npm run validate:release:full` | Releases have explicit gates, provenance expectations, and rollback guidance. |
| Protocol compatibility | `programs/`, `tests/`, SDK helpers, protocol docs | PDA seeds, account layouts, instruction builders, and decoders are reviewed together. |
| Runtime completeness | `src/`, `public/`, generated locale files, `npm run build` | Browser routes compile, locale assets generate, and public pages have inspectable outputs. |
| Service boundary | `Guardian/`, `docs/nicechunk_guardian.md`, `npm run validate:guardian` | Guardian remains a relay/service layer and does not become settlement authority. |
| Split repository integrity | `.split-repos/nicechunk-*`, generated health files | Each public split is self-contained enough to review its own surface. |

## Review Commands

Repository hygiene and split audit:

```bash
node scripts/split-github-repos.mjs
npm run validate:repo
```

Core protocol and SDK tests:

```bash
npm run test:core
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

1. Confirm it has the standard health files: `README.md`, `.gitignore`, `SECURITY.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, and GitHub issue/PR templates.
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

- Public license selection needs an owner decision before a public license file is added.
- GitHub Actions automation needs credentials with `workflow` scope before workflow files can be pushed.
- Full Solana BPF builds across every program and local-validator integration tests are not part of default validation yet.
- Browser visual regression screenshots and Guardian load tests are not automated yet.
- Deterministic worldgen golden fixtures should be expanded before treating worldgen as finalized protocol behavior.

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

# NiceChunk Release Readiness

This document defines the evidence required before a public NiceChunk release, tag, or repository sync is treated as release-ready. NiceChunk uses Apache-2.0, but this document does not replace owner approval for production deployment.

## Release Principles

- The main working tree is the source of truth.
- Split repositories are generated review surfaces and must be regenerated from the main tree before public sync.
- Release evidence must be reproducible from commands and committed files.
- Private infrastructure, deployment-only scripts, credentials, server addresses, and local debug material must not be part of a release.
- Protocol, SDK, Guardian, worldgen, and UI changes must be reviewed against their trust boundaries before tagging.

## Release Gates

| Gate | Required Evidence | Command Or File |
| --- | --- | --- |
| Repository hygiene | No missing public health files, forbidden paths, broken Markdown links, token-shaped strings, PEM private-key blocks, or non-reserved public IPv4 findings | `npm run validate:repo` |
| Review ownership | CODEOWNERS exists and high-risk changes have an explicit owner and evidence path | `.github/CODEOWNERS`, `docs/review-ownership.md` |
| Dependency audit | Unexpected npm audit findings are absent and tracked upstream advisories are documented | `npm run audit:deps`, `docs/supply-chain-security.md` |
| Core protocol, SDK, and worldgen behavior | PDA derivation, account layout, instruction builders, decoders, deterministic worldgen golden fixtures, and helper behavior still pass | `npm run test:core` |
| Browser build | Locale generation, route bundling, and static assets compile | `npm run build` |
| Browser smoke audit | Key built browser routes serve from `dist/`, contain visible DOM content, avoid failed local assets, and produce nontrivial screenshots | `npm run audit:browser-smoke`, `docs/browser-smoke-audit.md` |
| Guardian behavior | AOI, range, and binary protocol tests pass when Guardian code or protocol is in scope | `npm run validate:guardian` |
| Split repository provenance | Split repositories are regenerated from the main tree and audit output has zero secret or forbidden path findings | `node scripts/split-github-repos.mjs` |
| Split repository self-containment | Split package scripts, relative imports, dependency audits, and buildable split repos are self-contained | `npm run validate:splits` |
| Repository maturity | Public repository governance score has no blockers and remains above the documented pass threshold | `npm run audit:maturity`, `docs/repository-maturity-scorecard.md` |
| Release evidence | Main and split repository commits, dirty status, upstream refs, expected validation commands, and known manual gates are captured | `npm run release:evidence` |
| Licensing status | Apache-2.0 license files and package metadata are present, with third-party notices preserved | `LICENSE`, `NOTICE`, `docs/license-status.md` |
| Review context | Trust boundary, protected asset, and known gaps are checked | `docs/threat-model.md`, `docs/public-review-guide.md` |

## Standard Release Validation

For public web, docs, SDK, and repository-health releases:

```bash
npm run validate:release
npm run audit:maturity
npm run release:evidence
```

For full release review including Guardian service tests:

```bash
npm run validate:release:full
npm run audit:maturity
npm run release:evidence
```

If Guardian build output is missing or stale, rebuild it first:

```bash
cmake -S Guardian -B Guardian/build -DCMAKE_BUILD_TYPE=Release
cmake --build Guardian/build -j
npm run validate:guardian
```

## Split Sync Procedure

Before pushing public split repositories:

1. Run the relevant validation for the changed surface.
2. Run `node scripts/split-github-repos.mjs`.
3. Review `.split-repos/split-audit.json`.
4. Run `npm run validate:repo`.
5. Run `npm run validate:splits`.
6. Run `npm run audit:maturity`.
7. Commit only repositories with intentional changes.
8. Use `nicechunk <293527782+nicechunk@users.noreply.github.com>` for project sync commits.
9. Push each split repository separately.

## Tagging Guidance

Use tags only after release gates pass.

Recommended tag format:

```text
v<package-version>
```

For split-specific release notes, include:

- source main-tree commit
- split repository name and commit
- validation commands run
- protocol or account-layout impact
- security or deployment boundary impact
- known gaps or manual checks not covered by automation

## Provenance Checklist

Before publishing release notes or asking for external review, record:

```text
Main repository commit:
Split repositories synced:
Validation commands:
Release evidence JSON:
Dependency audit impact:
Threat model impact:
Review ownership impact:
Protocol/account-layout impact:
Worldgen determinism impact:
Guardian protocol impact:
Browser/UI impact:
Known gaps:
Reviewer:
Decision:
```

## Rollback Guidance

Rollback should preserve auditability:

- Prefer a revert commit over rewriting public release history.
- If a secret, private key, token, server address, or deploy-only script was exposed, rotate the credential first, then rewrite affected public history only after preserving incident evidence privately.
- Regenerate split repositories after the rollback or history rewrite.
- Run `npm run validate:repo` before pushing repaired public surfaces.
- Document which commits, tags, and split repositories were replaced.

## Current Non-Release Items

These items should not be presented as completed release guarantees yet:

- NiceChunk uses Apache-2.0; third-party assets and dependencies keep their upstream terms. See `LICENSE`, `NOTICE`, and `docs/license-status.md`.
- GitHub Actions workflow publication is pending credentials with `workflow` scope; see `docs/ci-workflow-spec.md`.
- npm dependency audit still reports tracked Solana upstream advisories; see `docs/supply-chain-security.md`.
- Full Solana BPF builds across every program and local-validator integration tests are not part of default release validation.
- Browser route smoke checks are automated, but screenshot baseline comparison, wallet-extension flows, mobile visual coverage, and Guardian load tests are not automated.
- Deterministic worldgen golden fixtures cover representative terrain, water, and tree outputs, but need broader seed and coordinate coverage before worldgen is treated as finalized protocol behavior.

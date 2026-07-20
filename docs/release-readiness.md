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
| Repository hygiene | No missing public health files, forbidden paths, broken Markdown links, token-shaped strings, cloud/API tokens, webhook URLs, literal credential assignments, keypair arrays, PEM private-key blocks, or non-reserved public IPv4 findings | `npm run validate:repo` |
| Review ownership | CODEOWNERS exists and high-risk changes have an explicit owner and evidence path | `.github/CODEOWNERS`, `docs/review-ownership.md` |
| Dependency audit | Unexpected npm audit findings are absent and tracked upstream advisories are documented | `npm run audit:deps`, `docs/supply-chain-security.md` |
| License audit | Root Apache-2.0 metadata, dependency license identifiers, and tracked lockfile license exceptions are reviewed | `npm run audit:licenses`, `docs/license-status.md`, `docs/supply-chain-security.md` |
| Core protocol, SDK, and worldgen behavior | PDA derivation, account layout, instruction builders, decoders, representative and wide-range deterministic worldgen golden fixtures, and helper behavior still pass | `npm run test:core` |
| Browser build | Locale generation, route bundling, and static assets compile | `npm run build` |
| Public copy readiness | Public UI copy, locale bundles, and reviewer-facing docs avoid draft markers, filler Latin text, roadmap-as-placeholder copy, and unfinished-feature wording | `npm run audit:public-copy` |
| Browser smoke audit | Key built browser routes serve from `dist/` on desktop and mobile viewports, contain visible DOM content, avoid failed local assets, and produce nontrivial screenshots | `npm run audit:browser-smoke`, `docs/browser-smoke-audit.md` |
| Wallet flow audit | Login no-wallet state, mock injected Phantom connect flow, and Guardian no-wallet guard pass in the built browser output | `npm run audit:wallet-flows`, `docs/wallet-flow-audit.md` |
| Fourier Pickaxe documentation | GPU requirement, architecture, function payload, security boundary, and known limits are documented for review without requiring GPU execution | `npm run audit:fourier-pickaxe-docs`, `docs/fourier-pickaxe-showcase.md` |
| Guardian behavior | AOI, range, and binary protocol tests pass when Guardian code or protocol is in scope | `npm run validate:guardian` |
| Guardian core load | Deterministic movement, AOI fanout, range, batching, and rate-limit workload passes inside the Guardian CTest suite | `npm run validate:guardian`, `docs/guardian-load-audit.md` |
| Split repository provenance | Split repositories are regenerated from the main tree and audit output has zero secret or forbidden path findings | `node scripts/split-github-repos.mjs` |
| Split repository self-containment | Split package scripts, relative imports, dependency audits, and buildable split repos are self-contained | `npm run validate:splits` |
| Split publication status | Generated split repositories have explicit local commit, remote, upstream, and dirty-state evidence | `npm run audit:split-remotes`, `docs/split-publication-status.md` |
| Split publication documentation | Publication-status documentation matches the current unpublished split list and publication commands | `npm run audit:split-publication-docs`, `docs/split-publication-status.md` |
| Split repository bootstrap | New split repositories use empty GitHub repository creation, reviewed local split contents, first-push upstream tracking, and post-push acceptance checks | `docs/github-repository-bootstrap.md`, `docs/split-publication-status.md` |
| Repository maturity | Public repository governance score has no blockers and remains above the documented pass threshold | `npm run audit:maturity`, `docs/repository-maturity-scorecard.md` |
| Release evidence | Package metadata, repository health totals, security scan coverage, main and split repository commits, dirty status, upstream refs, split remote/branch/author policy matches, split README completeness, expected validation commands, and known manual gates are captured | `npm run release:evidence` |
| Release evidence audit | Release evidence JSON has required package, repository health, security scan coverage, clean git status, main commit, split policy, README completeness, required review file, allowed publication blocker, and manual gate fields | `npm run audit:release-evidence` |
| Manual gate consistency | Core review documents, maturity output, release evidence, and the manual gate register describe the same manual release boundaries | `npm run audit:manual-gates`, `docs/manual-release-gates.md` |
| Manual gate decision policy | Review-ready decisions are separated from release, production, hosted CI, real wallet, GPU, on-chain, or network-scale claims | `docs/manual-gate-decision-policy.md`, `docs/manual-gate-decision-policy.json` |
| Publication blockers | External publication blockers and manual release-claim boundaries are explicit, machine-readable, and linked from reviewer-facing documents | `npm run audit:publication-blockers`, `docs/publication-blockers.md` |
| Licensing status | Apache-2.0 license files and package metadata are present, with third-party notices preserved | `LICENSE`, `NOTICE`, `docs/license-status.md` |
| Changelog | Public release notes document notable changes, affected split repositories, validation evidence, and deferred manual gates without exposing private infrastructure | `npm run audit:changelog`, `CHANGELOG.md` |

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
6. Run `npm run audit:split-remotes`.
7. Run `npm run audit:maturity`.
8. Commit only repositories with intentional changes.
9. Use `nicechunk <293527782+nicechunk@users.noreply.github.com>` for project sync commits.
10. Push each split repository separately.

## Tagging Guidance

Use tags only after release gates pass.

Recommended tag format:

```text
v<package-version>
```

For split-specific release notes, include:

- source main-tree commit
- split repository name and commit
- matching `CHANGELOG.md` entry or release-note excerpt
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
Split policy summary:
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
- Current external blockers are tracked in `docs/publication-blockers.md` and `docs/publication-blockers.json`.
- npm dependency audit still reports tracked Solana upstream advisories; see `docs/supply-chain-security.md`.
- Full Solana BPF builds across every program and local-validator integration tests are not part of default release validation.
- Browser route smoke checks across desktop/mobile viewports, mock wallet UI flows, Fourier Pickaxe documentation checks, and deterministic Guardian core load checks are automated, but screenshot baseline comparison, real wallet-extension approval, mobile deep links, transaction signing, Fourier Pickaxe GPU proof-search benchmarking, networked Guardian soak testing, slow-client backpressure, and production host capacity review are not automated.
- `docs/manual-release-gates.md` defines the minimum evidence, pass criteria, owner, and deferred wording for these manual release gates.
- `docs/manual-gate-decision-policy.md` defines when deferred manual gates are acceptable for repository review readiness and when they block release or production claims.
- Deterministic worldgen golden fixtures cover representative and wide-range terrain, water, depth, protocol block ID, and tree outputs; protocol-final worldgen changes still require explicit owner review.

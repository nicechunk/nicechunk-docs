# NiceChunk Validation Matrix

This matrix maps validation commands to the project risks they cover. It is intended for maintainers, external reviewers, and automated agents that need reproducible evidence rather than a loose claim that the repository is healthy.

## Standard Commands

| Command | Scope | Proves | Notes |
| --- | --- | --- | --- |
| `npm run validate:repo` | Main tree and generated split repositories | Repository hygiene files and CODEOWNERS exist, forbidden paths are absent, Markdown links resolve, token/private-key/credential-assignment/keypair/public-IP findings are absent, audit scripts parse, controlled dependency audit passes, and split remote/branch/author policy passes | Fastest required check before GitHub sync. |
| `npm run validate:splits` | Generated split repositories with package or source surfaces | Split package scripts reference existing files, relative imports resolve, dependency and license audit scripts pass, and buildable split repos compile | Run after `node scripts/split-github-repos.mjs`. |
| `npm run audit:evaluator-dossier` | Main review documentation | Evaluator evidence files, README links, dossier phrases, and release-evidence coverage are present | Use when review entrypoints, release evidence, or governance docs change. |
| `npm run audit:split-remotes` | Generated split repository publication state | Split repos report branch, commit, author, expected remote URL, remote match, upstream, dirty status, and publication warnings | Default mode is local-only; `--policy-strict` gates wrong remote URLs, non-main branches, and wrong latest author; full strict mode also gates dirty state and unpublished splits. |
| `npm run audit:deps` | npm dependency graph | Unexpected npm audit findings are absent; tracked upstream Solana advisories are explicitly reported | Uses `scripts/audit-dependencies.mjs`. |
| `npm run audit:licenses` | npm lockfile license metadata | Root Apache-2.0 metadata, dependency license identifiers, and tracked license exceptions are structurally reviewed | Uses `scripts/audit-licenses.mjs`; run after dependency metadata changes. |
| `npm run audit:manual-gates` | Known manual gate consistency | Core review documents, maturity output, and release evidence all document the same manual release boundaries | Prevents hidden drift between reviewer-facing docs and machine-readable evidence. |
| `npm run audit:public-copy` | Public UI copy, locale bundles, and reviewer-facing docs | Draft markers, filler Latin text, roadmap-as-placeholder copy, and unfinished-feature wording are absent from public surfaces | Prevents public repositories from looking like unfinished scaffolding. |
| `npm run audit:split-publication-docs` | Split publication documentation | `docs/split-publication-status.md` lists the unpublished split repositories reported by `audit:split-remotes` and includes the required publication commands | Prevents stale publication-status docs. |
| `npm run audit:browser-smoke` | Built browser routes | Key production routes serve from `dist/` on desktop and mobile viewports, have DOM content, visible elements, nontrivial screenshots, and no failed local assets or page errors | Requires `npm run build` first and Playwright Chromium installed. |
| `npm run audit:wallet-flows` | Built wallet routes | Login no-wallet state, mock injected Phantom happy path, and Guardian no-wallet guard behave as expected | Requires `npm run build` first; uses a mock provider, not a real wallet extension. |
| `npm run audit:fourier-pickaxe-docs` | Fourier Pickaxe documentation surface | GPU requirement, architecture, function payload, security boundary, known limits, and required source files are documented | Documentation-first check only; it does not run the GPU workload. |
| `npm run audit:maturity` | Main tree and generated split repositories | Repository governance score, blocker/warning findings, manual release gaps, clean sync state, and review-readiness evidence are emitted as JSON | Uses `scripts/audit-repository-maturity.mjs`; passes at 85/100 with no blockers. |
| `npm run audit:release-evidence` | Release evidence JSON | Package metadata, main commit metadata, repository health totals, security scan coverage, split policy arrays, split README completeness, required review files, and known manual gates are structurally valid | Runs `npm run release:evidence` internally and validates the generated JSON. |
| `npm run audit:review-package` | Compact evaluator handoff JSON | Maturity decision fields, repository health summary, security scan coverage, release evidence summary, split summary, review entrypoints, recommended commands, manual gaps, and interpretation are structurally valid | Runs `npm run review:package` internally and validates the generated JSON. |
| `npm run assets:manifest` | Public media, generated references, wallet icons, and NCM sample assets | `public/asset-manifest.json` lists asset paths, media types, byte sizes, hashes, dimensions, surfaces, source status, and canonical flags | Runs automatically through `prebuild`. |
| `npm run release:evidence` | Main and split repository provenance | Package metadata, repository health totals, security scan coverage, current commit, author, branch, dirty status, upstream, split remote/branch/author policy matches, split README completeness, required review files, and expected validation commands are emitted as JSON | Use after validation to capture release evidence. |
| `npm run review:package` | Compact evaluator handoff | Maturity score, repository health summary, security scan coverage, release evidence summary, split publication summary, review entrypoints, recommended commands, and manual gates are emitted as one JSON object | Use when another agent or reviewer needs a single starting point. |
| `npm run test:core` | TypeScript SDK, protocol-facing tests, and deterministic worldgen fixtures | PDA derivation, core config layout, player/chunk instruction builders, backpack decoding, smelting instruction helpers, generated block ID behavior, and representative plus wide-range worldgen golden outputs | Uses Mocha with `ts-node/esm`. |
| `npm run validate:guardian` | Guardian C++ service tests | AOI range behavior, binary protocol encoding/decoding, service range checks | Requires `Guardian/build` to exist. Build with CMake first when needed. |
| `npm run build` | Browser product and public pages | Locale generation, Vite compilation, route/page bundling, static asset references | Runs `npm run locales` through `prebuild`. |
| `npm run validate:release` | Public release readiness | Repository audit, core tests, and production browser build | Does not include Guardian CMake build because the C++ toolchain is environment-specific. |
| `npm run validate:release:full` | Full release review including Guardian | Repository audit, core tests, production browser build, and Guardian C++ tests | Requires an existing `Guardian/build` directory. |

Security review context:

```bash
sed -n '1,220p' docs/public-review-guide.md
sed -n '1,220p' docs/review-ownership.md
sed -n '1,220p' docs/release-readiness.md
sed -n '1,220p' docs/repository-maturity-scorecard.md
sed -n '1,220p' docs/split-publication-status.md
sed -n '1,220p' docs/supply-chain-security.md
sed -n '1,220p' docs/asset-manifest.md
sed -n '1,220p' docs/browser-smoke-audit.md
sed -n '1,220p' docs/wallet-flow-audit.md
sed -n '1,220p' docs/fourier-pickaxe-showcase.md
sed -n '1,220p' docs/guardian-load-audit.md
sed -n '1,220p' docs/ci-workflow-spec.md
sed -n '1,220p' docs/license-status.md
sed -n '1,220p' docs/threat-model.md
```

Use the public review guide and threat model to identify the trust boundary, protected asset, and extra evidence required for high-risk changes.

## Manual Build Commands

Guardian service build:

```bash
cmake -S Guardian -B Guardian/build -DCMAKE_BUILD_TYPE=Release
cmake --build Guardian/build -j
npm run validate:guardian
```

Solana program build for current devnet work:

```bash
cargo build-sbf --no-default-features --features devnet
```

## Review Coverage

The current validation covers these risk classes:

- Public repository hygiene and accidental secret exposure.
- Review ownership coverage for public repository surfaces.
- Dependency audit gating with documented upstream exceptions.
- Lockfile license audit with documented dependency license exceptions.
- Known manual gate consistency across docs and evidence JSON.
- Split repository boundary drift.
- Split repository package-script, relative-import, dependency-audit, and build self-containment.
- Split repository publication status through `npm run audit:split-remotes`.
- Evaluator handoff coverage through `npm run audit:evaluator-dossier`.
- Machine-readable release provenance through `npm run release:evidence`.
- Release evidence schema and key field validation through `npm run audit:release-evidence`.
- Compact evaluator handoff through `npm run review:package`.
- Compact evaluator handoff schema validation through `npm run audit:review-package`.
- Machine-readable repository maturity scoring through `npm run audit:maturity`.
- Asset provenance for public media and samples through `public/asset-manifest.json`.
- Built browser route smoke coverage across desktop and mobile viewports through `npm run audit:browser-smoke`.
- Mock wallet UI flow coverage through `npm run audit:wallet-flows`.
- Fourier Pickaxe documentation-first review coverage through `npm run audit:fourier-pickaxe-docs`.
- Deterministic Guardian core load coverage through `Guardian/tests/load_test.cpp`.
- Broken public documentation links.
- SDK account layout and instruction encoding regressions.
- Core player, chunk, backpack, smelting, and generated-block helper behavior.
- Deterministic worldgen golden fixtures for representative and wide-range terrain, water, depth, protocol block ID, and above-surface tree outputs.
- Guardian protocol, area-of-interest, and service range logic.
- Browser route compilation and generated locale assets.
- Public review flow for external evaluators and automated agents.
- Release gates, provenance checklist, split sync procedure, and rollback guidance.
- Threat model review for assets, trust boundaries, high-risk change classes, and known gaps.

## Known Gaps

These areas still require targeted manual review or future fixtures:

- Full Solana BPF build across every program and cluster feature.
- On-chain integration tests against a local validator or devnet.
- Browser route smoke checks cover desktop and mobile viewports; screenshot baseline comparison remains manual.
- Wallet UI no-wallet and mock injected-provider flows are automated; real wallet extension approval, mobile deep links, network switching, and transaction signing remain manual.
- Fourier Pickaxe is documented for public review; GPU runtime behavior and proof-search performance require a GPU workstation.
- Networked Guardian soak testing, slow-client backpressure, and production host capacity review.
- GitHub Actions publication, pending credentials with `workflow` scope. The intended workflow is documented in `docs/ci-workflow-spec.md`.
- Apache-2.0 licensing is documented in `LICENSE`, `NOTICE`, and `docs/license-status.md`; third-party assets and dependencies keep upstream terms.

## Required Evidence Before Sync

Before pushing public split repositories, record at least:

```bash
npm run validate:repo
npm run validate:splits
npm run audit:split-remotes
npm run audit:maturity
npm run audit:licenses
npm run audit:manual-gates
npm run test:core
npm run build
npm run audit:browser-smoke
npm run audit:wallet-flows
npm run audit:fourier-pickaxe-docs
```

Run `npm run validate:guardian` when Guardian code, config, or protocol files changed.
Run `npm run validate:release:full` for release reviews that include Guardian service behavior.

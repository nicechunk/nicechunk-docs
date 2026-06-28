# NiceChunk Validation Matrix

This matrix maps validation commands to the project risks they cover. It is intended for maintainers, external reviewers, and automated agents that need reproducible evidence rather than a loose claim that the repository is healthy.

## Standard Commands

| Command | Scope | Proves | Notes |
| --- | --- | --- | --- |
| `npm run validate:repo` | Main tree and generated split repositories | Repository hygiene files and CODEOWNERS exist, forbidden paths are absent, Markdown links resolve, token/private-key/public-IP findings are absent, audit scripts parse | Fastest required check before GitHub sync. |
| `npm run audit:deps` | npm dependency graph | Unexpected npm audit findings are absent; tracked upstream Solana advisories are explicitly reported | Uses `scripts/audit-dependencies.mjs`. |
| `npm run test:core` | TypeScript SDK, protocol-facing tests, and deterministic worldgen fixtures | PDA derivation, core config layout, player/chunk instruction builders, backpack decoding, smelting instruction helpers, generated block ID behavior, fixed worldgen golden outputs | Uses Mocha with `ts-node/esm`. |
| `npm run validate:guardian` | Guardian C++ service tests | AOI range behavior, binary protocol encoding/decoding, service range checks | Requires `Guardian/build` to exist. Build with CMake first when needed. |
| `npm run build` | Browser product and public pages | Locale generation, Vite compilation, route/page bundling, static asset references | Runs `npm run locales` through `prebuild`. |
| `npm run validate:release` | Public release readiness | Repository audit, core tests, and production browser build | Does not include Guardian CMake build because the C++ toolchain is environment-specific. |
| `npm run validate:release:full` | Full release review including Guardian | Repository audit, core tests, production browser build, and Guardian C++ tests | Requires an existing `Guardian/build` directory. |

Security review context:

```bash
sed -n '1,220p' docs/public-review-guide.md
sed -n '1,220p' docs/review-ownership.md
sed -n '1,220p' docs/release-readiness.md
sed -n '1,220p' docs/supply-chain-security.md
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
- Split repository boundary drift.
- Broken public documentation links.
- SDK account layout and instruction encoding regressions.
- Core player, chunk, backpack, smelting, and generated-block helper behavior.
- Deterministic worldgen golden fixtures for representative terrain, water, and above-surface tree outputs.
- Guardian protocol, area-of-interest, and service range logic.
- Browser route compilation and generated locale assets.
- Public review flow for external evaluators and automated agents.
- Release gates, provenance checklist, split sync procedure, and rollback guidance.
- Threat model review for assets, trust boundaries, high-risk change classes, and known gaps.

## Known Gaps

These areas still require targeted manual review or future fixtures:

- Full Solana BPF build across every program and cluster feature.
- On-chain integration tests against a local validator or devnet.
- Expanded deterministic worldgen golden fixtures across more seeds and coordinate ranges.
- Browser visual regression screenshots for major pages.
- Load testing for Guardian under realistic player movement patterns.
- GitHub Actions automation, pending credentials with `workflow` scope.

## Required Evidence Before Sync

Before pushing public split repositories, record at least:

```bash
npm run validate:repo
npm run test:core
npm run build
```

Run `npm run validate:guardian` when Guardian code, config, or protocol files changed.
Run `npm run validate:release:full` for release reviews that include Guardian service behavior.

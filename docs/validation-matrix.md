# NiceChunk Validation Matrix

This matrix maps validation commands to the project risks they cover. It is intended for maintainers, external reviewers, and automated agents that need reproducible evidence rather than a loose claim that the repository is healthy.

## Standard Commands

| Command | Scope | Proves | Notes |
| --- | --- | --- | --- |
| `npm run validate:repo` | Main tree and generated split repositories | Repository hygiene files exist, forbidden paths are absent, Markdown links resolve, token/private-key/public-IP findings are absent, audit scripts parse | Fastest required check before GitHub sync. |
| `npm run test:core` | TypeScript SDK and protocol-facing tests | PDA derivation, core config layout, player/chunk instruction builders, backpack decoding, smelting instruction helpers, generated block ID behavior | Uses Mocha with `ts-node/esm`. |
| `npm run validate:guardian` | Guardian C++ service tests | AOI range behavior, binary protocol encoding/decoding, service range checks | Requires `Guardian/build` to exist. Build with CMake first when needed. |
| `npm run build` | Browser product and public pages | Locale generation, Vite compilation, route/page bundling, static asset references | Runs `npm run locales` through `prebuild`. |
| `npm run validate:release` | Public release readiness | Repository audit, core tests, and production browser build | Does not include Guardian CMake build because the C++ toolchain is environment-specific. |

Security review context:

```bash
sed -n '1,220p' docs/public-review-guide.md
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
- Split repository boundary drift.
- Broken public documentation links.
- SDK account layout and instruction encoding regressions.
- Core player, chunk, backpack, smelting, and generated-block helper behavior.
- Guardian protocol, area-of-interest, and service range logic.
- Browser route compilation and generated locale assets.
- Public review flow for external evaluators and automated agents.
- Threat model review for assets, trust boundaries, high-risk change classes, and known gaps.

## Known Gaps

These areas still require targeted manual review or future fixtures:

- Full Solana BPF build across every program and cluster feature.
- On-chain integration tests against a local validator or devnet.
- Deterministic worldgen golden fixtures across seed and coordinate ranges.
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

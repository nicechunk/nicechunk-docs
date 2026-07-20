# NiceChunk Architecture and Audit Surface

This document gives reviewers and future contributors a compact map of the NiceChunk repository set. It explains what each layer owns, what it must not own, and which checks currently protect the public GitHub surfaces.

## System Boundary

NiceChunk is split into focused repositories from one working tree. The main tree is the source of truth; split repositories are public review surfaces generated from it.

The major boundaries are:

- Browser client: wallet flow, pages, rendering, locale dictionaries, and gameplay composition.
- Fourier Pickaxe: GPU-oriented voxel asset function research and documentation-first showcase.
- Solana programs: public account ownership, PDA derivation, instruction handlers, and binary account layouts.
- SDK: TypeScript helpers for PDA derivation, instruction construction, and account decoding.
- World generation: deterministic seed and coordinate based terrain and block generation.
- Resource and rule references: inspectable rule data, simulation helpers, and visual explanation surfaces.
- Guardian service: low-latency regional WebSocket relay for presence, movement, and local events.
- Documentation and assets: public knowledge base, diagrams, screenshots, and media used by review surfaces.

## Authority Model

The repository should make authority boundaries boring to inspect:

- Solana programs are the authority for account ownership, persistent state transitions, and settlement rules.
- The SDK is an encoding and decoding layer. It should not hide RPC policy, wallet policy, or retry behavior.
- The browser client composes wallet state, rendering, Guardian connections, and chain reads. It is not the final authority for settlement.
- Guardian is a realtime relay. It does not sign player transactions, mint assets, settle resources, or decide final block state.
- World generation is deterministic protocol behavior. Renderers may cache and draw it, but should not redefine generated blocks.
- Documentation must describe current behavior and trust limits without exposing private operational details.

## Public Repository Rules

Public repositories must not contain:

- private keys, token files, wallet files, or certificate material
- production server IPs or machine-specific configuration
- deployment-only scripts or reverse-proxy configuration
- local debug material
- generated build output
- stale test commits or author-attribution experiments

Use placeholders such as `guardian.example.com`, `/path/to/devnet-payer.json`, and documentation-reserved IP ranges when examples need concrete-looking values.

## Required Review Evidence

Before syncing public repositories, maintainers should be able to show:

- `node scripts/split-github-repos.mjs` completed without split audit failures.
- `npm run repo:audit` reports no missing files, forbidden paths, content findings, or broken Markdown links.
- `npm run validate:splits` reports no split package-script, import-resolution, dependency-audit, or build self-containment failures.
- `npm run audit:deps` reports no unexpected dependency vulnerabilities.
- `npm run release:evidence` captures the current main and split repository provenance in machine-readable JSON.
- Validation commands from `docs/validation-matrix.md` were run for the touched surface.
- Repository maturity from `docs/repository-maturity-scorecard.md` was checked when preparing public syncs.
- Review ownership from `.github/CODEOWNERS` and `docs/review-ownership.md` was checked for high-risk changes.
- Trust boundary and asset impact were checked against `docs/threat-model.md` for high-risk changes.
- Relevant build, test, or manual validation was run for the changed surface.
- Browser route smoke coverage from `docs/browser-smoke-audit.md` was run when browser-facing routes changed.
- Wallet UI flow coverage from `docs/wallet-flow-audit.md` was run when wallet-facing routes changed.
- Fourier Pickaxe documentation coverage from `docs/fourier-pickaxe-showcase.md` was checked when GPU-oriented voxel function work changed.
- Guardian core load coverage from `docs/guardian-load-audit.md` was run when Guardian protocol or service logic changed.
- Commit author identity is `nicechunk <293527782+nicechunk@users.noreply.github.com>` for project sync commits.
- Any protocol, account-layout, deterministic worldgen, or user-visible behavior change is documented.

## Current Automated Audit

`npm run repo:audit` checks the main tree and every generated split repository for:

- required public health files
- forbidden public paths
- broken Markdown links
- GitHub token-shaped strings
- PEM private-key blocks
- non-reserved public IPv4 addresses in text files

The audit intentionally treats unclear public IPs as failures. Use domains or documentation-reserved IP ranges in examples.

`npm run audit:deps` checks the npm dependency graph and only allows documented upstream exceptions from `docs/supply-chain-security.md`.

`npm run validate:splits` checks generated split repositories that have package or source surfaces. It verifies that package scripts reference existing files, relative imports resolve inside the split, dependency audit scripts pass, and split repositories with a `build` script compile.

## Known Manual Review Areas

Some checks still require human or targeted automated review:

- Solana program account-layout compatibility.
- Deterministic worldgen fixture drift; `tests/worldgen_golden.ts` covers representative and wide-range signatures, but protocol-final worldgen changes still need explicit owner review.
- Browser route smoke coverage includes desktop and mobile viewports; screenshot baseline comparison and deeper responsive UI behavior still need targeted review.
- Wallet no-extension and mock injected-provider flows are automated; real extension approval, mobile deep links, network switching, and transaction signing still need targeted review.
- Fourier Pickaxe has documentation-first review evidence; GPU runtime behavior and proof-search performance need a GPU workstation.
- Guardian protocol compatibility, networked soak behavior, slow-client backpressure, and production host capacity.
- Third-party asset and dependency license preservation.
- GitHub Actions workflow publication. The intended workflow is documented in `docs/ci-workflow-spec.md`, but the current push credential cannot create workflow files without `workflow` scope.

## External Reviewer Checklist

A third-party reviewer should start with:

1. Read `docs/review-ownership.md` for ownership and high-risk review triggers.
2. Read `docs/release-readiness.md` for release gates, provenance, and rollback rules.
3. Run `npm run audit:maturity` for the current governance score and known manual gaps.
4. Read `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, and this document.
5. Run `npm run repo:audit`.
6. Read `docs/threat-model.md` and identify the changed trust boundary.
7. Inspect the split repository matching the review target.
8. For protocol work, compare Rust account layouts, SDK decoders, scripts, and docs in the same pass.
9. For worldgen work, compare deterministic inputs, cache invalidation, and generated block outputs.
10. For Guardian work, confirm relay-only authority and no private deployment material.
11. For UI work, validate generated locale files and visible states.

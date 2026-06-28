# NiceChunk Architecture and Audit Surface

This document gives reviewers, automated agents, and future contributors a compact map of the NiceChunk repository set. It explains what each layer owns, what it must not own, and which checks currently protect the public GitHub surfaces.

## System Boundary

NiceChunk is split into focused repositories from one working tree. The main tree is the source of truth; split repositories are public review surfaces generated from it.

The major boundaries are:

- Browser client: wallet flow, pages, rendering, locale dictionaries, and gameplay composition.
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
- Validation commands from `docs/validation-matrix.md` were run for the touched surface.
- Trust boundary and asset impact were checked against `docs/threat-model.md` for high-risk changes.
- Relevant build, test, or manual validation was run for the changed surface.
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

## Known Manual Review Areas

Some checks still require human or targeted automated review:

- Solana program account-layout compatibility.
- Deterministic worldgen fixture drift.
- Browser rendering, wallet flow, and responsive UI behavior.
- Guardian protocol compatibility and load behavior.
- License selection and release policy.
- GitHub Actions workflows, because the current push credential cannot create workflow files without `workflow` scope.

## External Reviewer Checklist

A third-party reviewer should start with:

1. Read `docs/public-review-guide.md` for the evidence-first review path.
2. Read `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, and this document.
3. Run `npm run repo:audit`.
4. Read `docs/threat-model.md` and identify the changed trust boundary.
5. Inspect the split repository matching the review target.
6. For protocol work, compare Rust account layouts, SDK decoders, scripts, and docs in the same pass.
7. For worldgen work, compare deterministic inputs, cache invalidation, and generated block outputs.
8. For Guardian work, confirm relay-only authority and no private deployment material.
9. For UI work, validate generated locale files and visible states.

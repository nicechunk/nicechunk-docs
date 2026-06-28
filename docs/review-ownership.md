# NiceChunk Review Ownership

This document explains how public NiceChunk changes should be routed for review. It complements `.github/CODEOWNERS` and gives external reviewers a human-readable map of the surfaces that require extra attention.

## Default Owner

All public repository surfaces are owned by:

```text
@nicechunk
```

Project sync commits should use:

```text
nicechunk <293527782+nicechunk@users.noreply.github.com>
```

## Ownership Rules

| Surface | Paths | Review Focus |
| --- | --- | --- |
| Repository governance | `.github/`, `README.md`, `SECURITY.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `CODE_OF_CONDUCT.md`, `docs/repository-governance.md` | Public process, security policy, issue/PR flow, and repository health requirements. |
| Release and audit | `docs/public-review-guide.md`, `docs/release-readiness.md`, `docs/threat-model.md`, `docs/validation-matrix.md`, `scripts/audit-repository-health.mjs`, `scripts/split-github-repos.mjs` | Evidence quality, split safety, release gates, provenance, rollback, and secret exposure controls. |
| Solana protocol | `programs/`, `tests/`, `docs/nicechunk_core_genesis.md`, `docs/nicechunk_player_chunk.md`, `docs/nicechunk_guardian.md`, `docs/nicechunk_magicblock_er.md` | Account layouts, PDA seeds, instruction compatibility, authority boundaries, and chain-state behavior. |
| SDK | `sdk/`, protocol-facing scripts, TypeScript tests | Decoder fidelity, instruction construction, PDA derivation, and compatibility with Rust layouts. |
| Browser product | `src/`, `public/`, route directories, locale generation scripts | Wallet flow, UI behavior, i18n, rendering, route builds, and public asset references. |
| Guardian service | `Guardian/` | Relay-only boundary, binary protocol compatibility, AOI/range behavior, and service configuration safety. |
| Split repositories | `.split-repos/nicechunk-*`, generated health files | Generated output matches the main working tree and excludes forbidden paths or private operational material. |

## High-Risk Review Triggers

Require explicit review evidence when a change touches:

- Solana account layout, PDA seeds, instruction discriminators, or authority checks.
- SDK decoders, instruction builders, wallet transaction composition, or RPC behavior.
- Guardian binary protocol, movement relay, region ownership, or service trust boundaries.
- Split repository generation, forbidden path filters, audit checks, or repository health files.
- Release gates, rollback guidance, public security policy, or threat model statements.
- Public examples that mention hosts, addresses, keys, tokens, or infrastructure-like values.

## Required Evidence

Reviewers should expect the contributor or maintainer to provide:

- Summary of the changed surface and trust boundary.
- Validation commands that were run.
- Whether `node scripts/split-github-repos.mjs` changed generated split repositories.
- Whether `npm run validate:repo` passed with no missing files, forbidden paths, broken links, or content findings.
- Whether `npm run test:core`, `npm run build`, or `npm run validate:guardian` was relevant and passed.
- Any remaining manual review gaps.

## Split Repository Note

Generated split repositories receive a broad `.github/CODEOWNERS` file that assigns the public surface to `@nicechunk`. More granular ownership should be maintained in the main working tree so generated repositories do not drift from the source of truth.

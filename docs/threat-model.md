# NiceChunk Threat Model

This document describes the security boundaries that public reviewers, maintainers, and automated agents should use when reviewing NiceChunk. It is intentionally scoped to the public repository surfaces and does not publish private deployment details.

## Review Scope

The public review surface includes:

- browser client code, routes, wallet flows, rendering, and locale dictionaries
- Solana programs, account layouts, instruction handlers, and operation scripts
- TypeScript SDK helpers for PDA derivation, instruction construction, and account decoding
- deterministic world generation and public resource-rule data
- Guardian relay protocol and service logic
- documentation, repository governance files, and generated split repositories

Private production infrastructure, secrets, server inventories, deploy-only scripts, and local debug material are outside the public repository scope and must not be committed.

## Primary Assets

The project is designed to protect:

- wallet signing intent and transaction clarity
- Solana account ownership, PDA derivation, and binary account layout compatibility
- deterministic world generation from seed and coordinate inputs
- resource-rule integrity and inspectable gameplay data
- Guardian relay availability and protocol compatibility
- public repository integrity, including clean commit attribution and absence of secrets
- user-facing copy consistency through the i18n layer where applicable

## Trust Boundaries

NiceChunk reviewers should treat these boundaries as separate:

- The browser client may request signatures, render state, and compose Guardian traffic, but it is not the final settlement authority.
- Solana programs own persistent account state and settlement rules.
- The SDK encodes and decodes program-facing data; it must not silently redefine wallet, RPC, or authority policy.
- Guardian is a realtime relay for regional traffic. It must not sign user transactions, mint assets, or decide final chain state.
- World generation is deterministic protocol behavior; renderers may cache outputs but must not redefine canonical generated blocks.
- Public repositories are review surfaces generated from the main working tree; private operational files must stay outside GitHub and server sync payloads.

## Threats and Controls

| Threat | Current Controls | Review Evidence |
| --- | --- | --- |
| Secret or server detail reaches GitHub | Split path denylist, `.gitignore`, repository audit content scans, forbidden path checks | `npm run validate:repo`, `.split-repos/split-audit.json` |
| Private keys, GitHub tokens, or public server IPs appear in public text files | Repository audit scans token-shaped strings, PEM private-key blocks, and non-reserved public IPv4 addresses | `npm run repo:audit` |
| Deployment scripts or local debug material are published | Split generator excludes deploy, sync, build, debug, and machine-specific paths | `node scripts/split-github-repos.mjs` |
| GitHub author attribution maps to an unrelated account | Project sync commits use `nicechunk <293527782+nicechunk@users.noreply.github.com>` | `git log --format='%an <%ae>'` |
| SDK and program account layouts drift apart | Core tests cover PDA derivation, account layout, instruction builders, and decoders | `npm run test:core` |
| Guardian protocol compatibility regresses | CTest suite covers range checks, AOI behavior, and protocol encoding/decoding | `npm run validate:guardian` |
| Browser routes or generated locale assets break | Production Vite build runs locale generation and route bundling | `npm run build` |
| Documentation links become stale | Repository audit checks local Markdown links across main and split repositories | `npm run validate:repo` |
| Dependency advisory reaches release unnoticed | Controlled npm audit script fails on unexpected vulnerabilities and reports tracked upstream exceptions | `npm run audit:deps`, `docs/supply-chain-security.md` |

## High-Risk Change Classes

Changes in these areas require extra review evidence:

- Solana account layout, PDA seeds, instruction discriminators, or authority checks
- SDK decoder or instruction-builder changes
- wallet connection, signature request, transaction submission, or RPC endpoint logic
- deterministic worldgen seed, coordinate, cache, or block ID logic
- Guardian binary protocol, region ownership, movement validation, or relay permissions
- resource economy, smelting, forging, or NCM format changes
- split repository rules, ignore rules, audit scripts, or sync scripts
- dependency versions, lockfiles, npm overrides, or supply-chain audit exceptions
- public documentation that includes concrete addresses, credentials, hosts, or operational examples

## Required Review Questions

Before merging or syncing a high-risk change, answer:

1. Which trust boundary changed?
2. Which asset is affected?
3. Which validation command proves the expected behavior?
4. Could the change expose a private operational file, credential, server address, or local debug artifact?
5. Does any public example use documentation-reserved IP ranges, placeholder domains, or safe local paths?
6. Does the commit use the project `nicechunk` noreply identity for sync work?

## Known Gaps

These areas remain explicit review gaps rather than hidden assumptions:

- The intended GitHub Actions workflow is documented in `docs/ci-workflow-spec.md`, but workflow publication still requires credentials with `workflow` scope.
- Full Solana BPF builds and local-validator integration tests are not part of the default release validation command.
- Browser route smoke checks are automated, but screenshot baseline comparison, wallet-extension flows, and mobile visual coverage are not automated yet.
- Guardian load testing under realistic movement traffic is not automated yet.
- Deterministic worldgen golden fixtures cover representative outputs but need broader seed and coordinate coverage.
- npm audit still reports tracked Solana upstream advisories; see `docs/supply-chain-security.md`.
- NiceChunk uses Apache-2.0; third-party asset and dependency licenses must remain preserved during redistribution.

## Reporting

Do not publish suspected leaks, private keys, tokens, server addresses, or exploitable vulnerability details in public issues. Follow `SECURITY.md` and report privately with repository name, commit hash, file path, reproduction steps, and impact.

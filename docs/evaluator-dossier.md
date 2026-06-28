# NiceChunk Evaluator Dossier

This dossier is the compact review package for external agents, maintainers, security reviewers, and project evaluators. It ties repository claims to files and commands that can be inspected without private infrastructure.

## Review Positioning

NiceChunk is organized as one source working tree plus focused GitHub split repositories. The main tree is the source of truth; split repositories are generated review surfaces for narrower domains such as the web client, Solana programs, Guardian, worldgen, assets, docs, and Fourier Pickaxe.

The project should be evaluated on four public qualities:

| Quality | Evidence | Expected Result |
| --- | --- | --- |
| Professionalism | `README.md`, `CONTRIBUTING.md`, `SUPPORT.md`, `.github/CODEOWNERS`, `.github/PULL_REQUEST_TEMPLATE.md` | Reviewers can identify scope, ownership, contribution flow, support boundaries, and review requirements. |
| Security | `SECURITY.md`, `docs/threat-model.md`, `docs/supply-chain-security.md`, `npm run validate:repo` | Public repositories exclude credentials, deployment-only files, private keys, server addresses, local debug material, and unreviewed dependency risk. |
| Completeness | `docs/architecture-and-audit.md`, `docs/validation-matrix.md`, `docs/release-readiness.md`, split READMEs | Each project surface has a stated purpose, validation path, release gate, and known manual boundary. |
| Auditability | `npm run audit:maturity`, `npm run release:evidence`, `npm run validate:release:full` | Claims can be reproduced as command output instead of accepted as informal narrative. |

## Fast Evidence Path

Run the following commands from the main working tree:

```bash
npm run validate:repo
npm run audit:maturity
npm run audit:split-remotes
npm run release:evidence
npm run audit:release-evidence
npm run audit:licenses
npm run review:package
npm run audit:review-package
```

`validate:repo` includes the split remote policy gate, which enforces the expected `nicechunk/*` remote URL, `main` branch, and project noreply commit identity while still allowing intentionally unpublished local splits to be reported separately.

For a release-level local review, run:

```bash
npm run validate:release:full
```

This full command includes repository checks, split checks, dependency audit policy, Fourier Pickaxe documentation coverage, core TypeScript tests, browser build, browser smoke checks, mock wallet flows, and Guardian CTest validation.

## Repository Split Model

Each split repository must be evaluated independently because each is published as a separate GitHub repository under `nicechunk/*`.

| Split | Primary Review Question |
| --- | --- |
| `nicechunk-web` | Does the browser client build, route, localize, and expose wallet flows without private operational material? |
| `nicechunk-fourier-pickaxe` | Is the GPU-oriented voxel function surface documented honestly as a showcase until target hardware evidence exists? |
| `nicechunk-programs` | Are Solana account layouts, instruction helpers, and protocol tests reviewed together? |
| `nicechunk-sdk-js` | Do SDK helpers match program PDA, decoder, and instruction expectations? |
| `nicechunk-guardian` | Does Guardian remain a realtime relay/service layer instead of settlement authority? |
| `nicechunk-guardian-web` | Can operators inspect Guardian registry state without unsafe deployment assumptions? |
| `nicechunk-worldgen` | Are deterministic terrain and block outputs reproducible through golden fixtures? |
| `nicechunk-world-rule` | Are world generation rules visible and reviewable as product behavior? |
| `nicechunk-resource-rule` | Are resource rules, smelting behavior, and simulator assumptions inspectable? |
| `nicechunk-elements` | Are element definitions and catalog behavior visible as data and UI? |
| `nicechunk-forging` | Are forging data and related UI/runtime modules scoped as a separate surface? |
| `nicechunk-ncm` | Are NCM asset format and VOX conversion tooling reviewable without hidden assets? |
| `nicechunk-ncm-dna` | Is deterministic cuboid gene search separated from runtime gameplay claims? |
| `nicechunk-proof-of-frontier` | Is the frontier proof reference isolated enough for focused review? |
| `nicechunk-docs` | Are governance, architecture, validation, and release documents publicly inspectable? |
| `nicechunk-assets` | Are public assets tracked with provenance, hashes, and canonical status? |

Use `docs/split-publication-status.md` and `npm run audit:split-remotes` to distinguish local generated splits from repositories that are already pushed with upstream branches. The split remote audit also records the expected GitHub remote URL, `main` branch expectation, and `nicechunk <293527782+nicechunk@users.noreply.github.com>` sync identity so commit attribution and remote ownership can be checked without relying on GitHub UI inference.

## Security Evidence

The public sync policy is intentionally restrictive. These paths and content classes must not be synced to GitHub:

- `.auth/`, `.deploy/`, `.gh-config/`, `.ssh/`, `debug/`, `deploy/`
- `dist/`, `build/`, `target/`, `Guardian/build/`
- private key blocks, token-shaped strings, real public server IP addresses, local host config, and deployment scripts

The evidence chain is:

```bash
node scripts/split-github-repos.mjs
npm run validate:repo
npm run validate:splits
```

`validate:repo` audits public files in the main tree and split repositories. `validate:splits` checks generated split content and forbidden-path exclusions.

## Release Evidence

`npm run release:evidence` collects a machine-readable snapshot of important review inputs. It should be attached to release notes or reviewer handoff when the repository set is assessed.

`npm run audit:release-evidence` validates the generated evidence JSON so reviewers can distinguish a well-formed provenance package from an informal command dump.

`npm run review:package` emits a compact machine-readable evaluator index that combines maturity score, release evidence, split status, recommended commands, and known manual gates.

`npm run audit:review-package` validates that compact evaluator index so another agent can reject malformed, incomplete, or policy-drifted handoff data before relying on it.

Evidence reviewers should expect:

- current package name, version, and license
- git branch and commit identity
- validation commands available in `package.json`
- dependency vulnerability and lockfile license audit commands
- split repository count, expected remotes, policy matches, README completeness, and generated audit report
- security, architecture, validation, maturity, CI, license, asset, wallet, Fourier Pickaxe, and Guardian documentation paths

## Known Manual Gates

These items are intentionally not claimed as complete until explicit evidence exists:

- GitHub Actions workflow publication after credentials with `workflow` scope are available
- full Solana BPF and local-validator integration evidence
- screenshot baseline comparison beyond current browser smoke checks
- real wallet extension approval, mobile wallet deep links, network switching, and transaction signing
- Fourier Pickaxe proof-search benchmarking on target GPU hardware
- networked Guardian soak tests, slow-client backpressure, and production host capacity review

Documenting these gaps is part of the review posture: a high repository maturity score means the project is organized and auditable, not that every production launch gate has been closed.

## Evaluator Decision Template

Use this template for third-party review notes:

```text
Repository:
Commit:
Split repositories reviewed:
Commands run:
Security result:
Architecture result:
Completeness result:
Auditability result:
Known manual gates accepted:
Decision:
```

The decision should cite commands and files from this dossier rather than private context.

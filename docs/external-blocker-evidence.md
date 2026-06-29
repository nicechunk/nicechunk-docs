# External Blocker Evidence

This evidence packet is for reviewers who need to separate source quality from external GitHub or runtime blockers.

It should be read together with `docs/publication-blockers.md`, `docs/split-publication-status.md`, `docs/github-repository-bootstrap.md`, and `docs/manual-gate-decision-policy.md`.

## Review Rule

Do not treat a documented external blocker as a hidden code-quality failure when all local policy checks pass. Treat it as unresolved only for the claim it blocks.

| Blocker | Blocks | Does not block |
| --- | --- | --- |
| `workflow-scope` | Hosted GitHub Actions coverage claims | Local validation, source review, license review, split policy review |
| `manual-runtime-evidence` | Runtime, production, GPU, wallet, on-chain, or network-scale release claims | Repository organization and documentation review readiness |

## Current Evidence Commands

Run these commands from the main working tree:

```bash
npm run audit:publication-blockers
node scripts/audit-split-remotes.mjs --policy-strict
npm run audit:split-publication-docs
npm run audit:maturity
npm run release:evidence
npm run audit:release-evidence
npm run review:package
npm run audit:review-package
```

Expected result:

- publication blocker register parses as schema version 1
- only documented blocker IDs are present
- split remote policy shows expected remotes, `main` branches, and the `nicechunk <293527782+nicechunk@users.noreply.github.com>` sync identity
- `nicechunk-fourier-pickaxe` is published to `git@github.com:nicechunk/Fourier-Voxel.git` with upstream tracking
- release evidence and review package include publication blocker IDs and this external blocker evidence document
- maturity audit may report the missing upstream warning without reporting a source health blocker

## Fourier Pickaxe Publication Evidence

Current local split:

```text
.split-repos/nicechunk-fourier-pickaxe
```

Published remote:

```text
git@github.com:nicechunk/Fourier-Voxel.git
```

Publication command:

```bash
git -C .split-repos/nicechunk-fourier-pickaxe push -u origin main
```

If this command regresses to `Permission denied (publickey)`, the reviewer should verify SSH/GitHub App write access before asking for local source changes. Rewriting local source history does not resolve missing SSH permission when policy-strict local checks pass.

The split can be called publicly synced only when:

- local status is clean
- branch is `main`
- origin matches `git@github.com:nicechunk/Fourier-Voxel.git`
- latest commit author is `nicechunk <293527782+nicechunk@users.noreply.github.com>`
- `node scripts/audit-split-remotes.mjs --policy-strict` passes
- upstream is `origin/main`

## Workflow Scope Evidence

The GitHub Actions workflow is documented in `docs/ci-workflow-spec.md`, but hosted CI must not be claimed until a credential with GitHub `workflow` scope publishes the workflow file and a visible run exists for the reviewed commit.

Local equivalent validation remains:

```bash
npm run validate:release:full
```

This proves local reproducibility of the intended checks. It does not prove hosted GitHub Actions execution.

## Manual Runtime Evidence

Manual runtime gates remain outside repository review completion until evidence exists. These include:

- full Solana BPF and local-validator integration evidence
- screenshot baseline comparison
- real wallet extension approval, mobile deep links, network switching, and transaction signing
- Fourier Pickaxe GPU rendering and proof-search benchmarking
- networked Guardian soak tests, slow-client backpressure, and production host capacity review

The decision policy in `docs/manual-gate-decision-policy.md` is the authority for when those gaps are acceptable for review readiness and when they block release claims.

## Reviewer Decision Text

Use this wording when local policy checks pass but external blockers remain:

```text
The repository set is review-ready for source organization, security hygiene, documentation completeness, and local auditability. Hosted CI publication and runtime/production evidence remain explicitly blocked by external permissions or manual evidence gates and must not be claimed as complete.
```

Use this wording only after the commands in this file pass.

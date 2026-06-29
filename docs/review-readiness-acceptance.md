# Review Readiness Acceptance

This document defines the final local acceptance gate for external reviewers and automated agents.

Use it after the normal evidence commands pass and before describing the repository set as professionally organized and review-ready.

## Acceptance Command

Run from the main working tree:

```bash
npm run audit:review-readiness
```

The command emits JSON with:

- `decision`
- `minimumMaturityScore`
- `allowedExternalBlockers`
- `allowedUnpublishedSplits`
- evidence summaries for maturity, release evidence, review package, and split policy
- blocking findings when the repository should be held

## Accept Decision

The only passing decision is:

```text
accept-review-ready
```

That decision means:

- repository health is clean
- security controls pass
- review documentation is complete enough for external evaluation
- release evidence and review package schemas pass
- split remotes have the expected `nicechunk/*` URLs, `main` branches, and `nicechunk <293527782+nicechunk@users.noreply.github.com>` commit identity
- no generated split repository is dirty
- the maturity score is at least `95/100` with grade `A`
- no generated split repository is unpublished
- the only allowed external blockers are documented in `docs/external-blocker-evidence.md`

## Hold Decision

Any finding means the reviewer should use:

```text
hold
```

Hold is required for:

- repository health findings
- dirty main or split worktrees
- unexpected split remote URL, branch, or author
- missing release evidence or review package fields
- maturity score below 95
- undocumented publication blockers
- a release, runtime, wallet, GPU, hosted CI, on-chain, production, or network-scale claim that lacks the required manual evidence

## External Blocker Boundary

The acceptance command intentionally allows these blockers only as documented external limitations:

| Blocker | Allowed for review readiness | Still blocks |
| --- | --- | --- |
| `workflow-scope` | Yes | Hosted GitHub Actions coverage claims |
| `manual-runtime-evidence` | Yes | Runtime, production, GPU, wallet, on-chain, and network-scale release claims |

These allowances must not be used as substitute evidence. They only prevent external GitHub permission gaps or manual runtime evidence gaps from being misclassified as hidden source-quality failures.

## Reviewer Wording

Use this wording only when `npm run audit:review-readiness` passes:

```text
Decision: accept-review-ready.
Scope: public source organization, security hygiene, documentation completeness, split repository policy, and local auditability.
Limit: this is not a production launch guarantee and does not claim hosted CI, Fourier Pickaxe GPU runtime proof, real wallet signing, Solana integration deployment, or Guardian network capacity evidence.
```

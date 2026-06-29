# Manual Gate Decision Policy

This policy converts manual release gates into explicit reviewer decisions.

Machine-readable source: `docs/manual-gate-decision-policy.json`.

## Decision Rule

Manual gates may remain deferred for repository review readiness when the repository only claims that public source, documentation, validation commands, and audit evidence are organized and inspectable.

Manual gates block release or production claims when the claim depends on runtime, hardware, real wallet, network scale, hosted CI, on-chain integration, or production capacity behavior that has not been evidenced for the exact commit.

## Required Reviewer Behavior

- Accept `review-ready` only when deferred gates are named in `docs/manual-release-gates.md`, `docs/publication-blockers.md`, release evidence, review package, and maturity output.
- Reject `production-ready`, `launch-ready`, hosted CI, real wallet, GPU performance, network scale, or on-chain integration claims unless the matching gate evidence is recorded.
- Do not accept estimates, screenshots from another commit, generic platform claims, private-only logs, unredacted secrets, wallet keys, server addresses, deployment scripts, or raw production logs as substitute evidence.

## Gate Mapping

| Gate ID | Claim It Blocks Without Evidence |
| --- | --- |
| `workflow-scope` | Hosted GitHub Actions coverage that requires `workflow` scope |
| `solana-integration` | Solana BPF and local-validator executable on-chain behavior beyond unit tests |
| `visual-baseline` | Screenshot baseline and visual correctness beyond smoke-tested route rendering |
| `real-wallet` | Real wallet extension, mobile deep-link, network switching, or transaction signing behavior |
| `fourier-gpu` | Fourier Pickaxe runtime visual quality, GPU proof-search speed, or screenshot evidence |
| `guardian-soak` | Networked Guardian scale, slow-client backpressure, or production host capacity |

Use `docs/manual-release-gates.md` for the evidence template and owner table.

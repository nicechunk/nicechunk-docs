# Manual Release Gates

This document converts known non-automated release gaps into explicit reviewer work items. A manual gate is not a weakness by itself; it is a boundary that must not be presented as complete until a named reviewer records evidence.

Use this file when a release note, repository sync, or external review claims production readiness beyond the automated validation suite.

Decision policy: `docs/manual-gate-decision-policy.md` and `docs/manual-gate-decision-policy.json`.

## Evidence Rules

- Record the exact repository commit, split repository commit when relevant, reviewer, date, environment, commands, and observed result.
- Store screenshots, logs, benchmark notes, and terminal output in the release evidence package or an attached private review artifact. Do not commit private credentials, wallet secrets, server addresses, deployment scripts, or raw production logs.
- Mark a gate as `deferred` when target hardware, wallet accounts, credentials, or infrastructure are unavailable.
- Do not replace missing runtime evidence with estimates, screenshots from another commit, or generic platform claims.
- Re-run the gate when the touched files, protocol surface, browser route, Guardian protocol, wallet flow, or Fourier Pickaxe runtime path changes.

## Gate Register

| Gate | Trigger | Minimum Evidence | Pass Criteria | Owner |
| --- | --- | --- | --- | --- |
| GitHub Actions workflow publication | A public repository claims hosted CI coverage | Published workflow file or explicit credential note showing `workflow` scope is unavailable | Workflow exists in the target repository and runs the documented commands, or the release clearly marks CI publication as deferred | Repository maintainer |
| Solana BPF build | Program, SDK, account layout, PDA, instruction, or chain-facing logic changes | `cargo build-sbf --no-default-features --features devnet` output plus affected program list | BPF artifacts build for every affected program without undocumented feature flags | Protocol reviewer |
| Local validator or devnet integration | Release claims executable on-chain behavior beyond unit tests | Local-validator or devnet transaction logs, program IDs, cluster URL, and command transcript | Initialization and representative instructions complete on the intended cluster without relying on private state | Protocol reviewer |
| Screenshot baseline comparison | Browser route, layout, visual asset, or localization changes affect public UI claims | Desktop and mobile screenshots tied to the commit and viewport sizes | Key pages render without blank regions, broken local assets, unreadable text, or obvious layout overlap | Frontend reviewer |
| Real wallet extension approval | Wallet login, transaction, network, or signing UX changes | Browser, extension version, wallet network, approval screenshots, and transaction/signature logs with secrets redacted | Phantom/Solflare/Backpack flow completes the claimed action and handles rejection cleanly | Frontend reviewer |
| Mobile deep links | Release claims mobile wallet support | Device/browser/wallet versions and deep-link screen recording or screenshots | Link opens the intended wallet flow and returns to the app with expected state handling | Frontend reviewer |
| Transaction signing | Release claims signed wallet actions beyond mock-provider UI | Transaction signature, cluster, inspected instruction summary, and wallet approval evidence | Signed transaction matches expected accounts and instructions without exposing private keys | Protocol and frontend reviewers |
| Fourier Pickaxe GPU proof-search benchmarking | Fourier Pickaxe claims runtime visual quality, proof-search speed, or screenshot evidence | GPU model, browser version, `.vox` fixture source, screenshot, proof-search duration, and observed responsiveness | Source, function redraw, and proof candidate panes render on target hardware and benchmark notes are labeled with hardware context | Research reviewer |
| Networked Guardian soak | Guardian service claims networked scale or production readiness | Soak duration, client count, message rate, host profile, logs, and failure summary | Service remains available for the declared workload with no untriaged disconnect or crash pattern | Guardian reviewer |
| Slow-client backpressure | Guardian protocol or networking claims cover adverse clients | Test harness, slow-client profile, queue behavior, and disconnect policy output | Slow clients do not degrade healthy clients beyond the documented threshold | Guardian reviewer |
| Production host capacity | Release claims production host sizing or operational readiness | Host profile, traffic assumptions, CPU/memory/network observations, and rollback notes | Capacity claim is tied to measured workload and does not disclose private server details | Operations reviewer |

## Gate Evidence Template

```text
Gate:
Commit:
Split repository and commit:
Reviewer:
Date:
Environment:
Commands or procedure:
Artifacts:
Result: pass | fail | deferred
Notes:
```

## Deferred Evidence Wording

Use direct wording when evidence is missing:

```text
This release has not collected <gate name> evidence for commit <commit>. The automated checks passed, but <runtime/hardware/infrastructure/wallet> behavior remains a manual release gate.
```

Avoid phrases such as "expected to work", "should be fine", or "validated by inspection" for runtime, wallet, GPU, or production capacity gates.

## Audit Link

`npm run audit:manual-gates` checks that this gate set remains visible in the release readiness document, validation matrix, repository maturity scorecard, and machine-readable release evidence.

It also checks the machine-readable decision policy so reviewers can distinguish repository review readiness from production, runtime, hosted CI, wallet, GPU, on-chain, or network-scale claims.

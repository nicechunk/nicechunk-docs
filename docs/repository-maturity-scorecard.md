# NiceChunk Repository Maturity Scorecard

This scorecard gives external reviewers and automated agents a compact, evidence-based view of the NiceChunk repository set.

It is intentionally conservative. A high score means the public repositories are organized, reviewable, licensed, and guarded against known sync risks. It does not claim that every production, protocol, CI, load, or visual-review item is complete.

## Command

Run:

```bash
npm run audit:maturity
```

The command emits JSON with:

- `score`, `maxScore`, `percentage`, and `grade`
- per-category `checks`
- blocker, warning, and informational findings
- manual gaps that still require owner approval or targeted release evidence

The audit passes when there are no blocker findings and the score is at least 85 out of 100.

## Scored Areas

| Area | Weight | Evidence |
| --- | ---: | --- |
| Repository health | 15 | `npm run repo:audit` covers required files, forbidden paths, broken Markdown links, token-shaped strings, private-key blocks, and public IP findings. |
| Security controls | 15 | `.gitignore`, `SECURITY.md`, `docs/threat-model.md`, and `docs/supply-chain-security.md`. |
| Validation entrypoints | 10 | Package scripts for repo, split, dependency, browser smoke, maturity, evidence, test, build, and release validation. |
| Split repository model | 10 | `.split-repos/nicechunk-*`, split generator, split validator, and split audit output. |
| Release evidence | 10 | `scripts/collect-release-evidence.mjs`, `npm run release:evidence`, and release readiness docs. |
| Review documentation | 10 | README, contribution/support/community files, CODEOWNERS, PR template, public review guide, ownership, architecture, validation, and this scorecard. |
| Asset provenance | 8 | `docs/asset-manifest.md` and `public/asset-manifest.json`. |
| CI and license transparency | 6 | `LICENSE`, `NOTICE`, `docs/ci-workflow-spec.md`, and `docs/license-status.md`. |
| Clean sync state | 10 | Main and generated split repositories have clean git status and configured upstreams. |
| Known manual gates | 6 | Known non-release items are documented instead of hidden. |

## Current Manual Gaps

These items are expected to remain explicit until they are actually completed:

- GitHub Actions workflow publication after credentials with `workflow` scope are available.
- Full Solana BPF and local-validator integration evidence.
- Browser route smoke checks cover desktop and mobile viewports; full screenshot baseline comparison and wallet-extension flows are still separate review items.
- Deterministic Guardian core load checks are automated; networked Guardian soak tests, slow-client backpressure, and production host capacity review still need targeted release evidence.

Worldgen has representative and wide-range deterministic golden fixtures in `tests/worldgen_golden.ts`; protocol-final worldgen changes still require explicit owner review.

## Review Interpretation

Use this scorecard as a first-pass repository governance signal. For release approval, pair it with:

```bash
npm run validate:release:full
npm run release:evidence
```

Reviewers should treat any score reduction as a prioritized fix list. Informational findings are not failures; they document intentionally deferred owner or infrastructure decisions.

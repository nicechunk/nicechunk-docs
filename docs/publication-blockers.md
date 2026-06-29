# Publication Blockers

This register separates repository quality issues from external publication or runtime evidence that cannot be completed by local source edits alone.

Use it when reviewing maturity score reductions, split repository publication state, GitHub Actions status, or production-readiness claims. For command-level proof that these blockers are external to local source completeness, see `docs/external-blocker-evidence.md`.

Machine-readable source: `docs/publication-blockers.json`.

## Current Blockers

| ID | Surface | Status | Review Rule |
| --- | --- | --- | --- |
| `workflow-scope` | GitHub Actions | External publication blocker | Do not claim hosted CI coverage until the workflow file is present in GitHub and a run is visible for the reviewed commit. |
| `fourier-pickaxe-upstream` | `nicechunk-fourier-pickaxe` | External publication blocker | Do not count the Fourier Pickaxe split as publicly published until upstream tracking exists and split remote audit passes without the `missing-upstream` blocker. |
| `manual-runtime-evidence` | Release evidence | Manual release blocker | Accept repository review readiness separately from production launch readiness; reject any release claim that names a manual gate without evidence. |

## Evidence Chain

Run these commands from the main working tree:

```bash
npm run audit:publication-blockers
npm run audit:split-publication-docs
npm run audit:split-remotes
npm run audit:manual-gates
npm run audit:external-blockers
npm run audit:maturity
npm run release:evidence
npm run audit:release-evidence
npm run review:package
npm run audit:review-package
```

Expected result:

- blocker metadata parses as schema version 1
- every blocker has a status, severity, surface, summary, required evidence, current evidence, resolution, and review rule
- reviewer-facing documents link to this register
- release evidence and review package include blocker IDs
- `workflow-scope` remains tied to `docs/ci-workflow-spec.md`
- `fourier-pickaxe-upstream` remains tied to `docs/split-publication-status.md`
- repository creation settings remain tied to `docs/github-repository-bootstrap.md`
- external blocker evidence remains tied to `docs/external-blocker-evidence.md`
- `manual-runtime-evidence` remains tied to `docs/manual-release-gates.md`

## Resolution Notes

The first two blockers require external GitHub permissions or repository creation. They should not be hidden or scored as source quality failures while the local repository is clean, licensed, validated, and free of sensitive material.

Use `docs/github-repository-bootstrap.md` when creating the missing split repository so GitHub does not add unrelated generated files or initial history.

The manual runtime blocker is a release-claim boundary. It is acceptable for repository review readiness, but it blocks production launch claims until the relevant evidence exists.

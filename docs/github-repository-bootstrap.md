# GitHub Repository Bootstrap

This guide is for creating a new public split repository under `nicechunk/*` from an already generated local split in `.split-repos/`.

It is intentionally narrow: do not use it to create deployment repositories, private infrastructure mirrors, debug repositories, or repositories that contain server-specific files.

## Required Repository Settings

Create the repository in GitHub with these settings:

| Setting | Required Value |
| --- | --- |
| Owner | `nicechunk` |
| Repository name | Exact split directory name, for example `nicechunk-fourier-pickaxe` |
| Visibility | Public, unless the owner explicitly records a private-publication exception |
| Initialize with README | Disabled |
| Add `.gitignore` | Disabled |
| Add license | Disabled |
| Default branch | `main` after first push |

Do not let GitHub generate a README, license, or `.gitignore` for the new repository. The generated split already contains the reviewed Apache-2.0 license files, health files, README, changelog, and sync policy. Auto-generated files create unrelated initial history and make provenance harder to audit.

## Preflight

Run from the main working tree:

```bash
node scripts/split-github-repos.mjs
npm run repo:audit
npm run validate:splits
node scripts/audit-split-remotes.mjs --policy-strict
```

Expected preflight result:

- no forbidden path, credential, private key, keypair, server address, or deploy-only script finding
- split repository is clean
- origin remote matches `git@github.com:nicechunk/<repo>.git`
- branch is `main`
- latest author is `nicechunk <293527782+nicechunk@users.noreply.github.com>`
- the only allowed blocker for a not-yet-created repository is `missing-upstream`

## First Push

After the empty GitHub repository exists:

```bash
git -C .split-repos/<repo> push -u origin main
```

For Fourier Pickaxe specifically:

```bash
git -C .split-repos/nicechunk-fourier-pickaxe push -u origin main
```

If GitHub returns `Permission denied (publickey)`, confirm both of these before changing local files:

- the repository exists under `nicechunk/<repo>`
- the SSH key or GitHub App credential used by the sync environment has access to that repository

Do not rewrite or regenerate the split just to fix a missing GitHub repository. Missing upstream is an external publication blocker when local policy checks pass.

## Acceptance Checks

After the first push succeeds:

```bash
npm run audit:split-remotes
npm run audit:split-publication-docs
npm run audit:publication-blockers
npm run audit:maturity
npm run release:evidence
npm run audit:release-evidence
npm run review:package
npm run audit:review-package
```

Then update:

- `docs/split-publication-status.md`
- `docs/publication-blockers.json`
- `docs/publication-blockers.md`
- any release handoff that names the previously unpublished split

The split is publicly published only after the local audit shows a configured upstream, clean status, expected remote, expected branch, and expected author.

## Current Fourier Pickaxe Bootstrap Packet

Current target repository:

```text
git@github.com:nicechunk/nicechunk-fourier-pickaxe.git
```

Current local split:

```text
.split-repos/nicechunk-fourier-pickaxe
```

Current blocker:

```text
missing-upstream
```

Resolution requires an empty GitHub repository named `nicechunk-fourier-pickaxe`, then the first push command above.

# Split Publication Status

NiceChunk uses one main working tree and multiple focused GitHub split repositories. A split is considered publicly synced only when it has:

- a local Git repository under `.split-repos/nicechunk-*`
- an `origin` remote that points at `git@github.com:nicechunk/<repo>.git`
- a `main` branch
- a configured upstream branch
- a latest commit authored by `nicechunk <293527782+nicechunk@users.noreply.github.com>`
- clean local status after the generated split commit is pushed

## Audit Command

Use the local, non-networked audit during ordinary review:

```bash
npm run audit:split-remotes
```

Use the remote reachability check before claiming a newly created split is published:

```bash
node scripts/audit-split-remotes.mjs --check-remote
```

Use policy-strict mode in local validation when remote URL, branch, and latest commit author must be enforced without requiring every split repository to be published:

```bash
node scripts/audit-split-remotes.mjs --policy-strict
```

Use the documentation consistency audit when changing split publication status text:

```bash
npm run audit:split-publication-docs
```

Use strict mode only when all split repositories are expected to be publicly reachable and clean:

```bash
node scripts/audit-split-remotes.mjs --check-remote --strict
```

Policy-strict mode fails on unexpected remote URLs, non-`main` branches, or latest commit authors that do not match the project sync identity. Strict mode includes those policy checks and also fails on unpublished or dirty splits. The default local audit reports all fields without failing, so reviewers can inspect pending publication work without blocking ordinary development.

## Current Fourier Pickaxe Status

`nicechunk-fourier-pickaxe` has been generated and committed locally from the main working tree. It is intentionally listed as unpublished until the GitHub repository exists and the local split can push `main` with an upstream.

The matching publication blocker id is `fourier-pickaxe-upstream` in `docs/publication-blockers.md`.

Repository creation settings and first-push acceptance checks are documented in `docs/github-repository-bootstrap.md`.

Command-level evidence for treating the missing upstream as an external blocker, rather than a source-completeness failure, is documented in `docs/external-blocker-evidence.md`.

## Publication Blocker Register

Publication blockers are separated from source-quality blockers so reviewers can tell whether a repository is incomplete or simply waiting for an external GitHub operation.

### Allowed Publication Blockers

| Blocker | Meaning | Allowed only when | Resolution evidence |
| --- | --- | --- | --- |
| `missing-upstream` | The local split has no configured upstream branch. | The split is generated, clean, on `main`, has the expected origin URL, and the latest commit uses the `nicechunk <293527782+nicechunk@users.noreply.github.com>` identity. | `git -C .split-repos/<repo> push -u origin main` succeeds and `npm run audit:split-remotes` reports a non-empty upstream. |
| `remote-unreachable` | A networked remote check cannot read the GitHub repository. | The repository is newly created, credentials are not available in the review environment, or GitHub access has not been granted yet. | `node scripts/audit-split-remotes.mjs --check-remote` succeeds after repository access is available. |

### Blocking Publication Findings

The following findings are not acceptable publication blockers. They must be fixed before any split is described as ready for public sync:

- wrong origin URL
- branch other than `main`
- latest commit author that is not `nicechunk <293527782+nicechunk@users.noreply.github.com>`
- dirty generated split worktree
- forbidden path, private credential, server address, token, keypair, or deployment-only file
- missing README, license metadata, governance file, changelog anchor, or validation command

### Reviewer Decision Rule

A split can be described as source-complete but unpublished only when `node scripts/audit-split-remotes.mjs --policy-strict` passes and the only remaining blocker is an allowed external publication blocker. A split must not be described as publicly synced until local audit evidence shows a configured upstream, clean status, expected remote, expected branch, and expected author.

### Resolution Checklist

Before clearing an unpublished split from this document:

1. Create the empty GitHub repository under `nicechunk/<repo>`.
2. Confirm the GitHub repository was created without an auto-generated README, `.gitignore`, or license.
3. Run `git -C .split-repos/<repo> remote -v` and confirm it points to the expected `git@github.com:nicechunk/<repo>.git` URL.
4. Run `git -C .split-repos/<repo> push -u origin main`.
5. Run `npm run audit:split-remotes`.
6. Run `npm run audit:split-publication-docs`.
7. Run `npm run audit:maturity`.
8. Update the `Current Unpublished Splits` section only after the audit output proves the split is published.

### External Publication Blocker

Current local policy evidence shows `publicationState: "unpublished"` with the `missing-upstream` blocker. Networked remote checks may additionally report `remote-unreachable` until GitHub returns a readable repository for `git@github.com:nicechunk/nicechunk-fourier-pickaxe.git`.

This is an external publication blocker, not a source completeness blocker: the split has clean generated content, the expected origin URL, the expected `main` branch, and the expected `nicechunk <293527782+nicechunk@users.noreply.github.com>` commit identity. Public sync is incomplete only because the GitHub repository/upstream proof is missing.

Expected first publication command after the empty GitHub repository is created:

```bash
git -C .split-repos/nicechunk-fourier-pickaxe push -u origin main
```

After publication, rerun:

```bash
npm run audit:split-remotes
npm run audit:maturity
```

The maturity score should no longer report the missing upstream warning once the push succeeds.

## Current Unpublished Splits

The current local audit reports these generated split repositories as unpublished:

- `nicechunk-fourier-pickaxe`

This list must match `npm run audit:split-remotes`. When it changes, update this document and run `npm run audit:split-publication-docs`.

## Review Notes

- Missing upstream is not the same as a dirty generated split. It means the split exists locally but has not been proven published.
- Remote reachability depends on GitHub repository existence and SSH credentials, so it is separate from default release validation.
- Do not mark a split as publicly synced in release notes until `audit:split-remotes` shows a configured upstream and clean status.

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

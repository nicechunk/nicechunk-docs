# NiceChunk Repository Governance

NiceChunk uses one working tree and multiple focused GitHub repositories. The split keeps review surfaces small while preserving a single source of truth for protocol, client, service, and documentation work.

## Goals

- Keep protocol code reviewable without requiring the full web client.
- Keep browser product work separate from deployment and service configuration.
- Make deterministic world generation, resource rules, and asset formats independently inspectable.
- Prevent private operational files from reaching GitHub or server sync payloads.

## Canonical Flow

1. Edit the main working tree.
2. Run validation for the touched surface.
3. Run `node scripts/split-github-repos.mjs`.
4. Review `.split-repos/split-audit.json`.
5. Commit and push only repositories with intentional changes.

## Required Public Files

Each public repository should expose:

- `README.md`
- `.gitignore`
- `SECURITY.md`
- `SUPPORT.md`
- `CODE_OF_CONDUCT.md`
- `CONTRIBUTING.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/bug_report.yml`
- `.github/ISSUE_TEMPLATE/feature_request.yml`

## Forbidden Public Paths

The split pipeline blocks known sensitive paths, including:

- `.auth/`
- `.deploy/`
- `.gh-config/`
- `.ssh/`
- `debug/`
- `deploy/`
- `dist/`
- `build/`
- `target/`
- `Guardian/build/`
- server sync scripts
- private key and certificate formats

## Commit Attribution

GitHub maps commit authors by email. NiceChunk sync commits should use:

```text
nicechunk <293527782+nicechunk@users.noreply.github.com>
```

This keeps public attribution consistent and prevents GitHub from displaying unrelated accounts due to email ownership.

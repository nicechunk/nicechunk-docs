# NiceChunk License Status

NiceChunk is licensed under the Apache License, Version 2.0.

The project owner has selected Apache-2.0 as the default license for the NiceChunk repository set, including generated public split repositories.

## Repository License

- Root license file: `LICENSE`
- Notice file: `NOTICE`
- SPDX identifier: `Apache-2.0`
- npm package metadata: `license: "Apache-2.0"`
- Split repository generator: emits `LICENSE`, `NOTICE`, package metadata, and this status document for each generated repository.
- Lockfile license audit: `npm run audit:licenses`

## Scope

Apache-2.0 applies to original NiceChunk source code, documentation, project configuration, and original project assets committed to this repository set.

Third-party dependencies and third-party sample assets keep their own upstream license terms. Review dependency metadata, lockfiles, attribution text, and `public/asset-manifest.json` before redistributing bundled assets outside the project.

`npm run audit:licenses` parses `package-lock.json`, summarizes dependency license identifiers, and fails on unreviewed identifiers. Tracked exceptions are documented in `docs/supply-chain-security.md`.

## Review Requirements

- Do not remove `LICENSE` or `NOTICE` from public repository syncs.
- Keep package `license` fields set to `Apache-2.0`.
- Run `npm run audit:licenses` when dependency metadata changes.
- Preserve third-party attribution and upstream license notices.
- Update this document if any repository, asset group, or distribution package intentionally uses different terms.

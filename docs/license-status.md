# NiceChunk License Status

NiceChunk does not currently publish a public open-source license file.

This is an intentional release-status marker, not an implicit grant of rights. Until the project owner chooses and commits a license, external reviewers should treat the public GitHub repositories as source-available for inspection only.

## What This Means

- Do not assume permission to copy, redistribute, relicense, package, or deploy NiceChunk code outside explicit written permission from the project owner.
- Do not add a license file in a drive-by contribution or automated cleanup.
- Do not mark a release as open source until a license file is committed by the project owner.
- Keep dependency licenses reviewable through `package-lock.json` and upstream package metadata.

## Owner Decision Required

Before a public open-source release, the owner should choose:

- license family, such as permissive, copyleft, source-available, or proprietary
- whether all split repositories use the same license
- whether assets, documentation, programs, SDKs, and generated media need different license terms
- whether contributor agreement or inbound licensing rules are required

## Review Guidance

External reviewers and automated agents should record this as a known release gap, not as a hidden repository hygiene failure. The correct evidence is:

- this document
- `docs/release-readiness.md`
- `docs/public-review-guide.md`
- absence of a committed `LICENSE` file

If a license is later added, update this document or replace it with the final licensing policy.

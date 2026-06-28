# Fourier Pickaxe Showcase

Fourier Pickaxe is a GPU-oriented NiceChunk research page for compact voxel asset functions. This document gives external reviewers and automated agents enough context to assess the project without requiring this environment to run the GPU workload.

## What It Demonstrates

The page presents a local browser workflow:

1. Load a MagicaVoxel `.vox` file.
2. Parse the model through the shared VOX/NCM parser.
3. Normalize colors into the NiceChunk G0 RGB332 palette.
4. Merge same-color voxels into deterministic box basis functions.
5. Encode the basis into compact function bytes.
6. Redraw the asset from those bytes.
7. Preview a local proof-of-work style expression search against the model hash.

The result is a reviewable demonstration of how voxel assets can move from raw editor files toward compact deterministic payloads.

## Documentation-First Review Path

This project needs a GPU-capable browser for meaningful runtime validation. In CPU-only or headless environments, use documentation and static source review instead:

```bash
npm run audit:fourier-pickaxe-docs
sed -n '1,220p' fourier-pickaxe/README.md
sed -n '1,220p' docs/fourier-pickaxe-showcase.md
sed -n '1,220p' fourier-pickaxe/index.html
sed -n '1,260p' fourier-pickaxe/main.js
```

The documentation audit checks that the public repository contains the minimum review material for the Fourier Pickaxe surface and that the declared GPU/runtime limitations are explicit.

## Documentation-Only Showcase

Use this section when the environment cannot run the GPU workload. It is intentionally written as a presentation card that can be copied into an external review, README summary, or repository handoff without overstating runtime proof.

| Topic | Reviewer-facing statement | Static evidence |
| --- | --- | --- |
| Product idea | Fourier Pickaxe explores whether voxel assets can be converted into compact deterministic function payloads for future on-chain or proof-oriented workflows. | `fourier-pickaxe/README.md`, this document |
| Input boundary | `.vox` files are selected locally in the browser and parsed without upload endpoints, wallet signing, deployment scripts, or server credentials. | `fourier-pickaxe/index.html`, `fourier-pickaxe/main.js`, `src/vox/ncm.js` |
| Visual workflow | The UI is designed around source model, function redraw, and proof candidate panes so a GPU reviewer can compare original and generated output side by side. | `sourceScene`, `functionScene`, and `powScene` in `fourier-pickaxe/index.html` |
| Compression path | The current research codec maps colors to G0, merges same-color voxels into box basis functions, and emits `0:<base64url-bytes>`. | `createFunctionPayload`, `mergeSameColorVoxels`, and `docs/fourier-pickaxe-showcase.md` |
| GPU limitation | Headless or CPU-only review can verify documentation and source boundaries, but cannot prove WebGL rendering quality, frame stability, or proof-search performance. | `npm run audit:fourier-pickaxe-docs` |

Recommended short showcase copy:

> Fourier Pickaxe is a GPU-gated NiceChunk research surface for voxel asset functions. In this repository review we validate the architecture, codec documentation, browser-local input boundary, and security scope. Runtime visual quality and proof-search behavior must be confirmed later on GPU hardware with reviewer-supplied `.vox` fixtures.

## Static Evidence Card

Use the following card as the safe non-GPU presentation for GitHub, external agent review, or investor-facing technical screening. It intentionally avoids screenshots, performance numbers, or visual-fidelity claims because those require GPU hardware.

| Field | Display value |
| --- | --- |
| Name | Fourier Pickaxe |
| Category | GPU-oriented voxel function research surface |
| Review mode in this environment | Documentation-only, static source review |
| Core input | Local MagicaVoxel `.vox` files |
| Core output | Compact deterministic function payloads using the `0:<base64url-bytes>` research codec |
| Main viewer concept | Three synchronized panes for source model, function redraw, and best proof candidate |
| Trust boundary | Browser-local file parsing, no upload endpoint, no wallet signature, no server credential |
| Valid static evidence | README, showcase document, HTML structure, JavaScript codec path, parser boundaries, audit script |
| Deferred GPU evidence | WebGL rendering quality, frame stability, proof-search responsiveness, visual screenshots, benchmark numbers |

Static presentation narrative:

1. Fourier Pickaxe turns the abstract asset-function idea into a concrete browser tool.
2. The current implementation shows a deterministic path from `.vox` input to G0 palette boxes and compact function bytes.
3. The repository makes its limitation explicit: documentation can prove scope and boundaries, while GPU hardware must prove live visual behavior.
4. The surface is separated into its own split repository so reviewers can audit the concept without scanning private deployment material or unrelated game runtime code.

## Non-GPU Evidence Checklist

The following checks are valid in this environment:

- The project is documented as a research surface, not a production miner or final codec.
- The public files describe GPU requirements and avoid pretending that static checks prove rendering behavior.
- The static evidence card gives third-party reviewers a concise display summary without inventing runtime output.
- The page has a concrete browser workflow with file input, compute controls, proof controls, metrics, and three canvas panes.
- The runtime source shows local parsing, deterministic palette mapping, basis generation, payload creation, model hashing, and proof-search preview logic.
- The repository audit path contains a dedicated Fourier Pickaxe documentation gate.

The following checks are intentionally deferred to GPU hardware:

- visual fidelity between the uploaded VOX asset and the function redraw
- sustained proof-search responsiveness
- browser frame stability under large voxel assets
- measured GPU, thermal, and power behavior
- reviewer screenshots or videos of the live surface

## Architecture

| Layer | Files | Responsibility |
| --- | --- | --- |
| Page shell | `fourier-pickaxe/index.html` | Tool layout, input controls, metrics, viewer panes, and copy targets. |
| Runtime logic | `fourier-pickaxe/main.js` | VOX loading, palette mapping, basis generation, payload encoding, proof-search preview, and Three.js rendering. |
| Styling | `fourier-pickaxe/styles.css` | Dense tool layout, responsive behavior, canvas framing, metrics, logs, and panels. |
| Parser | `src/vox/ncm.js` | Shared MagicaVoxel parsing and NCM encoding primitives. |
| I18n | `src/i18n.js`, `public/locales/*.json` | Public text and localized labels. |

## Function Payload

The current payload format is a research codec:

```text
0:<base64url([sx, sy, sz, n, {c, x, y, z, w, d, h} * n])>
```

Where:

- `sx`, `sy`, `sz` are source model dimensions.
- `n` is the basis count.
- `c` is a G0 palette index.
- `x`, `y`, `z`, `w`, `d`, `h` define each basis box.
- integers are compact variable-length bytes where applicable.

This is not presented as the final chain codec. It is evidence for the asset-function concept and a target for future protocol review.

## GPU Runtime Expectations

Meaningful runtime review should happen on a machine with:

- WebGL-capable desktop browser
- hardware acceleration enabled
- GPU monitoring available
- a local `.vox` test asset
- reviewer notes for frame stability, fanout behavior, and proof-search responsiveness

The current repository does not claim automated GPU proof-search benchmarking. Headless validation is limited to static source, build, and documentation checks.

## Security Boundary

Fourier Pickaxe stays inside the public review boundary:

- no private server address
- no deployment script
- no wallet key
- no GitHub token
- no upload endpoint
- no production credential

The input file is read locally by browser APIs. Reviewers should continue treating arbitrary `.vox` input as untrusted data and should check parser changes carefully.

## Review Checklist

Before accepting a Fourier Pickaxe change, verify:

- `fourier-pickaxe/README.md` describes scope and GPU requirements.
- `docs/fourier-pickaxe-showcase.md` describes architecture, payload format, and limitations.
- `docs/fourier-pickaxe-showcase.md` includes the documentation-only showcase and non-GPU evidence checklist.
- `npm run audit:fourier-pickaxe-docs` passes.
- `npm run build` still includes the `/fourier-pickaxe/` route.
- Split repository generation keeps this surface self-contained.
- No private infrastructure, deployment script, key, token, or server address is introduced.

## Known Limits

- GPU runtime behavior is not proven by the documentation audit.
- Proof-search performance is not benchmarked in the default validation path.
- The payload format is experimental and should not be treated as final protocol.
- Real asset corpus coverage requires separate reviewer-supplied `.vox` fixtures.

# Rendering Performance With a Verifiable World

This note records the current evidence and the preferred architecture for improving the NiceChunk play client without increasing on-chain storage cost or weakening canonical verification.

## Current Invariants

- The chain must not store full generated chunks.
- The chain remains responsible for validating mined canonical blocks and storing compact mined deltas.
- The client may cache, batch, and render deterministic world data, but visual caches must never become consensus state.
- Movement must not hide trees, grass, clouds, or terrain detail.
- The visible range must not shrink during movement.
- The first viewport must not contain transparent holes while real chunk meshes are still loading.

## Chain Boundary

The current chain model is the right boundary for low-cost verification.

- `nicechunk_chunk::mine_block` recomputes the canonical block id from the global config and submitted coordinates.
- The instruction rejects mismatched, air, water, and bedrock blocks.
- The chunk PDA stores only packed mined coordinates.
- One mined block record is 3 bytes after the chunk account header.
- Initial chunk broken capacity is 64 records, with a 208 byte account length.
- Growth happens in 64 record increments, up to the configured max capacity.

This means rendering changes should not require:

- chunk voxel arrays on-chain
- tree or terrain meshes on-chain
- Merkle roots for every generated chunk
- per-frame or per-viewport chain writes
- client-generated visual state as proof input

The verifiable state is:

```text
final block state = canonical generated block(global config, x, y, z) + chain mined/placed deltas
```

## Measured Bottleneck

The slow initial render is dominated by client-side placeholder mesh rebuilding, not worker chunk generation.

Worker build benchmark over 49 chunks:

| Mode | Average build time | p50 | p95 | Average transfer |
| --- | ---: | ---: | ---: | ---: |
| surface | 8.87 ms | 7.58 ms | 14.55 ms | 17.95 KB/chunk |
| distant | 10.29 ms | 10.06 ms | 11.20 ms | 17.95 KB/chunk |
| decorated | 10.06 ms | 10.04 ms | 10.57 ms | 17.95 KB/chunk |
| full | 16.32 ms | 16.10 ms | 17.40 ms | 17.95 KB/chunk |

Baseline browser sampling on the deployed build:

| Time after load | Real chunks | Placeholder chunks | FPS sample |
| ---: | ---: | ---: | ---: |
| 0 ms | 9 | 160 | 2 |
| 500 ms | 13 | 156 | 14 |
| 1000 ms | 17 | 152 | 6 |
| 2500 ms | 26 | 143 | 5 |
| 5000 ms | 39 | 130 | 5 |
| 8000 ms | 53 | 116 | 4 |
| 12000 ms | 71 | 98 | 4 |

CPU profiling on the unminified dev build showed these placeholder functions as the main hot path:

- `appendGreedyPlaceholderTopQuads`
- `hasPlaceholderCell`
- `hasVisitedPlaceholderCell`
- `appendGreedyPlaceholderPlane`
- `rebuildPlaceholderBatch`

The hot path is caused by rebuilding the whole placeholder batch every time a real chunk commit removes one placeholder chunk.

## Local Experiment

A temporary local experiment changed only two behaviors:

- placeholder surfaces were slightly lowered under the real block top surface
- `removePlaceholderChunk()` deleted placeholder state without immediately rebuilding the placeholder mesh

The temporary experiment was reverted after measurement and was not deployed.

Experiment browser sampling:

| Time after load | Real chunks | Placeholder chunks | FPS sample |
| ---: | ---: | ---: | ---: |
| 0 ms | 9 | 160 | 2 |
| 500 ms | 21 | 148 | 14 |
| 1000 ms | 30 | 139 | 14 |
| 2500 ms | 50 | 119 | 5 |
| 5000 ms | 80 | 89 | 4 |
| 8000 ms | 112 | 57 | 4 |
| 12000 ms | 155 | 14 | 4 |

The same CPU profile no longer showed placeholder greedy rebuild functions in the hot list. The remaining cost moved to normal worker message handling, instanced mesh creation, WebGL upload, and draw calls.

This proves the primary optimization direction:

```text
Do not rebuild the whole placeholder mesh on every real chunk commit.
```

## Recommended Client Architecture

Use a stable placeholder layer and a separate authoritative real chunk layer.

### 1. Placeholder Layer

The placeholder layer exists only to prevent transparent holes before real chunk meshes are ready.

Rules:

- Build placeholder coverage for the full visible range during startup or viewport changes.
- Render placeholder surfaces slightly below real chunk top faces.
- Disable placeholder raycasting and interaction.
- Do not use placeholder geometry for mining, placement, collision, or chain submission.
- Do not rebuild the placeholder batch when a single real chunk arrives.
- Rebuild or compact placeholder geometry only during scheduled idle maintenance or viewport center changes.

### 2. Real Chunk Layer

The real chunk layer is the only layer that participates in interaction.

Rules:

- Worker-generated chunk meshes use deterministic canonical generation plus local chain deltas.
- Real chunk meshes are added directly when worker data is committed.
- Real chunks cover placeholders visually.
- Real chunks own interaction, mining hit testing, collision references, and block removal visuals.
- Mined-block rebuilds should update the real chunk, not the placeholder layer.

### 3. Placeholder Invalidation

The final implementation must avoid placeholder surfaces showing through mined holes inside real chunks.

Preferred options, in order:

1. Keep placeholder mesh visually under real chunk surfaces, then batch-refresh placeholder geometry after enough real chunks have arrived or when the player is idle.
2. Maintain placeholder meshes in region buckets, but only rebuild dirty buckets during idle frames, not during chunk commit.
3. Use a lightweight mask of generated chunk keys when rebuilding placeholder geometry, so placeholder cells are omitted where real chunks exist.

Do not perform synchronous full-range placeholder rebuilds inside `commitChunkRenderData()`.

### 4. Commit Scheduling

Chunk commit scheduling should protect input latency.

Rules:

- Worker builds may run ahead.
- Main-thread commits should be bounded by a small frame budget.
- Commits should prioritize nearby generated chunks over preload chunks.
- Placeholder maintenance should have a separate idle budget and must not block movement input.
- Moving should not hide or downgrade content; it should only lower background maintenance priority.

## Verification Plan

Before deploying a rendering optimization, collect these checks.

### Functional

- No transparent holes in the first viewport.
- Trees do not disappear while moving.
- Holding one movement key and pressing another still changes direction.
- Mining a generated block updates the real chunk correctly.
- Mined holes do not reveal stale placeholder surfaces in generated chunks.
- Chain submission still uses canonical block id and mined delta state.

### Performance

Use the debug render flag and browser profiling.

Required metrics:

- real chunks loaded after 1 second
- real chunks loaded after 5 seconds
- real chunks loaded after 12 seconds
- `renderer.info.render.calls`
- `renderer.info.render.triangles`
- long task count and total duration
- CPU profile top functions

The placeholder rebuild functions should not appear as dominant CPU profile entries during normal chunk commit.

### Measurement Harness

Use the repeatable Playwright harness instead of one-off console snippets:

```bash
node scripts/measure-render-performance.mjs
```

Useful environment variables:

```bash
NICECHUNK_RENDER_URL=http://127.0.0.1:4191/play/
NICECHUNK_RENDER_SAMPLES_MS=0,500,1000,2500,5000,8000,12000
NICECHUNK_RENDER_PROFILE_MS=8000
NICECHUNK_RENDER_MOVEMENT=1
node scripts/measure-render-performance.mjs
```

The script reports:

- `window.NiceChunkDebugRender`
- HUD chunk and FPS text
- long task count, total time, and max duration
- active play bundle URL
- optional movement-combo check
- optional CPU profile top functions

Use this script for baseline and candidate measurements. Keep the viewport fixed when comparing runs.

### Contract Cost

Confirm that the change does not modify:

- `programs/nicechunk_chunk`
- `sdk/nicechunk-chunk.ts` canonical verification logic
- chunk PDA account layout
- mined block packed delta format
- global config format

If any of these change, the optimization is no longer a pure client rendering optimization and needs a separate protocol review.

## Anti-Goals

Avoid these regressions:

- hiding trees or vegetation while moving
- reducing render distance during movement
- lowering pixel ratio only during movement
- using placeholder state for mining or collision
- writing render cache data on-chain
- requiring full chunk PDA storage
- adding visual-only state to canonical verification

## Next Implementation Target

The next code change should be narrowly scoped:

1. Separate placeholder state removal from placeholder mesh rebuilding.
2. Lower placeholder surfaces enough to avoid z fighting with real chunks.
3. Add an idle placeholder maintenance queue that rebuilds placeholder geometry after chunk commits are batched.
4. Ensure the maintenance rebuild omits already generated chunks.
5. Verify with Playwright and CPU profiling before deployment.

This keeps the contract model low-cost and verifiable while removing the current client-side startup bottleneck.

## Function-Level Implementation Design

The current critical call path is:

```text
handleChunkWorkerMessage()
  -> queueChunkRenderCommit()
  -> processPendingChunkCommits()
  -> commitChunkRenderData()
  -> removePlaceholderChunk()
  -> rebuildPlaceholderBatch()
```

The desired call path is:

```text
handleChunkWorkerMessage()
  -> queueChunkRenderCommit()
  -> processPendingChunkCommits()
  -> commitChunkRenderData()
  -> markPlaceholderChunkCovered()
  -> queuePlaceholderMaintenance()
```

`commitChunkRenderData()` must remain focused on committing real chunk render data. It should not do expensive placeholder mesh work.

### Proposed State

Add explicit placeholder maintenance state:

```js
const placeholderCoveredChunkKeys = new Set();
let placeholderMaintenanceQueued = false;
let placeholderBatchNeedsRebuild = false;
let placeholderLastFullRebuildAt = 0;
```

Meaning:

- `placeholderChunks`: placeholder source data for not-yet-covered visible chunks.
- `placeholderCoveredChunkKeys`: visible chunks that have real chunk meshes and should be omitted from the next placeholder rebuild.
- `placeholderBatchNeedsRebuild`: a dirty flag, not permission to rebuild synchronously.
- `placeholderMaintenanceQueued`: prevents repeated scheduling.

The important rule is that `placeholderChunks` and the rendered placeholder mesh are allowed to be temporarily out of sync. The mesh is visual-only, non-interactive, and slightly below real chunk surfaces.

### Placeholder Surface Height

Current placeholder surface offset is `0.515`, which sits slightly above normal cube top height and can conflict visually with real chunk terrain.

The implementation should lower placeholder surfaces below the real top face, for example:

```js
const placeholderTopYOffset = 0.49;
```

This makes real chunk geometry visually dominate when both layers exist for the same chunk during the short deferred-maintenance window.

Water placeholders need separate review because current water placeholders pass `yOffset: 0.18`. Water should remain below or visually compatible with real water surfaces.

### Replace `removePlaceholderChunk`

Current behavior:

```js
function removePlaceholderChunk(key) {
  pendingPlaceholderChunkKeySet.delete(key);
  if (!placeholderChunks.has(key)) return;
  placeholderChunks.delete(key);
  rebuildPlaceholderBatch();
}
```

Target behavior:

```js
function markPlaceholderChunkCovered(key) {
  pendingPlaceholderChunkKeySet.delete(key);
  if (!placeholderChunks.has(key)) return;
  placeholderChunks.delete(key);
  placeholderCoveredChunkKeys.add(key);
  queuePlaceholderMaintenance();
}
```

`commitChunkRenderData()` and `attachPreloadedChunk()` should call `markPlaceholderChunkCovered(key)` instead of rebuilding placeholder geometry immediately.

### Placeholder Maintenance

Placeholder maintenance should run after normal input, movement, chunk build scheduling, and real chunk commits.

Pseudo-code:

```js
function queuePlaceholderMaintenance() {
  placeholderBatchNeedsRebuild = true;
  if (placeholderMaintenanceQueued) return;
  placeholderMaintenanceQueued = true;
}

function processPlaceholderMaintenance() {
  if (!placeholderBatchNeedsRebuild) return;
  if (isPlayerActivelyMovingForChunkWork()) return;
  if (pendingChunkCommits.length - pendingChunkCommitCursor > 0) return;
  if (performance.now() - lastChunkRenderCommitAt < 120) return;

  placeholderMaintenanceQueued = false;
  placeholderBatchNeedsRebuild = false;
  rebuildPlaceholderBatchSkippingGenerated();
}
```

The maintenance call should happen once per frame from `animate()`, after `processPendingChunkCommits()`.

The delay after `lastChunkRenderCommitAt` prevents an immediate rebuild storm while many worker results are arriving.

### Rebuild With a Mask

`rebuildPlaceholderBatch()` should have a masked variant:

```js
function rebuildPlaceholderBatchSkippingGenerated() {
  disposePlaceholderBatch();
  const cellsByType = new Map();
  for (const [key, placeholder] of placeholderChunks) {
    if (generatedChunks.has(key)) continue;
    if (placeholderCoveredChunkKeys.has(key)) continue;
    appendPlaceholderCells(cellsByType, placeholder);
  }
  buildPlaceholderMeshes(cellsByType);
}
```

This ensures the maintenance rebuild removes placeholder geometry where real chunks exist, without doing that work during every real chunk commit.

### Viewport Changes

`generateAround()` should still be allowed to do an immediate placeholder rebuild when the visible range changes substantially.

Safe immediate rebuild cases:

- first startup placeholder coverage
- player enters a new chunk and missing placeholders are added for newly visible chunks
- placeholder cleanup for chunks outside visible range

Unsafe immediate rebuild case:

- real chunk commit for one chunk

This distinction matters because viewport changes happen far less often than worker chunk commits.

### Mining and Holes

The riskiest visual edge case is stale placeholder terrain showing through a mined hole in a generated chunk.

Mitigations:

- Real chunk hit testing and mining must ignore placeholders.
- Placeholder mesh must be lower than real terrain.
- Mining a block in a generated chunk should call `queuePlaceholderMaintenance()` after the chunk rebuild has been scheduled.
- The maintenance rebuild must skip generated chunk keys.
- Tests should mine a visible surface block and inspect the area for stale placeholder geometry.

If this still shows visual bleed-through in practice, use chunk-bucket placeholder meshes as a second phase. Buckets let the client hide or rebuild only the affected placeholder bucket after mining, still without full visible-range rebuilds.

### Metrics To Add Temporarily During Implementation

Add debug-only metrics while implementing, then keep or remove them after profiling:

```js
placeholderMeshRebuilds
placeholderMaintenanceQueued
placeholderMaintenanceSkippedMoving
placeholderMaintenanceSkippedCommits
pendingPlaceholderChunkKeys
pendingChunkCommits
activeChunkBuilds
```

These should be exposed only through `window.NiceChunkDebugRender` when `window.NiceChunkDebugRenderEnabled` is true.

## Expected Performance Target

The local experiment reached:

- 30 real chunks after 1 second
- 80 real chunks after 5 seconds
- 155 real chunks after 12 seconds

A production implementation with safe placeholder maintenance should target at least:

- 25 or more real chunks after 1 second
- 70 or more real chunks after 5 seconds
- 140 or more real chunks after 12 seconds

These are headless-browser reference targets, not absolute user-device targets. The important regression signal is whether placeholder greedy rebuild functions reappear as dominant CPU profile entries.

## Contract Review Checklist

The implementation is acceptable only if all answers remain "no":

- Did the change modify `programs/nicechunk_chunk`?
- Did the change modify canonical block generation used by chain verification?
- Did the change require full chunk data on-chain?
- Did the change require a new proof field for visual state?
- Did the change make mining depend on placeholder geometry?
- Did the change write render-cache state to any PDA?

If any answer is "yes", the change is no longer a client-only rendering optimization.

## Canonical Parity Risk

The deterministic world rules currently exist in three places:

- browser/client generation in `src/world/canonicalResource.js`
- SDK and script verification in `sdk/nicechunk-chunk.ts`
- on-chain verification in `programs/nicechunk_chunk/src/state.rs`

This duplication is acceptable only if rendering performance work does not change canonical block selection. Rendering optimizations should be limited to:

- mesh batching
- placeholder rendering
- worker scheduling
- render data caching
- debug measurement
- non-interactive visual coverage

Rendering optimizations must not change:

- `canonicalBlockIdAt`
- `canonicalSurfaceHeightAt`
- tree placement rules
- water level rules
- ore seam rules
- block id mappings
- coordinate rounding or floor division semantics
- chunk-local coordinate packing

If a future optimization needs to alter canonical rules, it is not a rendering-only change. It requires a protocol-level parity update.

### Existing Coverage

Current coverage includes:

- Rust unit vectors in `canonical_resource_vectors_match_frontend`
- SDK tests that check canonical block ids
- `scripts/verify-generated-block.ts` for local canonical inspection against the decoded global config
- the mining instruction recomputing canonical block ids on-chain before appending packed deltas

These checks cover some basic stable vectors, but they are not enough for broad terrain/tree/water parity.

Current baseline commands:

```bash
npm run test:core -- --grep "canonical|chunk|mine"
cargo test -p nicechunk_chunk canonical -- --nocapture
cargo test -p nicechunk_chunk -- --nocapture
```

Baseline result on the current workspace:

- SDK/core filtered tests: 13 passing
- Rust canonical vector test: 1 passing
- Rust `nicechunk_chunk` unit tests: 10 passing

The Rust test set includes compact chunk-broken layout, 3-byte packed mined coordinates, duplicate detection, negative world-coordinate chunk floor behavior, stable surface height, basic generated layers, coal seam discovery, and frontend matching vectors.

### Required Parity Gate For Canonical Changes

Before any canonical generation change, add or run a cross-implementation vector set that includes:

- negative world coordinates
- negative chunk coordinates
- surface blocks
- shallow subsurface blocks
- deep stone
- coal seams
- water above terrain
- air above terrain
- tree trunks and leaves
- biome extremes such as desert, wet, cold, volcanic, and coast
- min and max build height boundaries

The vector set should record:

```text
worldX, worldY, worldZ, chunkX, chunkZ, localX, localZ, surfaceY, blockId
```

The browser implementation, SDK implementation, and Rust implementation must all produce the same `surfaceY` and `blockId`.

### Rendering-Only Gate

For the placeholder optimization described in this note, the canonical parity gate is simple:

- no changes to `src/world/canonicalResource.js`
- no changes to `sdk/nicechunk-chunk.ts`
- no changes to `programs/nicechunk_chunk/src/state.rs`
- no changes to block id constants or render-to-block mappings

If those files are unchanged, the optimization remains inside the client visual layer and does not affect contract cost or verification semantics.

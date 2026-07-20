# PDA Chunk Storage Optimization Notes

This note records the current design direction for storing voxel chunk changes in Solana PDA accounts. It is a development reference, not a final protocol spec.

## Core Principle

Do not store the full generated world.

The world should be reconstructed from:

1. deterministic generation algorithm
2. world seed / chunk seed
3. generation rule version
4. compact player or chain state deltas

Natural terrain, trees, water, caves, biome surfaces, and generated decorations should not be stored in PDA data unless they are explicitly changed by gameplay.

In short:

```text
final chunk = procedural generated chunk + compact delta patch
```

This is the only scalable direction for an infinite world.

## Why Full Chunk Storage Is Not Viable

A chunk with vertical height 128 contains:

```text
16 * 16 * 128 = 32768 cells
```

If every cell needs 6 bits for block type:

```text
32768 * 6 bits = 196608 bits = 24576 bytes
```

That is roughly 24 KB before account overhead, serialization overhead, string encoding, ownership metadata, sequence data, or compression headers.

This is too large if every chunk is stored directly, especially for an infinite world.

The storage target should be:

```text
ordinary chunk: tens to hundreds of bytes
heavily edited chunk: compact patch or section snapshot
```

## Never Store Global XYZ In Chunk Patch Data

The PDA address already identifies the chunk:

```text
chunkX, chunkZ
```

Inside the account, only local coordinates are needed.

For a 16x16 chunk:

```text
localX: 0-15 -> 4 bits
localZ: 0-15 -> 4 bits
```

If the vertical section is 64 blocks high:

```text
localY: 0-63 -> 6 bits
```

Cell index:

```text
cellIndex = (localY << 8) | (localZ << 4) | localX
```

For a 64-layer section:

```text
cellIndex range = 0..16383
fits in u16
```

This means one local cell position can be stored in 2 bytes.

Avoid JSON-like storage:

```json
{ "x": 12345, "y": 88, "z": -9912, "block": "grass" }
```

Prefer compact binary:

```text
u16 cellIndex
u16 opBlock
```

## Section-Based Vertical Layout

Recommended section height:

```text
64 blocks
```

Each PDA patch can address one vertical section:

```text
chunkX, chunkZ, sectionY
```

Where:

```text
sectionY = floor(globalY / 64)
localY = globalY % 64
```

Benefits:

1. local cell index fits in `u16`
2. edited vertical ranges stay bounded
3. partial loading is easier
4. future compaction can happen per section

## Basic Delta Encoding

The first implementation can use fixed-size edits:

```text
cellIndex: u16
opBlock:   u16
```

`opBlock` packs:

```text
op:      2 bits
blockId: remaining bits
```

Example operation values:

```text
0 = noop / reserved
1 = mined / removed
2 = placed
3 = special state
```

If block IDs are fewer than 1024 types, 10 bits are enough for `blockId`.

One edit can be as small as:

```text
4 bytes
```

This is already much better than storing full coordinates or serialized objects.

## Run Encoding

When player edits are continuous, store a run instead of single cells.

Example:

```text
startIndex + axis + length + opBlock
```

Useful for:

1. tunnels
2. rows of placed blocks
3. straight mining paths
4. bridge or wall segments

Approximate payload:

```text
startIndex: u16
axis:       2 bits
length:     u8
opBlock:    u16
```

This can describe many edited cells in about 5-6 bytes.

## Box Encoding

For rectangular edits, use a box operation:

```text
startIndex + sizeX + sizeY + sizeZ + opBlock
```

Useful for:

1. rooms
2. cleared areas
3. floors
4. walls
5. cubic construction patterns

Example:

```text
4 * 3 * 2 = 24 cells
```

Single edits:

```text
24 * 4 bytes = 96 bytes
```

Box edit:

```text
roughly 5-7 bytes
```

This is a strong compression win.

## Layer Formula Encoding

A 16x16 horizontal layer has:

```text
16 * 16 = 256 cells
```

If the only state is:

```text
0 = unchanged / not mined
1 = mined / removed
```

Then all possible layer states are:

```text
2^256
```

Do not build a mapping table for these states. A full mapping table would require `2^256` records, which is impossible.

Instead, use a deterministic formula. A single 256-bit value can represent the entire layer state.

This 256-bit value is effectively the pattern ID.

```text
layerMask = 256-bit integer
```

The formula:

```text
bitIndex = z * 16 + x
```

Where:

```text
x = 0..15
z = 0..15
bitIndex = 0..255
```

Set bit:

```text
1 = cell is mined / removed
0 = cell is not mined / unchanged
```

Mathematical form:

```text
layerMask = sum(state(x, z) * 2^(z * 16 + x))
```

Where:

```text
state(x, z) = 1 if mined
state(x, z) = 0 otherwise
```

Decode:

```text
state(x, z) = floor(layerMask / 2^(z * 16 + x)) mod 2
```

In byte form:

```text
byteIndex = bitIndex >> 3
bitInByte = bitIndex & 7
```

Set:

```js
mask[byteIndex] |= 1 << bitInByte;
```

Read:

```js
isMined = (mask[byteIndex] >> bitInByte) & 1;
```

Recommended PDA representation:

```rust
struct LayerMaskEdit {
    local_y: u8,
    mask: [u8; 32],
}
```

This stores one arbitrary 16x16 layer state in:

```text
32 bytes + layer header
```

This is the theoretical minimum fixed-length representation for all possible 16x16 binary layer states.

## LayerMask Versus Sparse Edits

The 256-bit layer mask is universal, but it is not always the shortest encoding.

If only one cell is mined:

```text
LayerMask = 32 bytes
Sparse position = 1 byte plus header
```

If two cells are mined:

```text
LayerMask = 32 bytes
Sparse positions = 2 bytes plus header
```

So the encoder should not always use `LayerMaskEdit`.

Recommended rule of thumb:

```text
0 changed cells: store nothing
1-8 random changed cells: SparseList
continuous line: RunEdit
rectangle: BoxEdit
many random cells in one layer: LayerMaskEdit
heavily edited section: Palette Snapshot
```

More robust approach:

```js
function chooseBestLayerEncoding(layerEdits) {
  const candidates = [
    encodeAsSparseList(layerEdits),
    encodeAsRuns(layerEdits),
    encodeAsRectangles(layerEdits),
    encodeAsLayerMask(layerEdits),
  ];

  return pickSmallest(candidates);
}
```

This gives the best practical compression without maintaining any impossible global mapping table.

## Multiple Layer Formula Encoding

If a section needs 11 edited layers, and each layer uses a full 256-bit mask:

```text
11 * 256 bits = 2816 bits
2816 / 8 = 352 bytes
```

But unchanged layers should not be stored.

Example:

```text
only 2 edited layers -> 2 * 32 bytes + small headers
```

The formula scales cleanly:

```text
section patch = list of changed LayerMaskEdit records
```

This is useful when edits are random within a layer and cannot be represented compactly as runs or rectangles.

## Patch Operation Types

Recommended patch operation categories:

```text
0 = SingleCellEdit
1 = RunEdit
2 = BoxEdit
3 = Reserved / future codec
```

Do not rely on default Rust enum serialization for the final protocol, because enum serialization can add unnecessary overhead.

Prefer custom byte packing.

Conceptual shape:

```rust
enum PatchOp {
    Single {
        index: u16,
        op_block: u16,
    },
    Run {
        start: u16,
        axis: u8,
        len: u8,
        op_block: u16,
    },
    Box {
        start: u16,
        sx: u8,
        sy: u8,
        sz: u8,
        op_block: u16,
    },
}
```

## Delta Sorting And Varint Compression

If edits are sorted by `cellIndex`, positions can be delta encoded:

```text
1000, 1001, 1002, 1003, 1010
```

Becomes:

```text
1000, +1, +1, +1, +7
```

Small deltas can be encoded as varints.

This is useful after the basic version is stable.

Recommended sequence:

1. implement fixed-width edit records first
2. add run and box encoding
3. add delta-varint encoding only if needed

## Palette Snapshot For Heavily Edited Sections

Delta patches are best for sparse edits.

If too much of a section is edited, use a palette-compressed section snapshot.

Example section:

```text
16 * 16 * 64 = 16384 cells
```

If only a few block types exist:

```text
palette:
0 = air
1 = dirt
2 = stone
3 = grass
4 = water
```

Then each cell only needs enough bits to index the palette.

Use snapshot compaction when delta count becomes too high.

Possible threshold:

```text
if edited cells >= 512 in one section:
    consider section snapshot compaction
```

The exact threshold should be tested against real gameplay data.

## PDA Account Layout Direction

Separate metadata from patch payloads.

Suggested accounts:

```text
ChunkMeta PDA
ChunkPatch PDA
```

`ChunkMeta`:

```rust
struct ChunkMeta {
    version: u8,
    chunk_x: i32,
    chunk_z: i32,
    seed_hash: u32,
    latest_patch_seq: u32,
    patch_count: u16,
    compacted_section_mask: u16,
}
```

`ChunkPatch`:

```rust
struct ChunkPatch {
    version: u8,
    chunk_x: i32,
    chunk_z: i32,
    section_y: i16,
    patch_seq_start: u32,
    patch_seq_end: u32,
    codec: u8,
    data: Vec<u8>,
}
```

The `data` field should be compact binary bytes.

Do not store base64 or base58 strings inside PDA accounts unless there is a very specific reason.

Strings are useful for debugging or sharing, but they expand the data size.

## Characters Versus Bytes

A short string is not automatically smaller than binary data.

Base64 expands binary by about 33%.

Example:

```text
300 bytes binary -> about 400 base64 characters
```

For PDA storage:

```text
store bytes, not strings
```

For debugging:

```text
encode bytes as base64url or base58 outside the account
```

## Recommended Development Phases

### Phase 1: Simple Compact Delta

Implement:

```text
chunk/section PDA
u16 localCellIndex
u16 opBlock
fixed-width edit list
```

Goal:

```text
replace global xyz records with compact local binary edits
```

### Phase 2: Run And Box Compression

Implement:

```text
SingleCellEdit
RunEdit
BoxEdit
```

Client should merge edits before submission when possible.

Goal:

```text
make tunnels, floors, walls, and rooms cheap
```

### Phase 3: Section Snapshot Compaction

Implement palette snapshots for heavily edited sections.

Goal:

```text
avoid endless delta growth in heavily modified chunks
```

### Phase 4: Advanced Codecs

Only after real data shows a need:

```text
delta-varint encoding
dictionary/template operations
zstd/brotli off-chain debug export
```

## Important Design Boundaries

Generated world data should remain off-chain and deterministic.

PDA data should only store:

1. player mining
2. player placement
3. chain-authoritative deltas
4. compacted section snapshots when necessary

Avoid storing:

1. natural generated block list
2. full chunk voxel arrays
3. global xyz per edit
4. JSON payloads
5. base64/base58 strings as primary storage

## Current Preferred Direction

Use:

```text
Procedural world
+ chunk-local indexed delta patch
+ run/box compression
+ optional palette snapshot
+ PDA binary bytes
```

This should keep normal chunk account data small while still allowing heavily edited player areas to remain recoverable and deterministic.

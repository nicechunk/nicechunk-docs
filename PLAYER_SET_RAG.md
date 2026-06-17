# Player Set RAG

This file is handoff context for Codex agents working on the `player_set` character editor.

## Current Scope

- Project root: `/web/nicechunk`
- Editor URL on Vite dev server: `http://127.0.0.1:5173/player_set/`
- Main editor files:
  - `player_set/index.html`
  - `player_set/style.css`
  - `player_set/player.js`
- The editor creates Minecraft-style characters entirely from code-generated cuboids.
- No external images, texture files, model files, preset resource IDs, or off-chain assets should be required to restore a character.
- Browser/client-side code may perform heavy decode/expand work. On-chain data should be minimized aggressively.

## User Requirements

- Character data should be stored fully on-chain.
- Chain data should be as small as possible.
- Browser can decode compact chain data back into JSON/runtime structures.
- Color data should not store repeated `#rrggbb` strings.
- A game-side/client-side palette or algorithm is acceptable for compression.
- Character renderer should restore the model from code/data alone.
- Editor must allow detailed cuboid parameter editing and per-face pixel painting.
- The default character currently includes the main game's static avatar details as ordinary cuboid parts: backpack, wristwatch, collar pieces, knuckles, pant stripes, and boot lips. These are included in `SGP3`; equipped tools/held blocks are not part of the chain character.

## Editor UI

The editor layout is:

- Left preview pane:
  - Three.js character preview canvas.
  - Reset view button.
  - Hidden left drawer for role code.
  - Drawer opens with the character code button and slides from the left over the preview.
  - Drawer background is 60% transparent.
- Right settings pane:
  - Select cuboid part.
  - Edit name, base color, position, size, rotation.
  - Add, duplicate, delete, reset parts.
  - Per-face texture editor.

The code drawer has a mode switch:

- Default mode: `SGP3:` chain data.
- The view JSON button switches to readable compact JSON.
- The view chain data button switches back to chain data.
- `#byteSize` follows the current display mode.

Smoke test result at time of writing:

- Default character `SGP3` chain data: about `41 bytes`.
- Equivalent compact JSON: about `2785 bytes`.
- `npm run build` passed.

## Runtime Character Shape

Inside the editor, the mutable character object uses this structure:

```js
{
  v: 1,
  unit: 100,
  boxes: [
    {
      n: "head",
      c: "#c99061",
      p: [0, 245, 0],
      s: [86, 86, 86],
      r: [0, 0, 0],
      t: {
        front: {
          w: 9,
          h: 9,
          p: ["#c99061", "..."]
        }
      }
    }
  ]
}
```

Fields:

- `v`: runtime format version.
- `unit`: coordinate scale. Current value is `100`; positions/sizes divide by 100 for Three.js units.
- `boxes`: ordered cuboid list.
- `n`: editor/display name. Not stored in `SGP3` chain data.
- `c`: base color.
- `p`: position `[x, y, z]` as integer units.
- `s`: size `[w, h, d]` as integer units.
- `r`: rotation `[rx, ry, rz]` in degrees.
- `t`: optional per-face texture map.

Face names:

- `front`
- `back`
- `left`
- `right`
- `top`
- `bottom`

Important orientation detail:

- The character's face is semantic `front`.
- Existing face details such as eyes/mouth are on negative Z.
- Three.js `BoxGeometry` material order is handled by `threeMaterialFaces()`.
- Current mapping is:

```js
["right", "left", "top", "bottom", "back", "front"]
```

This maps semantic `front` to the negative-Z material slot.

## Key Functions

In `player_set/player.js`:

- `writeCode()`
  - Updates `#chainCode` and `#byteSize`.
  - Shows either `SGP3` chain data or compact JSON depending on `dataMode`.
- `toCompactJson(source)`
  - Converts the editor object into the readable JSON display format.
- `encodeCharacter(source)`
  - Converts the editor object into `SGP3:` chain data.
- `decodeCharacter(code)`
  - Converts `SGP3:` chain data back into runtime character JSON.
- `chainPalette`
  - Fixed 32-color client-side palette.
  - Chain data stores 5-bit palette indexes, not RGB strings.
- `nearestPaletteIndex(color)`
  - Maps arbitrary editor colors to the nearest palette entry.
  - This makes chain data smaller but means exact arbitrary RGB colors are not preserved in `SGP3`.
- `createBitWriter()` / `createBitReader()`
  - Bit-level encoder/decoder used by `SGP3`.
- `writePackedRuns()` / `readPackedRuns()`
  - Per-face texture RLE.
- `faceGridSize(part, face)`
  - Derives texture grid size from cuboid dimensions.
  - Because dimensions are derivable, `SGP3` does not store texture width/height.
- `createMaterials(part)`
  - Builds Three.js materials for solid or painted faces.
- `createCanvasTexture(tex)`
  - Creates nearest-filter pixel textures from generated canvas data.

## SGP3 Chain Format

`SGP3` is a base64url-encoded bitstream:

```text
SGP3:<base64url bitstream>
```

It is intentionally not JSON.

Header:

- No magic bytes inside the payload.
- Prefix string `SGP3:` identifies the format.

Top-level:

- Box count: 6 bits.

Per box:

- Exact preset flag: 1 bit.
  - If true, preset index: 6 bits.
  - The preset restores name, color, position, size, and rotation.
- If not exact preset, geometry preset flag: 1 bit.
  - If true, preset index: 6 bits, then color/texture overrides.
  - If false, raw/custom geometry is stored.
- Color:
  - Same-as-previous color flag: 1 bit.
  - Base color palette index: 5 bits, only when the color changed.
- Raw/custom position:
  - Dictionary flag: 1 bit.
  - Dictionary index: 6 bits, when position matches the stable SGP3 position dictionary.
  - Otherwise:
  - `x + 256`: 10 bits.
  - `y + 256`: 10 bits.
  - `z + 256`: 10 bits.
- Raw/custom size:
  - Dictionary flag: 1 bit.
  - Dictionary index: 6 bits, when size matches the stable SGP3 size dictionary.
  - Otherwise:
  - `w`: 8 bits.
  - `h`: 8 bits.
  - `d`: 8 bits.
- Raw/custom rotation:
  - Rotation-present flag: 1 bit.
  - Rotation values are omitted when all three axes are `0`.
  - `rx + 180`: 9 bits.
  - `ry + 180`: 9 bits.
  - `rz + 180`: 9 bits.
- Texture-present flag: 1 bit.
- Texture face mask: 6 bits, using `threeMaterialFaces()` order, only when any face is textured.

Per textured face:

- Texture width/height are not stored.
- Decoder derives them with `faceGridSize(part, face)`.
- RLE run count minus 1: 8 bits.
- Each run:
  - Length minus 1: 4 bits. Max run length is 16 cells.
  - Color palette index: 5 bits.

Approximate default geometry cost:

- A default unchanged box costs `7 bits`: exact preset flag plus a 6-bit preset index.
- Current 46-box default character raw chain bytes currently measure around `41 bytes`.
- Boxes that do not match SGP3 dictionaries fall back to raw position/size encoding, so arbitrary editor geometry still works.

Tradeoffs:

- Very compact.
- Browser can reconstruct JSON and render.
- Arbitrary RGB colors are quantized to `chainPalette`.
- Exact/geometry preset boxes restore preset names; fully custom boxes restore names as `part_0`, `part_1`, etc.
- `unit` is fixed to `100` in the decoder to avoid storing it.
- SGP3 dictionary contents are format constants; changing them would break old SGP3 payloads.
- SGP3 no longer keeps SGP2 or older SGP3 decode compatibility.

## Texture Compression Strategy

Editor storage:

- Textures are editable as full color arrays in JSON-like runtime state.
- Each cell currently stores a color string internally for simplicity.

Chain storage:

- Color strings are converted to 5-bit palette indexes.
- Repeated consecutive base colors are inherited from the previous box.
- Texture cells are RLE-compressed.
- Large single-color faces compress especially well.
- Scattered noise-like pixel art will compress poorly compared with solid regions.

Better future compression options:

- Delta encode boxes from a skeleton template, if the game rules allow a built-in algorithmic skeleton.
- Store only edited cells instead of full face RLE when a face has very sparse paint.
- Add mirror flags for symmetric limbs/faces.
- Add procedural detail commands such as stripe, border, hairline, sleeve band, eye pair, mouth, instead of painting every cell.
- Add a tiny per-character local palette only when colors cannot map well to `chainPalette`.
- Use a dictionary of common cuboid size/position deltas generated by the client algorithm, but avoid external asset IDs if strict full on-chain restoration is required.

## Current Design Constraint To Preserve

Do not move data into off-chain assets. It is acceptable to move decode/render algorithms into the browser/game code, but the chain payload must be enough to reconstruct the character when combined with public deterministic client code.

When optimizing, prefer:

- Chain payload smaller.
- Decoder/client code larger is acceptable.
- Editor runtime JSON can stay readable and convenient.
- Avoid changing the visible editor workflow unless requested.

## Verification Commands

Build:

```bash
npm run build
```

Check dev server:

```bash
ss -ltnp | grep ':5173' || true
```

Open editor:

```text
http://127.0.0.1:5173/player_set/
```

Playwright smoke check pattern:

- Open `/player_set/`.
- Click `#toggleCode`.
- Confirm `#chainCode` starts with `SGP3:`.
- Click `#toggleDataMode`.
- Confirm `#chainCode` starts with JSON `{`.
- Click `#toggleDataMode` again.
- Confirm chain output is restored.

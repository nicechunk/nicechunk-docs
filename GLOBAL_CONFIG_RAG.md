# Nicechunk Core GlobalConfig RAG

## Current Status

This document records the current Nicechunk global configuration design for later contract work.

Deployment is intentionally paused.

Reason:

```text
Implement and review the resource contract first.
Then finalize and deploy Nicechunk Core GlobalConfig.
```

Current implementation state:

```text
Program name: nicechunk_core
Implementation style: native Solana program
Anchor dependency: removed
Deployment status: not deployed
Target network: Solana mainnet-beta
Upgrade policy goal: deploy with final / closed upgrade authority
```

Program id:

```text
9EhMCRYMJej1F21KzaA5Zao3khGGc5aJbDGbnxaogQHu
```

GlobalConfig PDA:

```text
Seed: ["global-config"]
Address: 46bTKGThh96ChxJEmcKz6GvudGi3d7YDiAFtVhKb2Y5f
```

---

## Fairness Goal

Nicechunk Core is intended to be the immutable world-law program.

The fairness model is:

```text
No admin account.
No pause instruction.
No withdraw instruction.
No update_config instruction.
No mutable gameplay parameters.
No initializer-provided genesis values.
Only one instruction: initialize GlobalConfig once.
```

Genesis values are compiled into the native Solana program as constants.

The initializer only pays rent and transaction fees. The initializer does not choose config values and is not stored as an authority.

After deployment, the intended production action is:

```text
Close the program upgrade authority immediately.
```

Once upgrade authority is closed:

```text
Program code becomes immutable.
GlobalConfig data becomes immutable by program design.
Future gameplay programs must bind to this fixed GlobalConfig.
```

---

## Why Native Solana

The first Anchor version was functional but too heavy for the fairness narrative.

Measured Anchor version:

```text
Program size: 265,392 bytes
Program rent-exempt cost: about 1.848 SOL
```

Current native version:

```text
Program size: 79,072 bytes
Program rent-exempt cost: about 0.551232 SOL
GlobalConfig account size: 293 bytes
GlobalConfig rent-exempt cost: about 0.00293016 SOL
```

Current native SBF hash:

```text
3de67f68460d0341552d59b24a45eb63b842cdb4bf5328fc91b6491ed9c3cd86
```

Generated config JSON hash:

```text
e1894808d51ebdad47061d8bfddc0a81341c78d70159a5b958f0a47a0e4671d6
```

Native program narrative:

```text
Minimal native Solana program.
No framework magic.
No admin.
No mutable config.
One-time genesis initialization.
Closed upgrade authority after deployment.
```

---

## Instruction Surface

The native program has exactly one instruction:

```text
Instruction data: [0]
Meaning: initialize_global_config
```

Accounts:

```text
0. payer
   signer
   writable
   pays rent and transaction fees only

1. global_config
   writable
   PDA derived from ["global-config"]

2. nck_mint
   readonly
   must be DCoNyDmQC4kKmQeB7GnwjZuMEvAjjqFYzmnTjySPifEK

3. system_program
   readonly
   must be 11111111111111111111111111111111
```

There are no instruction args for config values.

Reason:

```text
The initializer must not be able to choose or alter genesis rules.
```

---

## NCK Binding

NCK mint:

```text
DCoNyDmQC4kKmQeB7GnwjZuMEvAjjqFYzmnTjySPifEK
```

The program checks:

```text
Mint owner is SPL Token program.
Decimals = 6.
Supply = 1,000,000,000,000,000 base units.
Mint authority is closed.
Freeze authority is closed.
```

Meaning:

```text
1 NCK = 1,000,000 base units.
Total supply = 1,000,000,000 NCK.
NCK cannot be minted more through the canonical SPL mint authority.
NCK cannot be frozen through the canonical SPL freeze authority.
```

---

## Fixed Config Values

Token:

```text
nck_decimals = 6
nck_supply = 1,000,000,000,000,000 base units
nck_mint = DCoNyDmQC4kKmQeB7GnwjZuMEvAjjqFYzmnTjySPifEK
```

Wallet:

```text
development_wallet = CtPV2vmqNNwUSfMu5nz58ZtMPy6ZvxL4LyNdPHVW7WvF
```

This wallet is not an admin.

It is only the fixed recipient for the development income share in future programs that choose to follow this config.

World identity:

```text
world_id = 1
world_seed = sha256("share-the-world")
world_seed_hex = ba1a9d446157c537af58fc5ff53a28422cdc6ab3dd88daa24095db3bd9c0f041
```

Config hashes:

```text
terrain_config_hash = 66f03b5cf732cef95bde45c9beef7270f885a19147148916eb31bf20a9022108
resource_rule_hash = 7220437df14645bd0c1b4b542b921a457bd85106cd2375efeb0bcc857fca8a3a
client_world_config_hash = 153c04ea4a3fddf18dfd60ee0702830bcc3b5d92c5b3cb12932de16ed3fe9f87
```

Entry prices:

```text
starter_pack_price_lamports = 100,000,000      // 0.1 SOL
genesis_pass_price_lamports = 1,000,000,000    // 1 SOL
starter_pack_max_per_wallet = 1
genesis_pass_max_per_wallet = 1
genesis_pass_max_supply = 10,000
```

Guardian economics:

```text
guardian_stake_amount = 100,000,000,000 base units
guardian_stake_amount_nck = 100,000 NCK
guardian_tax_bps = 10       // 0.1%
protocol_fee_bps = 50       // 0.5%
market_fee_bps = 100        // 1%
slash_bps = 3000            // 30%
```

SOL income split:

```text
sol_to_liquidity_bps = 5000      // 50%
sol_to_reward_bps = 3000         // 30%
sol_to_development_bps = 2000    // 20%
```

World validation constants:

```text
chunk_size = 16
section_height = 16
min_build_y = -32
max_build_y = 256
max_terrain_height = 160
sea_level = 2
guardian_region_size_chunks = 64
guardian_realtime_radius_chunks = 16
mine_cooldown_slots = 2
```

Important note:

```text
sea_level = 2 is extracted from the current website client code.
It is not the earlier design value of 48.
```

---

## GlobalConfig Binary Layout

The native account is a compact binary account.

Total length:

```text
293 bytes
```

Layout:

```text
0..8      magic                         "NCKCFG01"
8..10     version                       u16
10..11    global_config_bump            u8
11..12    sealed                        u8, 1 = true
12..44    nck_mint                      Pubkey
44..45    nck_decimals                  u8
45..53    nck_supply                    u64
53..85    development_wallet            Pubkey
85..87    world_id                      u16
87..119   world_seed                    [u8; 32]
119..151  terrain_config_hash           [u8; 32]
151..183  resource_rule_hash            [u8; 32]
183..215  client_world_config_hash      [u8; 32]
215..223  starter_pack_price_lamports   u64
223..231  genesis_pass_price_lamports   u64
231..232  starter_pack_max_per_wallet   u8
232..233  genesis_pass_max_per_wallet   u8
233..237  genesis_pass_max_supply       u32
237..245  guardian_stake_amount         u64
245..247  guardian_tax_bps              u16
247..249  protocol_fee_bps              u16
249..251  market_fee_bps                u16
251..253  slash_bps                     u16
253..255  sol_to_liquidity_bps          u16
255..257  sol_to_reward_bps             u16
257..259  sol_to_development_bps        u16
259..261  chunk_size                    u16
261..263  section_height                u16
263..265  min_build_y                   i16
265..267  max_build_y                   i16
267..269  max_terrain_height            i16
269..271  sea_level                     i16
271..273  guardian_region_size_chunks   u16
273..275  guardian_realtime_radius      u16
275..277  mine_cooldown_slots           u16
277..285  genesis_slot                  u64
285..293  created_at                    i64
```

All integers are little-endian.

---

## Known Deployment Blocker To Fix

Before deploying, fix the GlobalConfig pre-funding / PDA DoS edge case.

Current risk:

```text
The GlobalConfig PDA is public and deterministic.
If someone transfers lamports to it before initialization,
the current implementation may reject initialization because lamports > 0.
```

Required fix:

```text
If the PDA is already owned by this program and contains a valid magic header,
reject as already initialized.

If the PDA is system-owned, has zero data length, and only has lamports,
allow initialization by allocating data, assigning owner to this program,
and topping up rent if needed.

Do not reject merely because lamports > 0.
```

This should be fixed before mainnet deployment.

---

## Relationship To Resource Contract

Resource contract work should happen before finalizing and deploying GlobalConfig.

Reason:

```text
The current resource_rule_hash is still based on placeholder rules.
If resource discovery rules become concrete before deployment,
the final resource rule hash should be updated and compiled into nicechunk_core.
```

Current resource hash source:

```text
config/resource_rules_v1.json
```

Current resource design principle:

```text
Valuable resources must not be fully predictable from public world_seed alone.
```

Future resource contract should bind to GlobalConfig by requiring:

```text
GlobalConfig PDA address = ["global-config"] under nicechunk_core program id.
GlobalConfig magic = "NCKCFG01".
GlobalConfig sealed = 1.
GlobalConfig world_id = expected world.
GlobalConfig resource_rule_hash = expected hash or read as root commitment.
```

Resource PDAs should include the GlobalConfig address or world id in their seeds:

```text
["resource-def", global_config, resource_id]
["resource-node", global_config, chunk_x, chunk_z, local_x, y, local_z]
["resource-claim", global_config, player, resource_nonce]
```

Recommended rule:

```text
Do not derive resource state only from resource_id or chunk coordinates.
Always bind resource state to GlobalConfig so future worlds or v2 configs cannot collide.
```

---

## Relationship To Future Programs

Future programs should treat GlobalConfig as a read-only root of trust.

Examples:

```text
nicechunk_resource
nicechunk_item
nicechunk_player
nicechunk_inventory
nicechunk_pack
nicechunk_guardian
nicechunk_market
```

Each future program should:

```text
Read GlobalConfig.
Verify magic/version/sealed.
Verify the expected program id and PDA.
Bind all important PDA seeds to GlobalConfig.
Avoid mutating GlobalConfig.
Avoid relying on a mutable website URL.
```

Recommended PDA pattern:

```text
["player-state", global_config, player_wallet]
["item-def", global_config, item_id]
["inventory", global_config, player_wallet]
["chunk", global_config, chunk_x, chunk_z]
["chunk-section", chunk, y_band]
["guardian-region", global_config, region_x, region_z]
```

---

## Deployment Commands Later

Do not deploy until the resource contract and PDA DoS fix are ready.

Expected final deploy command:

```bash
solana program deploy target/deploy/nicechunk_core.so \
  --program-id target/deploy/nicechunk_core-keypair.json \
  --keypair /path/to/mainnet-deployer.json \
  --url https://api.mainnet-beta.solana.com \
  --final
```

Then initialize:

```bash
npm run initialize:global-config
```

Verify:

```bash
solana program show 9EhMCRYMJej1F21KzaA5Zao3khGGc5aJbDGbnxaogQHu \
  --url https://api.mainnet-beta.solana.com

solana account 46bTKGThh96ChxJEmcKz6GvudGi3d7YDiAFtVhKb2Y5f \
  --url https://api.mainnet-beta.solana.com
```

Expected final state:

```text
Program exists.
Program upgrade authority: none.
GlobalConfig owner: nicechunk_core program id.
GlobalConfig data length: 293.
GlobalConfig magic: NCKCFG01.
```

---

## Server Sync Rule

Do not sync Solana development artifacts to the production web server.

Already excluded by deployment rsync rules:

```text
/.anchor/
/Anchor.toml
/Cargo.toml
/Cargo.lock
/programs/
/tests/
/target/
/migrations/
/config/
/scripts/generate-global-config.ts
/scripts/initialize-global-config.ts
/scripts/generated-global-config*.json
```

Production web deployment should continue to sync only the built web app needed by `https://nicechunk.com`.

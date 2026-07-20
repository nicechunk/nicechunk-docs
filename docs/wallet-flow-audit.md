# Wallet Flow Audit

NiceChunk includes a lightweight wallet flow audit for built browser pages.

This audit does not use a real wallet extension, user-provided private key, seed phrase, live funds, or live wallet approval. It uses Playwright to verify public wallet UI behavior, injects a minimal mock Solana provider where a deterministic connected-wallet state is needed, and lets the built login page generate one ephemeral NiceChunk Game Wallet inside an isolated browser context. The generated secret never enters the JSON report and is discarded with that context.

## Command

Run after a production build:

```bash
npm run build
npm run audit:wallet-flows
```

`npm run validate:release` runs this audit after the browser smoke audit.

## Coverage

The audit opens built routes from `dist/` and verifies:

- `/login/` with no injected wallet: mobile wallet app links are shown, the Phantom install link is present, and the status text reports that no injected wallet was detected.
- `/login/` with a mock Phantom provider and a deterministic missing-Appearance account response: the Phantom wallet button appears, connect persists the mock public address in local storage, and the current login flow advances to `/player_creat/`.
- `/login/` with no injected wallet and deterministic mocked RPC responses: creating a built-in Game Wallet writes its address, Base58 secret, creation time, and source fields; the displayed address and secret match that browser record; backup confirmation is required; `99,999,999` lamports remains unbound; exactly `100,000,000` lamports can bind and advance to `/player_creat/`; player-create disconnect clears the wallet session without deleting the separate Game Wallet record; and the created secret is shown again after returning to login.
- `/guardian/` with no injected wallet: the Connect Wallet action reports the no-wallet guard and does not change the wallet status away from disconnected.

The JSON report is written to `.cache/wallet-flow-report.json`. The cache directory is intentionally ignored by git.

## Boundaries

This audit proves that NiceChunk's public wallet UI states, no-wallet guards, injected-provider happy path, and the listed built-in Game Wallet browser branches remain wired in the production build. The local-wallet flow uses mocked `getBalance` and null `getAccountInfo` responses; it records only boolean checks, lengths, thresholds, and call counts, never the generated secret.

It does not prove real Phantom, Solflare, Backpack, mobile deep-link, extension approval, wallet network switching, live RPC correctness, live balances, funding, transaction signing, transaction submission, confirmation, or recovery from a backup. It does not prove that browser storage is encrypted or isolated from same-origin scripts, that a player really saved the copied secret, that the generated key is safe to fund, that 0.1 SOL is a spending cap or sufficient for future actions, or that clearing a wallet session securely deletes a key. It also does not cover local-wallet import formats or malformed-key rejection. The mocked account reads prove only the browser branches that follow the supplied deterministic responses. Stronger security and chain claims still require dedicated tests and evidence.

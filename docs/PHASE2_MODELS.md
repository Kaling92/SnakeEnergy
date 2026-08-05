# Phase 2 Canonical Models (Implemented)

This document records the canonical model layer introduced in Phase 2 and the temporary compatibility policy used to avoid frontend/API regression.

## Canonical Models

- User
  - username (unique, indexed)
  - passwordHash (required)
  - createdAt (default now)
- Wallet
  - userId (indexed)
  - publicAddress (unique, indexed, hex-like `0x...` format)
  - encryptedPrivateKey (required)
  - seedPhrase (required)
  - status (`ACTIVE` or `LOCKED`)
- Asset
  - walletId (indexed)
  - tokenSymbol (`BTC`, `ETH`, `BNB`, `SOL`)
  - balance (`Decimal128`)
  - availableBalance (`Decimal128`)
  - lockedBalance (`Decimal128`)
  - chainId, network
  - contractAddress, decimals
  - lastSyncedAt, source, metadata
  - updatedAt (default now)
  - unique compound index (`walletId`, `tokenSymbol`)
- Transaction
  - txHash (unique)
  - senderAddress (indexed)
  - receiverAddress (indexed)
  - chainId, network
  - amount (`Decimal128`)
  - feeAmount (`Decimal128`), feeToken
  - nonce, blockNumber, confirmations
  - tokenSymbol
  - transactionType (`SEND`, `RECEIVE`, `SWAP`)
  - status (`SUCCESS`, `FAILED`, `PENDING`)
  - failureReason
  - idempotencyKey (user-scoped unique sparse index)
  - metadata (memo, sourcePage, clientVersion)
  - timestamp
  - createdAt, updatedAt

## Compatibility Policy (Temporary)

To keep current controllers running in this phase, compatibility fields/mappings remain in place:

- User: keeps `password`, `email`, `fullName`, and settings fields used by current controllers.
- Wallet: keeps `address`, `blockchain`, `label`, and `balances` for existing controller behavior.
- Transaction: maps legacy fields (`fromAddress`, `toAddress`, `cryptoSymbol`, legacy statuses) into canonical fields.
- Transactions model duplication removed by re-exporting canonical Transaction model from legacy file.

## Notes

- Canonical precision is implemented in `Asset.balance` and `Transaction.amount` via `Decimal128`.
- Canonical precision is implemented in `Asset.balance`, `Asset.availableBalance`, `Asset.lockedBalance`, `Transaction.amount`, and `Transaction.feeAmount` via `Decimal128`.
- Legacy wallet balance array remains numeric during migration to prevent arithmetic regressions in current controllers.
- DAO/service migration in next phases will progressively consume only canonical fields.

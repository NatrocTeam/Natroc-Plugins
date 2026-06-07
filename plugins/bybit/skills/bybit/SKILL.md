---
name: bybit
description: Bybit skill should be used when the user wants to trade or manage assets on Bybit — checking balances or positions, placing or managing spot, derivatives, or options orders, copy trading, trading bots, Earn products, fiat/P2P, on-chain Alpha tokens, or TradFi (xStocks & commodity perps). It routes each request to the correct Bybit module and enforces global safety and confirmation rules. Requires the `bybit` MCP server with BYBIT_API_KEY and BYBIT_API_SECRET.
---

# Bybit Trading

Orchestrates Bybit exchange operations through the `bybit` MCP server. This skill is the entry point: it enforces global safety rules and routes each request to the correct on-demand command module. Every module assumes these global rules are in effect.

## Prerequisites

- The `bybit` MCP server must be configured (see the plugin `.mcp.json`).
- `BYBIT_API_KEY` and `BYBIT_API_SECRET` must be set in the environment. Most read-only requests still require a valid key.
- All requests use the Bybit V5 API. The active environment (mainnet vs testnet/demo) is determined by the API key in use — confirm which one before any write operation.

## Global Rules (apply to every module)

These rules govern all modules. Individual modules may add their own (e.g. Earn amount precision and `E8` handling).

1. **Confirm before any write.** Read-only queries (balances, prices, positions, history) may run directly. Any **state-changing or fund-moving** action — placing/amending/cancelling orders, transfers, deposits/redemptions, following a leader, creating bots, signing agreements — MUST be confirmed by the user first.
2. **Structured Operation Confirmation flow (Mainnet).** Before submitting a write on mainnet, show a confirmation summary: action, category, symbol/product, side, quantity, estimated notional / required margin, and target account. Do not submit until the user explicitly confirms.
3. **Disambiguate category.** A symbol like `BTCUSDT` exists in both spot and derivatives. Never assume — confirm spot vs linear / inverse / option with the user.
4. **Quote before execute.** Where a quote step exists (on-chain Alpha, conversions, small-balance convert), never skip it and never fabricate quote data, `quoteData`, or correcting codes. Show the quote and get confirmation.
5. **Respect API key permissions.** Many operations need specific permissions (e.g. copy trading needs "Contract — Orders & Positions"). If an action fails with a permission-like error, explain which permission is missing.
6. **Never fabricate.** Do not invent endpoints, parameters, or error-code meanings. If something is not covered by a module, consult the official Bybit V5 docs (https://bybit-exchange.github.io/docs/v5/) and cite the URL. If it is undocumented, say so.
7. **Surface risk.** For large or high-leverage orders and high-risk products, warn the user before proceeding (each trading module defines its own thresholds).

## How to Handle a Request

1. Identify the user's intent and map it to a module below.
2. Load that module's command on demand (it lives under the `bybit` namespace, e.g. `/bybit:derivatives`) to get the exact endpoints, parameters, enums, and module-specific rules.
3. Apply the global rules above plus the module's own rules.
4. Call the `bybit` MCP server with the documented Bybit V5 endpoint.

If a request spans multiple modules (e.g. check balance, then open a position), load each module as needed.

## Module Routing

| Intent                                                               | Module                |
| -------------------------------------------------------------------- | --------------------- |
| Balance, transfers, fees, asset & account management                 | `/bybit:account`      |
| Spot trading & spot margin                                           | `/bybit:spot`         |
| Perpetuals / futures: positions, leverage, TP/SL, conditional orders | `/bybit:derivatives`  |
| Prices, klines, order book, funding, tickers (public data)           | `/bybit:market`       |
| Algo / strategy orders: TWAP, iceberg, POV                           | `/bybit:strategy`     |
| Grid / DCA / martingale / combo bots                                 | `/bybit:trading-bot`  |
| Copy trading: discover leaders, follow, manage                       | `/bybit:copy-trading` |
| Earn: savings, fixed term, dual asset, liquidity mining, PWM         | `/bybit:earn`         |
| Fiat convert (OTC) & P2P                                             | `/bybit:fiat`         |
| On-chain Alpha token discovery & swaps                               | `/bybit:alpha-trade`  |
| TradFi: xStocks, equity & commodity perpetuals                       | `/bybit:tradfi`       |
| WebSocket, crypto / institutional loans, RFQ, spread, broker         | `/bybit:advanced`     |

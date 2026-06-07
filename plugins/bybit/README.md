# Bybit Plugin

Trade and manage your Bybit account directly from Claude Code or Codex. This
plugin connects to the Bybit exchange through the official Bybit MCP server and
exposes the Bybit V5 API — spot, derivatives, options, copy trading, trading
bots, Earn, fiat/P2P, on-chain Alpha tokens, and TradFi — behind a single
orchestrating skill with built-in safety rules.

## What's Included

- **MCP Server** — [`bybit-official-trading-server`](https://www.npmjs.com/package/bybit-official-trading-server), the official Bybit trading server, wired through `.mcp.json`.
- **Skill** — `bybit`, the orchestrator that enforces global safety/confirmation rules and routes each request to the right module.
- **Commands** — 12 on-demand reference modules under the `bybit` namespace (`/bybit:account`, `/bybit:spot`, …) that document the V5 API surface.

## Installation

### Claude Code CLI

- Add marketplace

  ```
  claude plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin

  ```
  claude plugin install bybit@natroc-plugins
  ```

### Claude Desktop & Claude Web (claude.ai)

Open `Customize` in the left panel and click `+` icon, then select `Create
plugin` > `Add marketplace`.

- Add marketplace from a repository

  ```
  NatrocTeam/Natroc-Plugins
  ```

### Codex CLI

- Add marketplace

  ```
  codex plugin marketplace add NatrocTeam/Natroc-Plugins
  ```

- Install Plugin
  ```
  codex plugin add bybit@natroc-plugins
  ```

### Codex Desktop

- Add marketplace

  Source

  ```
  NatrocTeam/Natroc-Plugins
  ```

  Git ref (optional)

  ```
  main
  ```

## Configuration

The MCP server needs Bybit API credentials, provided as environment variables:

| Variable           | Description           |
| ------------------ | --------------------- |
| `BYBIT_API_KEY`    | Your Bybit API key    |
| `BYBIT_API_SECRET` | Your Bybit API secret |

Create an API key in your Bybit account (**API Management**) and grant only the permissions you need (e.g. _Contract — Orders & Positions_ for derivatives and copy trading). Set them in your shell or agent environment before use:

```bash
export BYBIT_API_KEY="your-api-key"
export BYBIT_API_SECRET="your-api-secret"
```

> **Security**: never commit your keys. Prefer a read-only key for query-only workflows and a key scoped to the minimum permissions for trading.
>
> **Mainnet vs Testnet**: the environment is determined by the key you use (mainnet keys vs testnet keys). Confirm which one you are on before placing real orders. Bybit also offers demo trading.

The MCP server is pinned to the latest release in `.mcp.json`:

```json
{
  "mcpServers": {
    "bybit": {
      "command": "npx",
      "args": ["-y", "bybit-official-trading-server@latest"],
      "env": {
        "BYBIT_API_KEY": "${BYBIT_API_KEY}",
        "BYBIT_API_SECRET": "${BYBIT_API_SECRET}"
      }
    }
  }
}
```

## Modules

Each module is a namespaced command loaded on demand by the `bybit` skill:

| Command               | Covers                                                             |
| --------------------- | ------------------------------------------------------------------ |
| `/bybit:account`      | Balance, transfers, fees, asset & account management               |
| `/bybit:spot`         | Spot trading & spot margin                                         |
| `/bybit:derivatives`  | Perpetuals/futures: positions, leverage, TP/SL, conditional orders |
| `/bybit:market`       | Prices, klines, order book, funding, tickers (public data)         |
| `/bybit:strategy`     | Algo/strategy orders: TWAP, iceberg, POV                           |
| `/bybit:trading-bot`  | Grid, DCA, martingale & combo bots                                 |
| `/bybit:copy-trading` | Discover leaders, follow & manage copy trading                     |
| `/bybit:earn`         | Savings, fixed term, dual asset, liquidity mining, PWM             |
| `/bybit:fiat`         | Fiat convert (OTC) & P2P                                           |
| `/bybit:alpha-trade`  | On-chain Alpha token discovery & swaps                             |
| `/bybit:tradfi`       | xStocks, equity & commodity perpetuals                             |
| `/bybit:advanced`     | WebSocket, crypto/institutional loans, RFQ, spread, broker         |

## Usage Examples

The plugin works from natural language — the skill picks the right module:

- "Check my Bybit wallet balance"
- "Buy 500 USDT of BTC on spot"
- "Open a BTCUSDT long with 10x leverage and set take profit at 90000"
- "What's the current BTC funding rate?"
- "Set up a grid bot for ETHUSDT"
- "Find me a copy trading leader and follow with 100 USDT"

## Safety

The `bybit` skill enforces global rules before any state-changing action:

- Read-only queries run directly; **orders, transfers, and other fund-moving actions require explicit confirmation**.
- On mainnet, a Structured Operation Confirmation summary is shown before submitting.
- Category (spot vs derivatives) is disambiguated, quotes are never skipped or fabricated, and large/high-leverage orders trigger a risk warning.

## Plugin Structure

```text
bybit/
├── .codex-plugin/plugin.json
├── .claude-plugin/plugin.json
├── .mcp.json
├── assets/
├── commands/
└── skills/
```

## More Information

- [Bybit](https://www.bybit.com/)
- [Bybit V5 API docs](https://bybit-exchange.github.io/docs/v5/)
- [bybit-official-trading-server on npm](https://www.npmjs.com/package/bybit-official-trading-server)

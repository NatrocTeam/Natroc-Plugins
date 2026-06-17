# Midtrans Plugin

A plugin for integrating the [Midtrans](https://midtrans.com) payment gateway into backend applications. Provides AI-assisted development skills across three languages - Node.js, PHP, and Python - covering the full Midtrans product suite from one-click Snap popups to the SNAP BI open API standard.

## Features

- **Snap API** - pre-built payment UI (popup or redirect) with a single token
- **Core API** - full control over the payment form and checkout experience
- **SnapBi** (Node.js / PHP) - Bank Indonesia SNAP standard for Direct Debit (Gopay, Dana, Shopeepay), Virtual Account bank transfer, and Qris
- **Iris Disbursement** (Node.js) - send payouts to Indonesian bank accounts
- **Subscription** - recurring payments via saved credit cards or linked Gopay accounts
- **Tokenization** - link/unlink Gopay accounts for subscription use
- **HTTP Notification Handler** - server-side webhook verification for every language

## Skills

| Skill             | Language      | Package                            | Key Capabilities                                                                 |
| ----------------- | ------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| `midtrans-nodejs` | Node.js (14+) | `midtrans-client` (npm)            | Snap, Core API, SnapBi, Iris, Subscription, Tokenization                         |
| `midtrans-php`    | PHP (5.4+)    | `midtrans/midtrans-php` (Composer) | Snap, Core API, SnapBi, Subscription, Tokenization                               |
| `midtrans-python` | Python (3.5+) | `midtransclient` (PyPI)            | Snap, Core API, Subscription, Tokenization + direct REST guide for SnapBi & Iris |

## Quick Start

Choose a skill based on your backend language. The agent will guide you through:

1. **Configuration** - `serverKey`, `clientKey`, and `isProduction` (sandbox/production toggle)
2. **Creating a transaction** - build the parameter object (transaction details, customer info, items)
3. **Frontend integration** - pass the Snap token to `snap.js` or build a custom form with Core API
4. **Handling notifications** - set up the HTTP webhook endpoint to verify transaction status

### Example (Node.js)

```js
const midtransClient = require("midtrans-client");

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});

const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: "ORDER-" + Date.now(),
    gross_amount: 200000,
  },
  customer_details: {
    first_name: "Budi",
    email: "budi@example.com",
  },
  item_details: [
    { id: "ITEM1", price: 100000, quantity: 2, name: "Product A" },
  ],
});

// Use transaction.token on the frontend with snap.js
// Or redirect to transaction.redirect_url (Snap Redirect)
```

## Documentation

Each skill includes three reference files loaded on demand by the AI:

- **API Endpoints Reference** - full endpoint catalog with method signatures for the target language
- **Gotchas & Edge Cases** - detailed pitfalls (return type differences, required extensions, currency constraints, known SDK quirks)
- **SnapBi Parameters & Signatures** (Node.js / PHP) - RSA-SHA256 access token flow, HMAC-SHA512 transaction signing, webhook verification

The Python skill also includes a **Direct REST Calls** guide for calling SnapBi and Iris APIs via raw HTTP when the Python SDK does not yet bundle those products.

## Platform Support

| Product                           | Node.js | PHP | Python   |
| --------------------------------- | ------- | --- | -------- |
| Snap                              | ✅      | ✅  | ✅       |
| Core API                          | ✅      | ✅  | ✅       |
| SnapBi (Direct Debit / VA / Qris) | ✅      | ✅  | via REST |
| Iris Disbursement                 | ✅      | -   | via REST |
| Subscription                      | ✅      | ✅  | ✅       |
| Tokenization                      | ✅      | ✅  | ✅       |

## License

MIT

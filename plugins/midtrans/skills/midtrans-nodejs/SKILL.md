---
name: midtrans-nodejs
description: >
  Integrate Midtrans payment gateway in Node.js backend applications.
  Covers Snap (popup/redirect), Core API (VT-Direct), Snap BI (Direct
  Debit Gopay/Dana/Shopeepay, VA Bank Transfer, Qris), Iris
  disbursement, subscriptions, and tokenization. Use this skill when
  building or debugging Midtrans payments in Node.js, or when the
  user mentions Midtrans, Snap token, Snap BI, Core API charge,
  payment notification handler, Iris payout, or midtrans-client npm
  package.
license: MIT
compatibility: Requires Node.js 14+, midtrans-client npm package (v1.4.3+), axios
---

# Midtrans Node.js Client

Official Node.js client library for the Midtrans Payment API. Package: `midtrans-client` (npm).

## Quick Start

```bash
npm install midtrans-client
```

```js
const midtransClient = require("midtrans-client");

// Core API instance
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});

// Snap instance
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});
```

All methods return Promises. Use `.then()` / `.catch()` or `async/await`.

## Configuration

`ApiConfig` stores `isProduction`, `serverKey`, `clientKey`. Pass them to the constructor or set later:

```js
snap.apiConfig.set({ serverKey: "YOUR_SERVER_KEY" });
snap.apiConfig.set({ isProduction: true });
snap.apiConfig.isProduction = false;
snap.apiConfig.serverKey = "YOUR_SERVER_KEY";
```

Base URLs are set automatically based on `isProduction`. See [references/base-urls.md](references/base-urls.md).

## Product Decision Guide

| Product           | When to Use                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| **Snap**          | Pre-built payment UI popup on your frontend. Recommended for most merchants. |
| **Snap Redirect** | Customer redirected to Midtrans-hosted payment page.                         |
| **Core API**      | Full control over frontend; build your own payment form.                     |
| **SnapBi**        | SNAP BI open API standard (Bank Indonesia). Direct Debit, VA, Qris.          |
| **Iris**          | Disburse payments to Indonesian bank accounts.                               |
| **Subscription**  | Recurring payments (credit card, gopay).                                     |
| **Tokenization**  | Link gopay account for recurring/subscription use.                           |

**Default recommendation**: Use Snap unless the merchant needs full frontend control.

---

## Snap API

```js
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});
```

### Methods

| Method                                    | Returns                                |
| ----------------------------------------- | -------------------------------------- |
| `createTransaction(parameter)`            | Object with `token` and `redirect_url` |
| `createTransactionToken(parameter)`       | String token                           |
| `createTransactionRedirectUrl(parameter)` | String redirect_url                    |

### Create Transaction

```js
const parameter = {
  transaction_details: {
    order_id: "ORDER-ID-" + Date.now(),
    gross_amount: 200000,
  },
  credit_card: { secure: true },
  customer_details: {
    first_name: "Budi",
    last_name: "Susanto",
    email: "budi@example.com",
    phone: "08123456789",
  },
  item_details: [
    { id: "ITEM1", price: 100000, quantity: 2, name: "Product A" },
  ],
};

const transaction = await snap.createTransaction(parameter);
// transaction.token → use on frontend with snap.js
// transaction.redirect_url → redirect customer here (Snap Redirect)
```

### Frontend (Snap JS)

Snap token from backend is passed to frontend:

```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key="YOUR_CLIENT_KEY"
></script>
<script>
  snap.pay("PUT_TRANSACTION_TOKEN_HERE", {
    onSuccess: (result) => {
      /* handle success */
    },
    onPending: (result) => {
      /* handle pending */
    },
    onError: (result) => {
      /* handle error */
    },
  });
</script>
```

Use `https://app.midtrans.com/snap/snap.js` for production.

---

## Core API

```js
const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: "YOUR_SERVER_KEY",
  clientKey: "YOUR_CLIENT_KEY",
});
```

### Methods

Core payment methods:

| Method                      | Endpoint                      | HTTP |
| --------------------------- | ----------------------------- | ---- |
| `charge(parameter)`         | `/v2/charge`                  | POST |
| `capture(parameter)`        | `/v2/capture`                 | POST |
| `cardRegister(parameter)`   | `/v2/card/register`           | GET  |
| `cardToken(parameter)`      | `/v2/token`                   | GET  |
| `cardPointInquiry(tokenId)` | `/v2/point_inquiry/{tokenId}` | GET  |

Additional methods: `createSubscription()`, `getSubscription()`, `enableSubscription()`, `disableSubscription()`, `updateSubscription()`, `linkPaymentAccount()`, `getPaymentAccount()`, `unlinkPaymentAccount()`.

### Credit Card Charge

```js
const parameter = {
  payment_type: "credit_card",
  transaction_details: {
    order_id: "test-transaction-" + Date.now(),
    gross_amount: 12145,
  },
  credit_card: {
    token_id: "CREDIT_CARD_TOKEN", // obtained from frontend get-token
    authentication: true,
  },
};

const chargeResponse = await coreApi.charge(parameter);
// chargeResponse may contain redirect_url for 3DS authentication
```

---

## SnapBi

SNAP (Standar Nasional Open API Pembayaran) - Bank Indonesia national standard.
Supports Direct Debit (Gopay, Dana, Shopeepay), VA (Bank Transfer), and Qris.

### Configuration

```js
midtransClient.SnapBiConfig.isProduction = false;
midtransClient.SnapBiConfig.snapBiClientId = "YOUR_CLIENT_ID";
midtransClient.SnapBiConfig.snapBiPrivateKey = "YOUR_PRIVATE_KEY";
midtransClient.SnapBiConfig.snapBiClientSecret = "YOUR_CLIENT_SECRET";
midtransClient.SnapBiConfig.snapBiPartnerId = "YOUR_PARTNER_ID";
midtransClient.SnapBiConfig.snapBiChannelId = "YOUR_CHANNEL_ID";
midtransClient.SnapBiConfig.snapBiPublicKey = "YOUR_PUBLIC_KEY"; // for webhook verification
midtransClient.SnapBiConfig.enableLogging = false; // set true for debugging
```

### Chain API Pattern

All SnapBi operations use method chaining:

```js
midtransClient.SnapBi
  .<paymentMethod>()          // directDebit(), va(), qris()
  .withBody(requestBody)
  .withAccessToken(optionalToken)    // reuse existing token
  .withAccessTokenHeader(extraHeaders)
  .withTransactionHeader(extraHeaders)
  .<action>(externalId)             // createPayment, cancel, refund, getStatus
```

All SnapBi config values can be overridden inline per-call via chain methods (withPrivateKey, withClientId, withClientSecret, withPartnerId, withChannelId, withDeviceId, withDebugId, withTimeout).

**Full code examples for Direct Debit, VA, Qris, Get Status/Cancel/Refund, Webhook Verification, and config override**: see [examples/snapbi-payments.md](examples/snapbi-payments.md).

For request/response structures and signature generation details, see [references/snap-bi-params.md](references/snap-bi-params.md).

---

## Iris Disbursement API

Money disbursement to Indonesian bank accounts. See [examples/iris-subscription-tokenization.md](examples/iris-subscription-tokenization.md) for full methods table and code examples.

```js
const iris = new midtransClient.Iris({
  isProduction: false,
  serverKey: "YOUR_API_KEY",
});

// Key operations:
await iris.createBeneficiaries({
  name: "Budi Susanto",
  account: "0611101146",
  bank: "bca",
  alias_name: "budisusantoo",
  email: "budi@example.com",
});
await iris.createPayouts({
  payouts: [
    { beneficiary_name: "budisusantoo", amount: "100000", notes: "Payment" },
  ],
});
await iris.validateBankAccount({ bank: "bca", account: "0611101146" });
```

---

## Subscription API

Recurring payments using saved card tokens or linked gopay accounts. See [examples/iris-subscription-tokenization.md](examples/iris-subscription-tokenization.md) for full parameter structure.

```js
await coreApi.createSubscription(param);
await coreApi.getSubscription(subscriptionId);
await coreApi.enableSubscription(subscriptionId);
await coreApi.disableSubscription(subscriptionId);
await coreApi.updateSubscription(subscriptionId, updateParam);
```

## Tokenization API

Link/unlink gopay account for subscription/recurring use. See [examples/iris-subscription-tokenization.md](examples/iris-subscription-tokenization.md) for full examples.

```js
await coreApi.linkPaymentAccount(param);
await coreApi.getPaymentAccount(accountId);
await coreApi.unlinkPaymentAccount(accountId);
```

---

## Transaction Actions (Shared)

Both Snap and CoreApi instances share the `transaction` object.

```js
const client = new midtransClient.CoreApi({
  /* config */
});
// or: const client = new midtransClient.Snap({ /* config */ });

await client.transaction.status("ORDER_ID_OR_TRANSACTION_ID");
await client.transaction.statusb2b("ORDER_ID");
await client.transaction.approve("ORDER_ID");
await client.transaction.deny("ORDER_ID");
await client.transaction.cancel("ORDER_ID");
await client.transaction.expire("ORDER_ID");
await client.transaction.refund("ORDER_ID", {
  refund_key: "order1-ref1",
  amount: 5000,
  reason: "Item out of stock",
});
await client.transaction.refundDirect("ORDER_ID", {
  refund_key: "order1-ref1",
  amount: 5000,
  reason: "Item out of stock",
});
```

---

## Notification Handler

**IMPORTANT**: Never rely solely on frontend callbacks. Always verify via HTTP notification.

```js
const snap = new midtransClient.Snap({
  /* config */
}); // or CoreApi

// In your Express/HTTP endpoint (POST route):
app.post("/midtrans-notification", async (req, res) => {
  try {
    const statusResponse = await snap.transaction.notification(req.body);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    // --- Status handling template ---
    if (transactionStatus === "capture") {
      if (fraudStatus === "challenge") {
        // TODO: set DB status to 'challenge'
      } else if (fraudStatus === "accept") {
        // TODO: set DB status to 'success'
      }
    } else if (transactionStatus === "settlement") {
      // TODO: set DB status to 'success'
    } else if (transactionStatus === "deny") {
      // ignore - may be retried
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "expire"
    ) {
      // TODO: set DB status to 'failure'
    } else if (transactionStatus === "pending") {
      // TODO: set DB status to 'pending'
    }

    res.status(200).send("OK");
  } catch (e) {
    res.status(500).send("Error");
  }
});
```

---

## Error Handling

All API calls may throw `MidtransError`:

```js
snap
  .createTransaction(parameter)
  .then((res) => {
    /* handle success */
  })
  .catch((e) => {
    e.message; // string error message
    e.httpStatusCode; // HTTP status code: 400, 401, etc.
    e.ApiResponse; // decoded JSON response body
    e.rawHttpClientData; // raw Axios response object
  });
```

---

## Advanced

```js
// Custom HTTP config
snap.httpClient.http_client.defaults.timeout = 2500;
snap.httpClient.http_client.defaults.headers.common["My-Header"] = "value";

// Override/Append Notification URL
snap.httpClient.http_client.defaults.headers.common["X-Override-Notification"] =
  "https://mysite.com/midtrans-notification-handler";
snap.httpClient.http_client.defaults.headers.common["X-Append-Notification"] =
  "https://mysite.com/midtrans-notification-handler";
```

---

## Gotchas

- **Server-side only**: Never use this library on browser/frontend JS. ServerKey will be exposed.
- **Notification over frontend**: Always use HTTP notification webhook to update transaction status. Frontend callbacks can be manipulated.
- **HTTP notification verifies by `transaction_id`**: The `notification()` method extracts `transaction_id` from the JSON body and calls `status()`.
- **Core API `cardRegister` and `cardToken` use GET with query params** - not POST. Pass params as query string.
- **Iris `getTransactionHistory` uses GET with JSON body** - non-standard but this is how the Iris API works.
- **SnapBi requires asymmetric (RSA-SHA256) signature for access token** and **symmetric (HMAC-SHA512) signature for transactions**. These are generated automatically by the SDK.
- **Currency**: Only IDR is supported for most payment methods.
- **Status code 407**: Expected for expired transactions via `get-status` - not an error.

---

## Reference Files

- [API Endpoints Reference](references/api-endpoints.md) - full endpoint catalog
- [SnapBi Parameters & Signatures](references/snap-bi-params.md) - signature flow, header details, notification verification
- [Gotchas & Edge Cases](references/gotchas.md) - detailed pitfalls and solutions
- [SnapBi Payment Examples](examples/snapbi-payments.md) - Direct Debit, VA, Qris, Cancel, Refund, Webhook code
- [Iris, Subscription & Tokenization Examples](examples/iris-subscription-tokenization.md) - full API methods and usage

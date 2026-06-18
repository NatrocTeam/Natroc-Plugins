---
name: midtrans-php
description: >
  Integrate Midtrans payment gateway in PHP backend applications.
  Covers Snap (popup/redirect), Core API (VT-Direct), Snap BI
  (Direct Debit Gopay/Dana/Shopeepay, VA Bank Transfer, Qris),
  subscriptions, and tokenization. Use this skill when building or
  debugging Midtrans payments in PHP, or when the user mentions
  Midtrans, Snap token, Snap BI, Core API charge, payment
  notification handler, or midtrans/midtrans-php Composer package.
license: MIT
compatibility: Requires PHP 5.4+, Composer, ext-curl, ext-json, ext-openssl
---

# Midtrans PHP Client

Official PHP wrapper for the Midtrans Payment API. Package: `midtrans/midtrans-php` (Composer), version 2.6.2+.

## Quick Start

```bash
composer require midtrans/midtrans-php
```

```php
// If not using Composer autoload:
require_once 'path/to/Midtrans.php';

// Set configuration globally (static properties)
\Midtrans\Config::$serverKey = '<your server key>';
\Midtrans\Config::$isProduction = false;   // true for production
\Midtrans\Config::$isSanitized = true;     // enable input sanitization
\Midtrans\Config::$is3ds = true;           // enable 3DS for credit card
```

All API classes use **static methods**. No instantiation needed.

## Configuration

`\Midtrans\Config` uses public static properties:

| Property                 | Type   | Default | Description                                |
| ------------------------ | ------ | ------- | ------------------------------------------ |
| `$serverKey`             | string | -       | Merchant server key (required)             |
| `$clientKey`             | string | -       | Merchant client key                        |
| `$isProduction`          | bool   | false   | Sandbox (false) / Production (true)        |
| `$isSanitized`           | bool   | false   | Auto-sanitize request params               |
| `$is3ds`                 | bool   | false   | Enable 3DS for credit card                 |
| `$appendNotifUrl`        | string | null    | Comma-separated append notification URLs   |
| `$overrideNotifUrl`      | string | null    | Comma-separated override notification URLs |
| `$paymentIdempotencyKey` | string | null    | Idempotency key for retry safety           |
| `$curlOptions`           | array  | []      | Custom cURL options                        |

Base URLs are set automatically based on `$isProduction`.

## Product Decision Guide

| Product           | When to Use                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| **Snap**          | Pre-built payment UI popup on frontend. Recommended for most merchants. |
| **Snap Redirect** | Customer redirected to Midtrans-hosted payment page.                    |
| **Core API**      | Full control over frontend; build your own payment form.                |
| **SnapBi**        | SNAP BI open API standard (Bank Indonesia). Direct Debit, VA, Qris.     |
| **Subscription**  | Recurring payments (credit card, gopay).                                |
| **Tokenization**  | Link gopay account for recurring/subscription.                          |

**Default recommendation**: Use Snap unless the merchant needs full frontend control.

---

## Snap API

```php
// All methods are static

// Get Snap token (for frontend snap.js)
$snapToken = \Midtrans\Snap::getSnapToken($params);

// Get Snap redirect URL
$paymentUrl = \Midtrans\Snap::getSnapUrl($params);

// Get full response (contains both token and redirect_url)
$response = \Midtrans\Snap::createTransaction($params);
// $response->token
// $response->redirect_url
```

### Create Transaction

```php
$params = [
    'transaction_details' => [
        'order_id' => 'ORDER-' . time(),
        'gross_amount' => 200000,
    ],
    'credit_card' => ['secure' => true],
    'customer_details' => [
        'first_name' => 'Budi',
        'last_name' => 'Susanto',
        'email' => 'budi@example.com',
        'phone' => '08123456789',
    ],
    'item_details' => [
        ['id' => 'ITEM1', 'price' => 100000, 'quantity' => 2, 'name' => 'Product A'],
    ],
];

$snapToken = \Midtrans\Snap::getSnapToken($params);
```

When `item_details` is present, Snap auto-calculates `gross_amount` from items (quantity x price) and overrides whatever was set.

### Frontend (Snap JS)

```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key="YOUR_CLIENT_KEY"
></script>
<script>
  snap.pay("<?=$snapToken?>", {
    onSuccess: function (result) {
      /* handle */
    },
    onPending: function (result) {
      /* handle */
    },
    onError: function (result) {
      /* handle */
    },
  });
</script>
```

Use `https://app.midtrans.com/snap/snap.js` for production.

---

## Core API

```php
// Charge transaction
$response = \Midtrans\CoreApi::charge($transaction_data);

// Capture pre-authorized transaction
$response = \Midtrans\CoreApi::capture($transaction_id);

// Register credit card
$response = \Midtrans\CoreApi::cardRegister($cardNumber, $expMonth, $expYear);

// Get card token
$response = \Midtrans\CoreApi::cardToken($cardNumber, $expMonth, $expYear, $cvv);

// Point inquiry
$response = \Midtrans\CoreApi::cardPointInquiry($tokenId);
```

### Credit Card Charge

```php
$transaction_data = [
    'payment_type' => 'credit_card',
    'transaction_details' => [
        'order_id' => 'ORDER-' . time(),
        'gross_amount' => 200000,
    ],
    'credit_card' => [
        'token_id' => $_POST['token_id'], // from frontend
        'authentication' => true,
    ],
    'item_details' => [
        ['id' => 'item1', 'price' => 100000, 'quantity' => 1, 'name' => 'Adidas f50'],
        ['id' => 'item2', 'price' => 50000, 'quantity' => 2, 'name' => 'Nike N90'],
    ],
    'customer_details' => [
        'first_name' => 'Andri',
        'last_name' => 'Setiawan',
        'email' => 'test@test.com',
        'phone' => '081322311801',
        'billing_address' => [ /* ... */ ],
        'shipping_address' => [ /* ... */ ],
    ],
];

$response = \Midtrans\CoreApi::charge($transaction_data);
```

### Supported Payment Types for `charge()`

`credit_card`, `bank_transfer`, `gopay`, `shopeepay`, `qris`, `echannel`, `permata`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `cstore`, `akulaku`, `bri_epay`, `kredivo`.

---

## SnapBi

SNAP (Standar Nasional Open API Pembayaran) - Bank Indonesia standard.
Supports Direct Debit (Gopay, Dana, Shopeepay), VA (Bank Transfer), and Qris.

### Configuration

```php
\SnapBi\Config::$isProduction = false;
\SnapBi\Config::$snapBiClientId = 'YOUR_CLIENT_ID';
\SnapBi\Config::$snapBiPrivateKey = 'YOUR_PRIVATE_KEY';
\SnapBi\Config::$snapBiClientSecret = 'YOUR_CLIENT_SECRET';
\SnapBi\Config::$snapBiPartnerId = 'YOUR_PARTNER_ID';
\SnapBi\Config::$snapBiChannelId = 'YOUR_CHANNEL_ID';
\SnapBi\Config::$snapBiPublicKey = 'YOUR_PUBLIC_KEY'; // for webhook verification
\SnapBi\Config::$enableLogging = false;
```

### Chain API Pattern

```php
\SnapBi\SnapBi::<paymentMethod>()   // directDebit(), va(), qris()
    ->withBody($requestBody)
    ->withAccessToken($optionalToken)
    ->withAccessTokenHeader([...])
    ->withTransactionHeader([...])
    -><action>($externalId)         // createPayment, cancel, refund, getStatus
```

All SnapBi config values can be overridden inline per-call via chain methods (withPrivateKey, withClientId, withClientSecret, withPartnerId, withChannelId, withDeviceId, withDebuglId).

**Full code examples for Direct Debit, VA, Qris, Get Status/Cancel/Refund, Headers, Webhook Verification, and config override**: see [examples/snapbi-payments.md](examples/snapbi-payments.md).

**Gotcha**: The method is `withDebuglId()` (lowercase letter "L", not capital "I"). This is a known typo in the SDK.

---

## Subscription API

```php
$response = \Midtrans\CoreApi::createSubscription($param);
$response = \Midtrans\CoreApi::getSubscription($subscriptionId);
$response = \Midtrans\CoreApi::disableSubscription($subscriptionId);
$response = \Midtrans\CoreApi::enableSubscription($subscriptionId);
$response = \Midtrans\CoreApi::updateSubscription($subscriptionId, $updateParam);
```

See the [Node.js examples](../midtrans-nodejs/examples/iris-subscription-tokenization.md) for the full parameter structure (API shape is identical across SDKs).

## Tokenization API (Gopay)

```php
$response = \Midtrans\CoreApi::linkPaymentAccount($param);
$response = \Midtrans\CoreApi::getPaymentAccount($accountId);
$response = \Midtrans\CoreApi::unlinkPaymentAccount($accountId);
```

---

## Transaction Actions

```php
// All static methods on \Midtrans\Transaction

$status = \Midtrans\Transaction::status($orderId);          // returns full response object
$status = \Midtrans\Transaction::statusB2b($orderId);       // returns full response object
$approve = \Midtrans\Transaction::approve($orderId);        // returns status_code STRING only!
$cancel = \Midtrans\Transaction::cancel($orderId);          // returns status_code STRING only!
$expire = \Midtrans\Transaction::expire($orderId);          // returns full response object
$deny = \Midtrans\Transaction::deny($orderId);              // returns full response object

$refund = \Midtrans\Transaction::refund($orderId, [
    'refund_key' => 'order1-ref1',
    'amount' => 10000,
    'reason' => 'Item out of stock',
]);
// refund returns full response object

$refund = \Midtrans\Transaction::refundDirect($orderId, [
    'refund_key' => 'order1-ref1',
    'amount' => 10000,
    'reason' => 'Item out of stock',
]);
// refundDirect returns full response object
```

**CRITICAL**: `approve()` and `cancel()` return a **`status_code` string** (e.g. `"200"`), NOT the full response object. Do not attempt to access `->order_id` or `->transaction_status` on these return values - they will fail. All other transaction methods return the full decoded JSON response object.

---

## HTTP Notification Handler

**CRITICAL**: Never rely on frontend callbacks for transaction status. Always use HTTP notification webhook.

```php
$notif = new \Midtrans\Notification();

$transaction = $notif->transaction_status;
$fraud = $notif->fraud_status;
$orderId = $notif->order_id;

if ($transaction == 'capture') {
    if ($fraud == 'challenge') {
        // TODO: set DB status to 'challenge'
    } elseif ($fraud == 'accept') {
        // TODO: set DB status to 'success'
    }
} elseif ($transaction == 'settlement') {
    // TODO: set DB status to 'success'
} elseif ($transaction == 'cancel' || $transaction == 'deny' || $transaction == 'expire') {
    // TODO: set DB status to 'failure'
} elseif ($transaction == 'pending') {
    // TODO: set DB status to 'pending'
}
```

The `\Midtrans\Notification` class automatically:

1. Parses the JSON POST body
2. Calls `Transaction::status()` using the `transaction_id`
3. Exposes all response fields as object properties

---

## Error Handling

All API methods throw `Exception` on error:

```php
try {
    $snapToken = \Midtrans\Snap::getSnapToken($params);
} catch (Exception $e) {
    $e->getMessage();  // error message string
    $e->getCode();     // HTTP status code
}
```

The exception message contains the API response body for debugging.

---

## Advanced

```php
// Override/Append Notification URL (max 3 URLs each; if both set, only override is used)
\Midtrans\Config::$overrideNotifUrl = 'https://example.com/test1,https://example.com/test2';
\Midtrans\Config::$appendNotifUrl = 'https://example.com/test1';

// Idempotency Key (Retry Safety)
\Midtrans\Config::$paymentIdempotencyKey = 'Unique-ID';

// Custom cURL Options
\Midtrans\Config::$curlOptions = [
    CURLOPT_CONNECTTIMEOUT => 30,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => ['X-Custom: value'],
];

// Sanitizer
\Midtrans\Config::$isSanitized = true;
// Automatically validates and modifies charge params: trims strings, converts types, validates required fields
```

---

## Gotchas

- **Static properties**: Config is global. Changing `$serverKey` mid-request affects all subsequent calls.
- **PHP 5.4+ required**: The library checks PHP version on load.
- **ext-curl, ext-json, ext-openssl required**: These PHP extensions must be enabled.
- **`Snap::getSnapToken()` auto-calculates gross_amount**: When `item_details` present, `quantity x price` sum overrides `transaction_details.gross_amount`.
- **Core API `cardRegister`/`cardToken` use `clientKey` auth**: Not `serverKey`. The SDK handles this - pass `Config::$clientKey` properly.
- **Notification endpoint must respond with HTTP 200**: Otherwise Midtrans will retry.
- **Only IDR supported** for most payment methods.
- **`refund_key` must be unique** per refund request - cannot be reused.
- **SnapBi private key must include actual newlines**: The PEM format private key string must contain `\n` line breaks.
- **VA `partnerServiceId` and `virtualAccountNo` may have leading spaces**: Match the exact format from Midtrans docs.
- **Composer autoload**: PSR-4 maps `Midtrans\` to `Midtrans/` and `SnapBi\` to `SnapBi/`. If not using Composer, require `Midtrans.php` manually.

---

## Reference Files

- [API Endpoints Reference](references/api-endpoints.md) - full endpoint catalog
- [SnapBi Parameters & Signatures](references/snap-bi-params.md) - signature flow, header details, notification verification
- [Gotchas & Edge Cases](references/gotchas.md) - detailed pitfalls and solutions
- [SnapBi Payment Examples](examples/snapbi-payments.md) - Direct Debit, VA, Qris, Cancel, Refund, Webhook code

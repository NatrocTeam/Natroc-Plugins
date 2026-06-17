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

### Base URLs (automatic based on `$isProduction`)

| Product  | Sandbox                                    | Production                         |
| -------- | ------------------------------------------ | ---------------------------------- |
| Core API | `https://api.sandbox.midtrans.com`         | `https://api.midtrans.com`         |
| Snap     | `https://app.sandbox.midtrans.com/snap/v1` | `https://app.midtrans.com/snap/v1` |

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

When `item_details` is present, Snap auto-calculates `gross_amount` from items (quantity × price) and overrides whatever was set.

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

### Direct Debit (Gopay/Dana/Shopeepay)

```php
date_default_timezone_set('Asia/Jakarta');
$time_stamp = date('c');
$date = new DateTime($time_stamp);
$external_id = 'order-' . uniqid();
$date->modify('+10 minutes');
$valid_until = $date->format('c');

$debitParams = [
    'partnerReferenceNo' => $external_id,
    'chargeToken' => '',
    'merchantId' => 'YOUR_MERCHANT_ID',
    'urlParam' => [[
        'url' => 'https://www.mysite.com/callback',
        'type' => 'PAY_RETURN',
        'isDeeplink' => 'Y',
    ]],
    'validUpTo' => $valid_until,
    'payOptionDetails' => [[
        'payMethod' => 'DANA',            // GOPAY, DANA, SHOPEEPAY
        'payOption' => 'DANA',
        'transAmount' => [
            'value' => '100.0',
            'currency' => 'IDR',
        ],
    ]],
    'additionalInfo' => [
        'customerDetails' => [
            'phone' => '081122334455',
            'firstName' => 'Andri',
            'lastName' => 'Litani',
            'email' => 'andri@litani.com',
        ],
        'items' => [[
            'id' => '1',
            'price' => ['value' => '100.00', 'currency' => 'IDR'],
            'quantity' => 1,
            'name' => 'Apple',
            'brand' => 'Apple',
            'category' => 'Subscription',
            'merchantName' => 'amazon prime',
        ]],
    ],
];

$response = \SnapBi\SnapBi::directDebit()
    ->withBody($debitParams)
    ->createPayment($external_id);
```

### VA (Bank Transfer)

```php
$external_id = 'order-' . uniqid();
$customerVaNo = '6280123456';

$vaParams = [
    'partnerServiceId' => '   70012',
    'customerNo' => $customerVaNo,
    'virtualAccountNo' => '   70012' . $customerVaNo,
    'virtualAccountName' => 'Jokul Doe',
    'virtualAccountEmail' => 'jokul@email.com',
    'virtualAccountPhone' => '6281828384858',
    'trxId' => $external_id,
    'totalAmount' => ['value' => '10000.00', 'currency' => 'IDR'],
    'additionalInfo' => [
        'merchantId' => 'YOUR_MERCHANT_ID',
        'bank' => 'mandiri',
        'flags' => ['shouldRandomizeVaNumber' => false],
        // mandiri-specific bill info (optional):
        'mandiri' => [
            'billInfo1' => 'bank_name',
            'billInfo2' => 'mandiri',
            'billInfo3' => 'Name:',
            'billInfo4' => 'Budi Utomo',
        ],
        'customerDetails' => [ /* ... */ ],
        'items' => [ /* ... */ ],
    ],
];

$response = \SnapBi\SnapBi::va()
    ->withBody($vaParams)
    ->createPayment($external_id);
```

Supported banks: `bca`, `mandiri`, `bni`, `bri`, `permata`.

### Qris

```php
$qrisBody = [
    'partnerReferenceNo' => $external_id,
    'amount' => ['value' => '1500.00', 'currency' => 'IDR'],
    'merchantId' => 'YOUR_MERCHANT_ID',
    'validityPeriod' => '2030-07-03T12:08:56-07:00',
    'additionalInfo' => [
        'acquirer' => 'gopay',
        'items' => [ /* ... */ ],
        'customerDetails' => [
            'email' => 'merchant-ops@midtrans.com',
            'firstName' => 'Merchant',
            'lastName' => 'Operation',
            'phone' => '+6281932358123',
        ],
        'countryCode' => 'ID',
        'locale' => 'id_ID',
    ],
];

$response = \SnapBi\SnapBi::qris()
    ->withBody($qrisBody)
    ->createPayment($external_id);
```

### Get Status / Cancel / Refund

```php
// Direct Debit status by externalId
$response = \SnapBi\SnapBi::directDebit()
    ->withBody(['originalExternalId' => '...', 'serviceCode' => '54'])
    ->getStatus($external_id);

// Direct Debit cancel by referenceNo
$response = \SnapBi\SnapBi::directDebit()
    ->withBody(['originalReferenceNo' => 'A120240902...'])
    ->cancel($external_id);

// Direct Debit refund
$response = \SnapBi\SnapBi::directDebit()
    ->withBody([
        'originalReferenceNo' => 'A120240828...',
        'reason' => 'some-reason',
        'refundAmount' => ['value' => '100.00', 'currency' => 'IDR'],
    ])
    ->refund($external_id);
```

### Additional Headers

```php
$response = \SnapBi\SnapBi::va()
    ->withAccessTokenHeader(['debug-id' => 'va debug id', 'X-DEVICE-ID' => 'va device id'])
    ->withTransactionHeader(['debug-id' => 'va debug id', 'X-DEVICE-ID' => 'va device id'])
    ->withBody($vaParams)
    ->createPayment($external_id);
```

### Reuse Access Token

```php
$response = \SnapBi\SnapBi::va()
    ->withAccessToken('your-saved-access-token')
    ->withBody($vaParams)
    ->createPayment($external_id);
```

### Override Config Per-Call

All SnapBi config values can be overridden inline via chain methods:

```php
$response = \SnapBi\SnapBi::directDebit()
    ->withBody($body)
    ->withPrivateKey("-----BEGIN PRIVATE KEY-----\n...")
    ->withClientId('override-client-id')
    ->withClientSecret('override-client-secret')
    ->withPartnerId('override-partner-id')
    ->withChannelId('override-channel-id')
    ->withDeviceId('device-unique-id')
    ->withDebuglId('debug-trace-id')  // NOTE: lowercase L: withDebug*l*Id
    ->createPayment($externalId);
```

These override the static `\SnapBi\Config` values for that specific call only.

**Gotcha**: The method is `withDebuglId()` (lowercase letter "L", not capital "I"). This is a known typo in the SDK.

### Webhook Notification Verification

```php
$payload = json_decode('{ "originalPartnerReferenceNo": "...", ... }');
$xSignature = 'CgjmAyC9OZ3pB2Jh...';  // from X-Signature header
$xTimeStamp = '2024-10-07T15:45:22+07:00'; // from X-Timestamp header
$notificationUrlPath = '/v1.0/debit/notify';

$isVerified = \SnapBi\SnapBi::notification()
    ->withBody($payload)
    ->withSignature($xSignature)
    ->withTimeStamp($xTimeStamp)
    ->withNotificationUrlPath($notificationUrlPath)
    ->isWebhookNotificationVerified();
// Returns boolean
```

---

## Subscription API

```php
// Create subscription (credit card)
$param = [
    'name' => 'MONTHLY_2021',
    'amount' => '14000',
    'currency' => 'IDR',
    'payment_type' => 'credit_card',
    'token' => 'SAVED_CARD_TOKEN_ID',
    'schedule' => [
        'interval' => 1,
        'interval_unit' => 'month',
        'max_interval' => 12,
        'start_time' => '2025-11-25 07:25:01 +0700',
    ],
    'metadata' => ['description' => 'Recurring payment'],
    'customer_details' => [
        'first_name' => 'John', 'last_name' => 'Doe',
        'email' => 'john@example.com', 'phone' => '+62812345678',
    ],
];

$response = \Midtrans\CoreApi::createSubscription($param);
$response = \Midtrans\CoreApi::getSubscription($subscriptionId);
$response = \Midtrans\CoreApi::disableSubscription($subscriptionId);
$response = \Midtrans\CoreApi::enableSubscription($subscriptionId);
$response = \Midtrans\CoreApi::updateSubscription($subscriptionId, $updateParam);
```

## Tokenization API (Gopay)

```php
// Link gopay account
$param = [
    'payment_type' => 'gopay',
    'gopay_partner' => [
        'phone_number' => '81234567891',
        'country_code' => '62',
        'redirect_url' => 'https://mysite.com/gopay-callback',
    ],
];

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

### Override/Append Notification URL

```php
\Midtrans\Config::$overrideNotifUrl = 'https://example.com/test1,https://example.com/test2';
\Midtrans\Config::$appendNotifUrl = 'https://example.com/test1';
// Max 3 URLs each. If both set, only $overrideNotifUrl is used.
```

### Idempotency Key (Retry Safety)

```php
\Midtrans\Config::$paymentIdempotencyKey = 'Unique-ID';
```

### Custom cURL Options

```php
\Midtrans\Config::$curlOptions = [
    CURLOPT_CONNECTTIMEOUT => 30,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => ['X-Custom: value'],
];
```

### Sanitizer

```php
\Midtrans\Config::$isSanitized = true;
// Automatically validates and modifies charge params:
// - Trims strings
// - Converts to proper types
// - Validates required fields
```

---

## Gotchas

- **Static properties**: Config is global. Changing `$serverKey` mid-request affects all subsequent calls.
- **PHP 5.4+ required**: The library checks PHP version on load.
- **ext-curl, ext-json, ext-openssl required**: These PHP extensions must be enabled.
- **`Snap::getSnapToken()` auto-calculates gross_amount**: When `item_details` present, `quantity × price` sum overrides `transaction_details.gross_amount`.
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

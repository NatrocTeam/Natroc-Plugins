# SnapBi Payment Examples (PHP)

Full code examples for SnapBi payment methods. See [SKILL.md](../SKILL.md) for configuration and chain API pattern overview.

## Direct Debit (Gopay/Dana/Shopeepay)

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

## VA (Bank Transfer)

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

## Qris

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

## Get Status / Cancel / Refund

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

## Additional Headers

```php
$response = \SnapBi\SnapBi::va()
    ->withAccessTokenHeader(['debug-id' => 'va debug id', 'X-DEVICE-ID' => 'va device id'])
    ->withTransactionHeader(['debug-id' => 'va debug id', 'X-DEVICE-ID' => 'va device id'])
    ->withBody($vaParams)
    ->createPayment($external_id);
```

## Reuse Access Token & Override Config

```php
// Reuse saved access token
$response = \SnapBi\SnapBi::va()
    ->withAccessToken('your-saved-access-token')
    ->withBody($vaParams)
    ->createPayment($external_id);

// Override config per-call
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

**Gotcha**: The method is `withDebuglId()` (lowercase letter "L", not capital "I"). This is a known typo in the SDK.

## Webhook Notification Verification

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

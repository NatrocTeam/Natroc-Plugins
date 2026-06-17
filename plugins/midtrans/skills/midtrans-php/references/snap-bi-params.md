# SnapBi Parameters & Signatures - PHP

## Configuration (`\SnapBi\Config`)

Static properties set before making API calls:

```php
\SnapBi\Config::$isProduction = false;
\SnapBi\Config::$snapBiClientId = 'YOUR_CLIENT_ID';
\SnapBi\Config::$snapBiPrivateKey = 'YOUR_PRIVATE_KEY';
\SnapBi\Config::$snapBiClientSecret = 'YOUR_CLIENT_SECRET';
\SnapBi\Config::$snapBiPartnerId = 'YOUR_PARTNER_ID';
\SnapBi\Config::$snapBiChannelId = 'YOUR_CHANNEL_ID';
\SnapBi\Config::$snapBiPublicKey = 'YOUR_PUBLIC_KEY';  // for webhook verification
\SnapBi\Config::$enableLogging = false;
```

Base URL (automatic): Sandbox `https://merchants.sbx.midtrans.com` / Production `https://merchants.midtrans.com`.

## Authentication Flow (Automatic)

### Step 1: Access Token (B2B)

**Endpoint**: `POST /v1.0/access-token/b2b`

**Headers built automatically**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| X-CLIENT-KEY | `Config::$snapBiClientId` |
| X-TIMESTAMP | Current ISO 8601 timestamp |
| X-SIGNATURE | RSA-SHA256 asymmetric signature |

**Signature generation** (`getAsymmetricSignatureSha256WithRsa`):

```
stringToSign = clientId . "|" . xTimeStamp
binarySignature = openssl_sign(SHA256, stringToSign, privateKey)
signature = base64_encode(binarySignature)
```

**Body**: `{ "grant_type": "client_credentials" }`

**Response**: `{ "accessToken": "...", "expiresIn": "..." }`

### Step 2: Transaction Request (Symmetric)

All transactional calls after obtaining access token:

**Headers**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer {accessToken} |
| X-PARTNER-ID | `Config::$snapBiPartnerId` |
| X-EXTERNAL-ID | `$externalId` parameter |
| X-DEVICE-ID | deviceId (optional) |
| CHANNEL-ID | `Config::$snapBiChannelId` |
| X-TIMESTAMP | ISO 8601 timestamp |
| X-SIGNATURE | HMAC-SHA512 symmetric signature |

**Signature generation** (`getSymmetricSignatureHmacSh512`):

```
minifiedBody = json_encode(requestBody, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
hashedBody = bin2hex(hash('sha256', minifiedBody, true)) → lowercase
payload = strtoupper(method) . ":" . path . ":" . accessToken . ":" . hashedBody . ":" . timeStamp
hmac = hash_hmac('sha512', payload, clientSecret, true)
signature = base64_encode(hmac)
```

**Important**: The method is always `"POST"` for all SnapBi transactional calls.

## Payment Methods & Pay Options

### Direct Debit (`SnapBi::directDebit()`)

| payMethod | payOption    | Description      |
| --------- | ------------ | ---------------- |
| GOPAY     | GOPAY_WALLET | Gopay wallet     |
| DANA      | DANA         | Dana wallet      |
| SHOPEEPAY | SHOPEEPAY    | Shopeepay wallet |

### VA (`SnapBi::va()`)

Supported banks: `bca`, `mandiri`, `bni`, `bri`, `permata`.

Mandiri-specific additional info: `billInfo1` through `billInfo8` in `additionalInfo.mandiri`.

### Qris (`SnapBi::qris()`)

Acquirer options: `gopay`, `dana`, `shopeepay`.

## Transaction Status Query Bodies

### Direct Debit - By External ID

```php
['originalExternalId' => '...', 'serviceCode' => '54']
```

### Direct Debit - By Reference No

```php
['originalReferenceNo' => 'A120240828...', 'serviceCode' => '54']
```

### VA Status

```php
[
    'partnerServiceId' => '    5818',
    'customerNo' => '628064192914',
    'virtualAccountNo' => '    5818628064192914',
    'inquiryRequestId' => '...',
    'additionalInfo' => ['merchantId' => '...'],
]
```

### Qris Status

```php
[
    'originalReferenceNo' => '...',
    'originalPartnerReferenceNo' => '...',
    'merchantId' => '...',
    'serviceCode' => '54',
]
```

## Cancel Bodies

### Direct Debit

```php
// By referenceNo:
['originalReferenceNo' => 'A120240902...']

// By externalId:
['originalExternalId' => 'uzi-order-testing...']
```

### VA

```php
[
    'partnerServiceId' => '    5818',
    'customerNo' => '628014506680',
    'virtualAccountNo' => '    5818628014506680',
    'trxId' => '...',
    'additionalInfo' => ['merchantId' => '...'],
]
```

### Qris

```php
[
    'originalReferenceNo' => '...',
    'merchantId' => '...',
    'reason' => 'cancel reason',
]
```

## Refund Bodies

### Direct Debit Refund

```php
[
    'originalExternalId' => '...',     // or 'originalReferenceNo'
    'partnerRefundNo' => 'refund-0001',
    'reason' => 'some-reason',
    'refundAmount' => ['value' => '100.00', 'currency' => 'IDR'],
]
```

### Qris Refund

```php
[
    'merchantId' => '...',
    'originalPartnerReferenceNo' => '...',
    'originalReferenceNo' => '...',
    'partnerRefundNo' => 'partner-refund-no-' . uniqid(),
    'reason' => 'refund reason',
    'refundAmount' => ['value' => '1500.00', 'currency' => 'IDR'],
    'additionalInfo' => ['foo' => 'bar'],
]
```

## Additional / Override Headers

Use `->withAccessTokenHeader()` and `->withTransactionHeader()` with associative arrays:

```php
\SnapBi\SnapBi::directDebit()
    ->withAccessTokenHeader(['debug-id' => 'debug id', 'X-DEVICE-ID' => 'device id'])
    ->withTransactionHeader(['debug-id' => 'debug id', 'X-DEVICE-ID' => 'device id'])
    ->withBody($body)
    ->createPayment($externalId);
```

These headers are merged with (or override) the auto-generated headers.

## Webhook Notification Verification

**Signature**: From HTTP header `X-Signature`
**Timestamp**: From HTTP header `X-Timestamp`

Uses RSA-SHA256 verification with public key:

```
rawString = "POST:" . notificationUrlPath . ":" . SHA256(json_encode(body)) . ":" . timestamp
verified = openssl_verify(rawString, base64_decode(signature), publicKey, OPENSSL_ALGO_SHA256)
```

### Full Example

```php
$payload = json_decode('{ "originalPartnerReferenceNo": "...", ... }');
$xSignature = 'CgjmAyC9OZ3pB2Jh...';
$xTimeStamp = '2024-10-07T15:45:22+07:00';
$notificationUrlPath = '/v1.0/debit/notify';

$isVerified = \SnapBi\SnapBi::notification()
    ->withBody($payload)
    ->withSignature($xSignature)
    ->withTimeStamp($xTimeStamp)
    ->withNotificationUrlPath($notificationUrlPath)
    ->isWebhookNotificationVerified();
```

**Note**: The public key must be set in `\SnapBi\Config::$snapBiPublicKey` before verification, or an Exception will be thrown.

## Mandiri VA Bill Info Fields

When `bank` is `mandiri` in VA, the `additionalInfo.mandiri` array supports:

- `billInfo1` through `billInfo8`: Custom bill information labels/values
- `billInfo1`: usually "bank_name"
- `billInfo2`: usually "mandiri"
- `billInfo3`–`billInfo8`: Custom label/value pairs

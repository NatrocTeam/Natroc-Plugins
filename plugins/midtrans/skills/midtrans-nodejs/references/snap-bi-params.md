# SnapBi Parameters & Signatures - Node.js

## Configuration (`SnapBiConfig`)

Static properties set before making API calls:

```js
midtransClient.SnapBiConfig.isProduction = false;
midtransClient.SnapBiConfig.snapBiClientId = "YOUR_CLIENT_ID";
midtransClient.SnapBiConfig.snapBiPrivateKey = "YOUR_PRIVATE_KEY";
midtransClient.SnapBiConfig.snapBiClientSecret = "YOUR_CLIENT_SECRET";
midtransClient.SnapBiConfig.snapBiPartnerId = "YOUR_PARTNER_ID";
midtransClient.SnapBiConfig.snapBiChannelId = "YOUR_CHANNEL_ID";
midtransClient.SnapBiConfig.snapBiPublicKey = "YOUR_PUBLIC_KEY"; // for webhook verification
midtransClient.SnapBiConfig.enableLogging = false;
```

## Authentication Flow (Automatic)

The SDK handles a 2-step signature process automatically:

### Step 1: Access Token (B2B)

**Endpoint**: `POST /v1.0/access-token/b2b`

**Headers built automatically**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| X-CLIENT-KEY | SnapBiConfig.snapBiClientId |
| X-TIMESTAMP | ISO 8601 timestamp |
| X-SIGNATURE | RSA-SHA256 signature |

**Signature generation** (`getAsymmetricSignatureSha256WithRsa`):

```
stringToSign = clientId + "|" + xTimeStamp
signature = RSA-SHA256(privateKey, stringToSign) → base64
```

**Body**: `{ "grant_type": "client_credentials" }`

**Response**: `{ "accessToken": "...", "expiresIn": "..." }`

### Step 2: Transaction Request (Symmetric)

All transactional API calls after obtaining access token:

**Headers**:
| Header | Value |
|--------|-------|
| Content-Type | application/json |
| Authorization | Bearer {accessToken} |
| X-PARTNER-ID | SnapBiConfig.snapBiPartnerId |
| X-EXTERNAL-ID | externalId parameter |
| X-DEVICE-ID | deviceId (optional) |
| CHANNEL-ID | SnapBiConfig.snapBiChannelId |
| X-TIMESTAMP | ISO 8601 timestamp |
| X-SIGNATURE | HMAC-SHA512 signature |

**Signature generation** (`getSymmetricSignatureHmacSh512`):

```
minifiedBody = JSON.stringify(requestBody)  // no spaces
hashedBody = SHA256(minifiedBody) → lowercase hex
payload = "POST:" + apiPath + ":" + accessToken + ":" + hashedBody + ":" + timeStamp
signature = HMAC-SHA512(clientSecret, payload) → base64
```

## Payment Methods & Pay Options

### Direct Debit (`SnapBi.directDebit()`)

| payMethod | payOption    | Description      |
| --------- | ------------ | ---------------- |
| GOPAY     | GOPAY_WALLET | Gopay wallet     |
| DANA      | DANA         | Dana wallet      |
| SHOPEEPAY | SHOPEEPAY    | Shopeepay wallet |

### VA (`SnapBi.va()`)

Supported banks: `bca`, `mandiri`, `bni`, `bri`, `permata`.

Mandiri-specific additional info fields: `billInfo1` through `billInfo8`.

### Qris (`SnapBi.qris()`)

Acquirer options: `gopay`, `dana`, `shopeepay`.

## Transaction Status Query Bodies

### Direct Debit - By External ID

```json
{ "originalExternalId": "...", "serviceCode": "54" }
```

### Direct Debit - By Reference No

```json
{ "originalReferenceNo": "A120240930...", "serviceCode": "54" }
```

### VA Status

```json
{
  "partnerServiceId": "    1234",
  "customerNo": "356899",
  "virtualAccountNo": "    1234356899",
  "inquiryRequestId": "...",
  "additionalInfo": { "merchantId": "..." }
}
```

### Qris Status

```json
{
  "originalReferenceNo": "...",
  "originalPartnerReferenceNo": "...",
  "merchantId": "...",
  "serviceCode": "47"
}
```

## Cancel Bodies

### Direct Debit - By External ID

```json
{ "originalExternalId": "..." }
```

### Direct Debit - By Reference No

```json
{ "originalReferenceNo": "..." }
```

### VA Cancel

```json
{
  "partnerServiceId": "    1234",
  "customerNo": "...",
  "virtualAccountNo": "...",
  "trxId": "...",
  "additionalInfo": { "merchantId": "..." }
}
```

### Qris Cancel

```json
{
  "originalReferenceNo": "...",
  "merchantId": "...",
  "reason": "cancel reason"
}
```

## Refund Bodies

### Direct Debit Refund

```json
// By Reference No:
{
  "originalReferenceNo": "...",
  "reason": "refund reason",
  "refundAmount": { "value": "100.00", "currency": "IDR" }
}

// By External ID:
{
  "originalExternalId": "...",
  "partnerRefundNo": "refund-0001",
  "reason": "refund reason",
  "refundAmount": { "value": "100.00", "currency": "IDR" }
}
```

### Qris Refund

```json
{
  "merchantId": "...",
  "originalPartnerReferenceNo": "...",
  "originalReferenceNo": "...",
  "partnerRefundNo": "refund-12345",
  "reason": "refund reason",
  "refundAmount": { "value": "100.00", "currency": "IDR" }
}
```

## Additional / Override Headers

Use `.withAccessTokenHeader()` and `.withTransactionHeader()` to add or override specific header values:

```js
midtransClient.SnapBi.directDebit()
  .withBody(body)
  .withAccessTokenHeader({ "X-device-id": "my-device", "debug-id": "my-debug" })
  .withTransactionHeader({ "debug-id": "my-debug" })
  .createPayment(externalId);
```

## Webhook Notification Verification

**Signature**: Obtained from HTTP header `X-Signature`
**Timestamp**: Obtained from HTTP header `X-Timestamp`

The SDK verifies using RSA-SHA256 public key:

```
rawString = "POST:" + notificationUrlPath + ":" + SHA256(minifiedBody) + ":" + timestamp
verify = RSA-SHA256(publicKey, rawString, signature)
```

### Example

```js
const isVerified = midtransClient.SnapBi.notification()
  .withNotificationPayload(JSON.parse(notificationJsonString))
  .withSignature("CgjmAyC9OZ3pB2Jh...")
  .withTimeStamp("2024-10-07T15:45:22+07:00")
  .withNotificationUrlPath("/v1.0/debit/notify")
  .isWebhookNotificationVerified();
```

Notification URL paths per payment method:

- Direct Debit: `/v1.0/debit/notify`
- VA: `/v1.0/transfer-va/notify`
- Qris: `/v1.0/qr/qr-mpm-notify`

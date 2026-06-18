# SnapBi Payment Examples (Node.js)

Full code examples for SnapBi payment methods. See [SKILL.md](../SKILL.md) for configuration and chain API pattern overview.

## Direct Debit (Gopay/Dana/Shopeepay)

```js
const directDebitBody = {
  partnerReferenceNo: externalId,
  chargeToken: "",
  merchantId: "YOUR_MERCHANT_ID",
  urlParam: {
    url: "https://your-site.com/notification",
    type: "PAY_RETURN",
    isDeeplink: "N",
  },
  validUpTo: "2030-07-20T20:34:15.452305Z",
  payOptionDetails: [
    {
      payMethod: "GOPAY", // GOPAY, DANA, SHOPEEPAY
      payOption: "GOPAY_WALLET",
      transAmount: { value: "1500", currency: "IDR" },
    },
  ],
  additionalInfo: {
    customerDetails: {
      firstName: "...",
      lastName: "...",
      email: "...",
      phone: "...",
    },
    items: [
      {
        id: "1",
        price: { value: "1500.00", currency: "IDR" },
        quantity: 1,
        name: "...",
      },
    ],
  },
};

const result = await midtransClient.SnapBi.directDebit()
  .withBody(directDebitBody)
  .createPayment(externalId);
```

## VA (Bank Transfer)

```js
const vaBody = {
  partnerServiceId: "    1234",
  customerNo: "0000000000",
  virtualAccountNo: "    12340000000000",
  virtualAccountName: "Merchant Operation",
  virtualAccountEmail: "merchant-ops@midtrans.com",
  virtualAccountPhone: "6281932358123",
  trxId: externalId,
  totalAmount: { value: "1500.00", currency: "IDR" },
  expiredDate: "2030-07-20T20:50:04Z",
  additionalInfo: {
    merchantId: "YOUR_MERCHANT_ID",
    bank: "bca", // bca, mandiri, bni, bri, permata
    flags: { shouldRandomizeVaNumber: true },
    customerDetails: {
      /* ... */
    },
    items: [
      /* ... */
    ],
  },
};

const result = await midtransClient.SnapBi.va()
  .withBody(vaBody)
  .createPayment(externalId);
```

## Qris

```js
const qrisBody = {
  partnerReferenceNo: externalId,
  merchantId: "YOUR_MERCHANT_ID",
  amount: { value: "1500.00", currency: "IDR" },
  validityPeriod: "2030-07-03T12:08:56-07:00",
  additionalInfo: {
    acquirer: "gopay",
    customerDetails: {
      firstName: "...",
      lastName: "...",
      email: "...",
      phone: "...",
    },
    items: [
      /* ... */
    ],
    countryCode: "ID",
    locale: "id_ID",
  },
};

const result = await midtransClient.SnapBi.qris()
  .withBody(qrisBody)
  .createPayment(externalId);
```

## Get Status / Cancel / Refund

```js
// Get status
await midtransClient.SnapBi.directDebit()
  .withBody({ originalExternalId: "...", serviceCode: "54" })
  .getStatus(externalId);

// Cancel
await midtransClient.SnapBi.directDebit()
  .withBody({ originalReferenceNo: "A120240930..." })
  .cancel(externalId);

// Refund
await midtransClient.SnapBi.directDebit()
  .withBody({ originalReferenceNo: "A120240930...", reason: "refund reason" })
  .refund(externalId);
```

## Reuse Access Token & Override Config

```js
// Reuse saved access token
await midtransClient.SnapBi.directDebit()
  .withBody(body)
  .withAccessToken("saved-access-token")
  .createPayment(externalId);

// Override config per-call
await midtransClient.SnapBi.directDebit()
  .withBody(body)
  .withPrivateKey("-----BEGIN PRIVATE KEY-----\n...")
  .withClientId("override-client-id")
  .withClientSecret("override-client-secret")
  .withPartnerId("override-partner-id")
  .withChannelId("override-channel-id")
  .withDeviceId("device-unique-id")
  .withDebugId("debug-trace-id")
  .withTimeout(15000) // ms, default 10000
  .createPayment(externalId);
```

## Webhook Notification Verification

```js
const isVerified = midtransClient.SnapBi.notification()
  .withNotificationPayload(notificationPayload) // JSON body from webhook
  .withSignature(signature) // X-Signature header
  .withTimeStamp(timeStamp) // X-Timestamp header
  .withNotificationUrlPath("/v1.0/debit/notify") // webhook path
  .isWebhookNotificationVerified();
// Returns boolean
```

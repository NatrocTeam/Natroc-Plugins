# Midtrans PHP - API Endpoints Reference

## Snap API

Base: `https://app.sandbox.midtrans.com/snap/v1` (sandbox) / `https://app.midtrans.com/snap/v1` (production)

| Method             | HTTP | Endpoint                          | SDK Static Method                            |
| ------------------ | ---- | --------------------------------- | -------------------------------------------- |
| Create Transaction | POST | `/transactions`                   | `\Midtrans\Snap::createTransaction($params)` |
| Get Token          | POST | `/transactions` → `.token`        | `\Midtrans\Snap::getSnapToken($params)`      |
| Get URL            | POST | `/transactions` → `.redirect_url` | `\Midtrans\Snap::getSnapUrl($params)`        |

### Snap Request Parameters

Full reference: https://snap-docs.midtrans.com/#json-objects

Key sections: `transaction_details` (required - `order_id`, `gross_amount`), `item_details`, `customer_details`, `credit_card`, `enabled_payments`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `permata_va`, `gopay`, `shopeepay`, `cstore`, `bank_transfer`, `echannel`, `callbacks`.

## Core API

Base: `https://api.sandbox.midtrans.com` (sandbox) / `https://api.midtrans.com` (production)

| Method        | HTTP | Endpoint                                                                                     | SDK Static Method                                                      |
| ------------- | ---- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Charge        | POST | `/v2/charge`                                                                                 | `\Midtrans\CoreApi::charge($params)`                                   |
| Capture       | POST | `/v2/capture`                                                                                | `\Midtrans\CoreApi::capture($transactionId)`                           |
| Card Register | GET  | `/v2/card/register?card_number=...&card_exp_month=...&card_exp_year=...&client_key=...`      | `\Midtrans\CoreApi::cardRegister($cardNumber, $expMonth, $expYear)`    |
| Card Token    | GET  | `/v2/token?card_number=...&card_exp_month=...&card_exp_year=...&card_cvv=...&client_key=...` | `\Midtrans\CoreApi::cardToken($cardNumber, $expMonth, $expYear, $cvv)` |
| Point Inquiry | GET  | `/v2/point_inquiry/{tokenId}`                                                                | `\Midtrans\CoreApi::cardPointInquiry($tokenId)`                        |

Note: `cardRegister` and `cardToken` use **clientKey** authentication (not serverKey).

## Transaction Actions

Base: Core API base URL.

| Action        | HTTP | Endpoint                        | SDK Static Method                                   |
| ------------- | ---- | ------------------------------- | --------------------------------------------------- |
| Status        | GET  | `/v2/{id}/status`               | `\Midtrans\Transaction::status($id)`                |
| Status B2B    | GET  | `/v2/{id}/status/b2b`           | `\Midtrans\Transaction::statusB2b($id)`             |
| Approve       | POST | `/v2/{id}/approve`              | `\Midtrans\Transaction::approve($id)`               |
| Deny          | POST | `/v2/{id}/deny`                 | `\Midtrans\Transaction::deny($id)`                  |
| Cancel        | POST | `/v2/{id}/cancel`               | `\Midtrans\Transaction::cancel($id)`                |
| Expire        | POST | `/v2/{id}/expire`               | `\Midtrans\Transaction::expire($id)`                |
| Refund        | POST | `/v2/{id}/refund`               | `\Midtrans\Transaction::refund($id, $params)`       |
| Refund Direct | POST | `/v2/{id}/refund/online/direct` | `\Midtrans\Transaction::refundDirect($id, $params)` |

## Notification

| Action         | Class                          | Description                                                           |
| -------------- | ------------------------------ | --------------------------------------------------------------------- |
| Parse & Verify | `new \Midtrans\Notification()` | Auto-parses POST body, calls `status()`, exposes fields as properties |

Access properties: `$notif->order_id`, `$notif->transaction_status`, `$notif->fraud_status`, `$notif->payment_type`, `$notif->gross_amount`, etc.

## SnapBi API Endpoints

Base: `https://merchants.sbx.midtrans.com` (sandbox) / `https://merchants.midtrans.com` (production)

### Access Token

| Action               | HTTP | Endpoint                 |
| -------------------- | ---- | ------------------------ |
| Get B2B Access Token | POST | `/v1.0/access-token/b2b` |

### Direct Debit

| Action         | HTTP | Endpoint                           | SDK Method                     |
| -------------- | ---- | ---------------------------------- | ------------------------------ |
| Create Payment | POST | `/v1.0/debit/payment-host-to-host` | `->createPayment($externalId)` |
| Get Status     | POST | `/v1.0/debit/status`               | `->getStatus($externalId)`     |
| Cancel         | POST | `/v1.0/debit/cancel`               | `->cancel($externalId)`        |
| Refund         | POST | `/v1.0/debit/refund`               | `->refund($externalId)`        |

### VA (Bank Transfer)

| Action     | HTTP | Endpoint                      | SDK Method                     |
| ---------- | ---- | ----------------------------- | ------------------------------ |
| Create VA  | POST | `/v1.0/transfer-va/create-va` | `->createPayment($externalId)` |
| Get Status | POST | `/v1.0/transfer-va/status`    | `->getStatus($externalId)`     |
| Delete VA  | POST | `/v1.0/transfer-va/delete-va` | `->cancel($externalId)`        |

### Qris

| Action       | HTTP | Endpoint                   | SDK Method                     |
| ------------ | ---- | -------------------------- | ------------------------------ |
| Generate MPM | POST | `/v1.0/qr/qr-mpm-generate` | `->createPayment($externalId)` |
| Query MPM    | POST | `/v1.0/qr/qr-mpm-query`    | `->getStatus($externalId)`     |
| Refund MPM   | POST | `/v1.0/qr/qr-mpm-refund`   | `->refund($externalId)`        |
| Cancel MPM   | POST | `/v1.0/qr/qr-mpm-cancel`   | `->cancel($externalId)`        |

### Notification Paths

- Direct Debit: `/v1.0/debit/notify`
- VA: `/v1.0/transfer-va/notify`
- Qris: `/v1.0/qr/qr-mpm-notify`

## Subscription API

Base: Core API base URL.

| Action  | HTTP  | Endpoint                         | SDK Static Method                                    |
| ------- | ----- | -------------------------------- | ---------------------------------------------------- |
| Create  | POST  | `/v1/subscriptions`              | `\Midtrans\CoreApi::createSubscription($param)`      |
| Get     | GET   | `/v1/subscriptions/{id}`         | `\Midtrans\CoreApi::getSubscription($id)`            |
| Disable | POST  | `/v1/subscriptions/{id}/disable` | `\Midtrans\CoreApi::disableSubscription($id)`        |
| Enable  | POST  | `/v1/subscriptions/{id}/enable`  | `\Midtrans\CoreApi::enableSubscription($id)`         |
| Update  | PATCH | `/v1/subscriptions/{id}`         | `\Midtrans\CoreApi::updateSubscription($id, $param)` |

## Tokenization API (Gopay)

Base: Core API base URL.

| Action       | HTTP | Endpoint                             | SDK Static Method                               |
| ------------ | ---- | ------------------------------------ | ----------------------------------------------- |
| Link Account | POST | `/v2/pay/account`                    | `\Midtrans\CoreApi::linkPaymentAccount($param)` |
| Get Account  | GET  | `/v2/pay/account/{accountId}`        | `\Midtrans\CoreApi::getPaymentAccount($id)`     |
| Unlink       | POST | `/v2/pay/account/{accountId}/unbind` | `\Midtrans\CoreApi::unlinkPaymentAccount($id)`  |

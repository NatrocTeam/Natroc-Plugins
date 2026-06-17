# Midtrans Node.js - API Endpoints Reference

## Snap API

Base: `https://app.sandbox.midtrans.com/snap/v1` (sandbox) / `https://app.midtrans.com/snap/v1` (production)

| Method             | HTTP | Endpoint        | SDK Method                                 |
| ------------------ | ---- | --------------- | ------------------------------------------ |
| Create Transaction | POST | `/transactions` | `snap.createTransaction(param)`            |
| Get Token          | POST | `/transactions` | `snap.createTransactionToken(param)`       |
| Get Redirect URL   | POST | `/transactions` | `snap.createTransactionRedirectUrl(param)` |

### Request Body (Snap Transaction)

Full parameter reference: https://snap-docs.midtrans.com/#json-objects

Key sections: `transaction_details` (required), `item_details`, `customer_details`, `credit_card`, `enabled_payments`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `permata_va`, `gopay`, `shopeepay`, `cstore`, `bank_transfer`, `echannel`, `callbacks`.

## Core API

Base: `https://api.sandbox.midtrans.com` (sandbox) / `https://api.midtrans.com` (production)

| Method        | HTTP | Endpoint                                                                                     | SDK Method                          |
| ------------- | ---- | -------------------------------------------------------------------------------------------- | ----------------------------------- |
| Charge        | POST | `/v2/charge`                                                                                 | `coreApi.charge(param)`             |
| Capture       | POST | `/v2/capture`                                                                                | `coreApi.capture(param)`            |
| Card Register | GET  | `/v2/card/register?card_number=...&card_exp_month=...&card_exp_year=...&client_key=...`      | `coreApi.cardRegister(param)`       |
| Card Token    | GET  | `/v2/token?card_number=...&card_exp_month=...&card_exp_year=...&card_cvv=...&client_key=...` | `coreApi.cardToken(param)`          |
| Point Inquiry | GET  | `/v2/point_inquiry/{tokenId}`                                                                | `coreApi.cardPointInquiry(tokenId)` |

### Supported Payment Types for `/v2/charge`

`credit_card`, `bank_transfer`, `gopay`, `shopeepay`, `qris`, `echannel`, `permata`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `cstore`, `akulaku`, `bri_epay`, `kredivo`, `indomaret`, `alfamart`.

## Transaction Actions (Shared)

Base: Core API base URL.

| Action        | HTTP     | Endpoint                                      | SDK Method                                  |
| ------------- | -------- | --------------------------------------------- | ------------------------------------------- |
| Status        | GET      | `/v2/{id}/status`                             | `transaction.status(id)`                    |
| Status B2B    | GET      | `/v2/{id}/status/b2b`                         | `transaction.statusb2b(id)`                 |
| Approve       | POST     | `/v2/{id}/approve`                            | `transaction.approve(id)`                   |
| Deny          | POST     | `/v2/{id}/deny`                               | `transaction.deny(id)`                      |
| Cancel        | POST     | `/v2/{id}/cancel`                             | `transaction.cancel(id)`                    |
| Expire        | POST     | `/v2/{id}/expire`                             | `transaction.expire(id)`                    |
| Refund        | POST     | `/v2/{id}/refund`                             | `transaction.refund(id, param)`             |
| Refund Direct | POST     | `/v2/{id}/refund/online/direct`               | `transaction.refundDirect(id, param)`       |
| Notification  | POST→GET | Receives notification JSON → calls `status()` | `transaction.notification(notificationObj)` |

## SnapBi API Endpoints

Base: `https://merchants.sbx.midtrans.com` (sandbox) / `https://merchants.midtrans.com` (production)

### Access Token

| Action               | HTTP | Endpoint                 |
| -------------------- | ---- | ------------------------ |
| Get B2B Access Token | POST | `/v1.0/access-token/b2b` |

### Direct Debit

| Action         | HTTP | Endpoint                           | SDK Method                   |
| -------------- | ---- | ---------------------------------- | ---------------------------- |
| Create Payment | POST | `/v1.0/debit/payment-host-to-host` | `.createPayment(externalId)` |
| Get Status     | POST | `/v1.0/debit/status`               | `.getStatus(externalId)`     |
| Cancel         | POST | `/v1.0/debit/cancel`               | `.cancel(externalId)`        |
| Refund         | POST | `/v1.0/debit/refund`               | `.refund(externalId)`        |

### VA (Bank Transfer)

| Action     | HTTP | Endpoint                      | SDK Method                   |
| ---------- | ---- | ----------------------------- | ---------------------------- |
| Create VA  | POST | `/v1.0/transfer-va/create-va` | `.createPayment(externalId)` |
| Get Status | POST | `/v1.0/transfer-va/status`    | `.getStatus(externalId)`     |
| Delete VA  | POST | `/v1.0/transfer-va/delete-va` | `.cancel(externalId)`        |

### Qris

| Action       | HTTP | Endpoint                   | SDK Method                   |
| ------------ | ---- | -------------------------- | ---------------------------- |
| Generate MPM | POST | `/v1.0/qr/qr-mpm-generate` | `.createPayment(externalId)` |
| Query MPM    | POST | `/v1.0/qr/qr-mpm-query`    | `.getStatus(externalId)`     |
| Refund MPM   | POST | `/v1.0/qr/qr-mpm-refund`   | `.refund(externalId)`        |
| Cancel MPM   | POST | `/v1.0/qr/qr-mpm-cancel`   | `.cancel(externalId)`        |

## Iris API

Base: `https://app.sandbox.midtrans.com/iris/api/v1` (sandbox) / `https://app.midtrans.com/iris/api/v1` (production)

| Action                    | HTTP  | Endpoint                      | SDK Method                                   |
| ------------------------- | ----- | ----------------------------- | -------------------------------------------- |
| Ping                      | GET   | `/ping`                       | `iris.ping()`                                |
| Create Beneficiaries      | POST  | `/beneficiaries`              | `iris.createBeneficiaries(param)`            |
| Update Beneficiary        | PATCH | `/beneficiaries/{alias_name}` | `iris.updateBeneficiaries(aliasName, param)` |
| Get Beneficiaries         | GET   | `/beneficiaries`              | `iris.getBeneficiaries()`                    |
| Create Payouts            | POST  | `/payouts`                    | `iris.createPayouts(param)`                  |
| Approve Payouts           | POST  | `/payouts/approve`            | `iris.approvePayouts(param)`                 |
| Reject Payouts            | POST  | `/payouts/reject`             | `iris.rejectPayouts(param)`                  |
| Get Payout Details        | GET   | `/payouts/{referenceNo}`      | `iris.getPayoutDetails(referenceNo)`         |
| Transaction History       | GET   | `/statements`                 | `iris.getTransactionHistory(param)`          |
| Top-up Channels           | GET   | `/channels`                   | `iris.getTopupChannels()`                    |
| Balance                   | GET   | `/balance`                    | `iris.getBalance()`                          |
| Facilitator Bank Accounts | GET   | `/bank_accounts`              | `iris.getFacilitatorBankAccounts()`          |
| Facilitator Balance       | GET   | `/bank_accounts/{id}/balance` | `iris.getFacilitatorBalance(bankAccountId)`  |
| Beneficiary Banks         | GET   | `/beneficiary_banks`          | `iris.getBeneficiaryBanks()`                 |
| Validate Bank Account     | GET   | `/account_validation`         | `iris.validateBankAccount(param)`            |

## Subscription API

Base: Core API base URL.

| Action  | HTTP  | Endpoint                         | SDK Method                              |
| ------- | ----- | -------------------------------- | --------------------------------------- |
| Create  | POST  | `/v1/subscriptions`              | `coreApi.createSubscription(param)`     |
| Get     | GET   | `/v1/subscriptions/{id}`         | `coreApi.getSubscription(id)`           |
| Disable | POST  | `/v1/subscriptions/{id}/disable` | `coreApi.disableSubscription(id)`       |
| Enable  | POST  | `/v1/subscriptions/{id}/enable`  | `coreApi.enableSubscription(id)`        |
| Update  | PATCH | `/v1/subscriptions/{id}`         | `coreApi.updateSubscription(id, param)` |

## Tokenization API (Gopay)

Base: Core API base URL.

| Action         | HTTP | Endpoint                             | SDK Method                          |
| -------------- | ---- | ------------------------------------ | ----------------------------------- |
| Link Account   | POST | `/v2/pay/account`                    | `coreApi.linkPaymentAccount(param)` |
| Get Account    | GET  | `/v2/pay/account/{accountId}`        | `coreApi.getPaymentAccount(id)`     |
| Unlink Account | POST | `/v2/pay/account/{accountId}/unbind` | `coreApi.unlinkPaymentAccount(id)`  |

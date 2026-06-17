# Midtrans Python - API Endpoints Reference

## Snap API

Base: `https://app.sandbox.midtrans.com/snap/v1` (sandbox) / `https://app.midtrans.com/snap/v1` (production)

| Method             | HTTP | Endpoint                             | SDK Method                                    |
| ------------------ | ---- | ------------------------------------ | --------------------------------------------- |
| Create Transaction | POST | `/transactions`                      | `snap.create_transaction(param)`              |
| Get Token          | POST | `/transactions` → `['token']`        | `snap.create_transaction_token(param)`        |
| Get Redirect URL   | POST | `/transactions` → `['redirect_url']` | `snap.create_transaction_redirect_url(param)` |

### Snap Request Parameters

Full reference: https://snap-docs.midtrans.com/#json-objects

Key sections: `transaction_details` (required - `order_id`, `gross_amount`), `item_details`, `customer_details`, `credit_card`, `enabled_payments`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `permata_va`, `gopay`, `shopeepay`, `cstore`, `bank_transfer`, `echannel`, `callbacks`.

## Core API

Base: `https://api.sandbox.midtrans.com` (sandbox) / `https://api.midtrans.com` (production)

| Method        | HTTP | Endpoint                                                                                     | SDK Method                              |
| ------------- | ---- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Charge        | POST | `/v2/charge`                                                                                 | `core_api.charge(param)`                |
| Capture       | POST | `/v2/capture`                                                                                | `core_api.capture(param)`               |
| Card Register | GET  | `/v2/card/register?card_number=...&card_exp_month=...&card_exp_year=...&client_key=...`      | `core_api.card_register(param)`         |
| Card Token    | GET  | `/v2/token?card_number=...&card_exp_month=...&card_exp_year=...&card_cvv=...&client_key=...` | `core_api.card_token(param)`            |
| Point Inquiry | GET  | `/v2/point_inquiry/{tokenId}`                                                                | `core_api.card_point_inquiry(token_id)` |

Note: `card_register` and `card_token` use **client_key** auth (not server_key). Parameters go as GET query string.

## Transaction Actions (Shared)

Base: Core API base URL. Both `Snap` and `CoreApi` instances have a `transactions` object.

| Action        | HTTP     | Endpoint                                                          | SDK Method                                           |
| ------------- | -------- | ----------------------------------------------------------------- | ---------------------------------------------------- |
| Status        | GET      | `/v2/{id}/status`                                                 | `api_client.transactions.status(id)`                 |
| Status B2B    | GET      | `/v2/{id}/status/b2b`                                             | `api_client.transactions.statusb2b(id)`              |
| Approve       | POST     | `/v2/{id}/approve`                                                | `api_client.transactions.approve(id)`                |
| Deny          | POST     | `/v2/{id}/deny`                                                   | `api_client.transactions.deny(id)`                   |
| Cancel        | POST     | `/v2/{id}/cancel`                                                 | `api_client.transactions.cancel(id)`                 |
| Expire        | POST     | `/v2/{id}/expire`                                                 | `api_client.transactions.expire(id)`                 |
| Refund        | POST     | `/v2/{id}/refund`                                                 | `api_client.transactions.refund(id, param)`          |
| Refund Direct | POST     | `/v2/{id}/refund/online/direct`                                   | `api_client.transactions.refundDirect(id, param)`    |
| Notification  | POST→GET | Receives JSON body → extracts `transaction_id` → calls `status()` | `api_client.transactions.notification(notification)` |

## Subscription API

Base: Core API base URL.

| Action  | HTTP  | Endpoint                         | SDK Method                                |
| ------- | ----- | -------------------------------- | ----------------------------------------- |
| Create  | POST  | `/v1/subscriptions`              | `core_api.create_subscription(param)`     |
| Get     | GET   | `/v1/subscriptions/{id}`         | `core_api.get_subscription(id)`           |
| Disable | POST  | `/v1/subscriptions/{id}/disable` | `core_api.disable_subscription(id)`       |
| Enable  | POST  | `/v1/subscriptions/{id}/enable`  | `core_api.enable_subscription(id)`        |
| Update  | PATCH | `/v1/subscriptions/{id}`         | `core_api.update_subscription(id, param)` |

## Tokenization API (Gopay)

Base: Core API base URL.

| Action         | HTTP | Endpoint                             | SDK Method                             |
| -------------- | ---- | ------------------------------------ | -------------------------------------- |
| Link Account   | POST | `/v2/pay/account`                    | `core_api.link_payment_account(param)` |
| Get Account    | GET  | `/v2/pay/account/{accountId}`        | `core_api.get_payment_account(id)`     |
| Unlink Account | POST | `/v2/pay/account/{accountId}/unbind` | `core_api.unlink_payment_account(id)`  |

## Method Signature Quick Reference

```python
# Snap
snap.create_transaction(parameters=dict)              -> dict
snap.create_transaction_token(parameters=dict)        -> str
snap.create_transaction_redirect_url(parameters=dict)  -> str

# CoreApi
core_api.charge(parameters=dict)          -> dict
core_api.capture(parameters=dict)         -> dict
core_api.card_register(parameters=dict)   -> dict
core_api.card_token(parameters=dict)       -> dict
core_api.card_point_inquiry(token_id=str)  -> dict
core_api.create_subscription(parameters=dict)    -> dict
core_api.get_subscription(subscription_id=str)   -> dict
core_api.disable_subscription(subscription_id=str) -> dict
core_api.enable_subscription(subscription_id=str)  -> dict
core_api.update_subscription(subscription_id=str, parameters=dict) -> dict
core_api.link_payment_account(parameters=dict)    -> dict
core_api.get_payment_account(account_id=str)      -> dict
core_api.unlink_payment_account(account_id=str)   -> dict

# Transactions (on Snap or CoreApi instance)
api_client.transactions.status(transaction_id=str)                      -> dict
api_client.transactions.statusb2b(transaction_id=str)                   -> dict
api_client.transactions.approve(transaction_id=str)                     -> dict
api_client.transactions.deny(transaction_id=str)                        -> dict
api_client.transactions.cancel(transaction_id=str)                      -> dict
api_client.transactions.expire(transaction_id=str)                      -> dict
api_client.transactions.refund(transaction_id=str, parameters=dict)     -> dict
api_client.transactions.refundDirect(transaction_id=str, parameters=dict) -> dict
api_client.transactions.notification(notification=dict_or_str)          -> dict
```

## What's NOT in Python Client (as of v1.4.2)

- **SnapBi** - not bundled. Call REST APIs directly from Python.
- **Iris** - not bundled. Call REST APIs directly from Python.

For complete working Python code to call SnapBi (Direct Debit, VA, Qris) and Iris via direct REST:
→ **[Direct REST Calls for SnapBi & Iris](direct-rest-calls.md)** - copy-paste ready functions with signature generation

### SnapBi Endpoint Quick Reference

| Product             | Endpoint                                |
| ------------------- | --------------------------------------- |
| Access Token        | `POST /v1.0/access-token/b2b`           |
| Direct Debit Create | `POST /v1.0/debit/payment-host-to-host` |
| Direct Debit Status | `POST /v1.0/debit/status`               |
| Direct Debit Cancel | `POST /v1.0/debit/cancel`               |
| Direct Debit Refund | `POST /v1.0/debit/refund`               |
| VA Create           | `POST /v1.0/transfer-va/create-va`      |
| VA Status           | `POST /v1.0/transfer-va/status`         |
| VA Delete           | `POST /v1.0/transfer-va/delete-va`      |
| Qris Generate       | `POST /v1.0/qr/qr-mpm-generate`         |
| Qris Query          | `POST /v1.0/qr/qr-mpm-query`            |
| Qris Refund         | `POST /v1.0/qr/qr-mpm-refund`           |
| Qris Cancel         | `POST /v1.0/qr/qr-mpm-cancel`           |

Base URL: `https://merchants.sbx.midtrans.com` (sandbox) / `https://merchants.midtrans.com` (production)

### Iris Endpoint Quick Reference

| Action              | Endpoint                                               |
| ------------------- | ------------------------------------------------------ |
| Ping                | `GET /ping`                                            |
| Beneficiaries CRUD  | `POST/GET/PATCH /beneficiaries`                        |
| Payouts             | `POST /payouts`, `/payouts/approve`, `/payouts/reject` |
| Balance             | `GET /balance`                                         |
| Bank Accounts       | `GET /bank_accounts`                                   |
| Validate Account    | `GET /account_validation`                              |
| Transaction History | `GET /statements`                                      |
| Beneficiary Banks   | `GET /beneficiary_banks`                               |

Base URL: `https://app.sandbox.midtrans.com/iris/api/v1` (sandbox) / `https://app.midtrans.com/iris/api/v1` (production)

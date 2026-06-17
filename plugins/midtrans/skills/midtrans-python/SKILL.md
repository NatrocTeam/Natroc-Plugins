---
name: midtrans-python
description: >
  Integrate Midtrans payment gateway in Python backend applications.
  Covers Snap (popup/redirect), Core API (VT-Direct),
  subscriptions, and tokenization. Use this skill when building or
  debugging Midtrans payments in Python, or when the user mentions
  Midtrans, Snap token, Core API charge, payment notification
  handler, or the midtransclient PyPI package.
license: MIT
compatibility: Requires Python 3.5+, requests library, pip install midtransclient
---

# Midtrans Python Client

Official Python client for the Midtrans Payment API. Package: `midtransclient` (PyPI), version 1.4.2+.

## Quick Start

```bash
pip install midtransclient
```

```python
import midtransclient
import time

# Core API instance
core_api = midtransclient.CoreApi(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)

# Snap instance
snap = midtransclient.Snap(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)
```

All API methods return Python `dict` objects from JSON decoded responses.

## Configuration

`ApiConfig` stores `is_production`, `server_key`, `client_key`, `custom_headers`, `proxies`.

Pass them to the constructor or set later:

```python
# Re-set full config
snap.api_config.set(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)

# Re-set single property
snap.api_config.set(server_key='YOUR_SERVER_KEY')
snap.api_config.set(is_production=True)

# Set directly via attribute
snap.api_config.is_production = False
snap.api_config.server_key = 'YOUR_SERVER_KEY'
snap.api_config.client_key = 'YOUR_CLIENT_KEY'
```

### Base URLs (automatic based on `is_production`)

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
| **Subscription**  | Recurring payments (credit card, gopay).                                |
| **Tokenization**  | Link gopay account for recurring/subscription.                          |

**Default recommendation**: Use Snap unless the merchant needs full frontend control.

---

## Snap API

```python
snap = midtransclient.Snap(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)
```

### Methods

| Method                                       | Returns                                |
| -------------------------------------------- | -------------------------------------- |
| `create_transaction(parameter)`              | `dict` with `token` and `redirect_url` |
| `create_transaction_token(parameter)`        | `str` token                            |
| `create_transaction_redirect_url(parameter)` | `str` redirect_url                     |

### Create Transaction

```python
param = {
    'transaction_details': {
        'order_id': 'ORDER-' + str(int(time.time())),
        'gross_amount': 200000,
    },
    'credit_card': {'secure': True},
    'customer_details': {
        'first_name': 'Budi',
        'last_name': 'Susanto',
        'email': 'budi@example.com',
        'phone': '08123456789',
    },
    'item_details': [
        {'id': 'ITEM1', 'price': 100000, 'quantity': 2, 'name': 'Product A'},
    ],
}

transaction = snap.create_transaction(param)
# transaction['token'] → use on frontend
# transaction['redirect_url'] → redirect customer (Snap Redirect)
```

### Frontend (Snap JS)

Snap token from backend goes to frontend:

```html
<script
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key="YOUR_CLIENT_KEY"
></script>
<script>
  snap.pay("PUT_TRANSACTION_TOKEN_HERE", {
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

```python
core_api = midtransclient.CoreApi(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)
```

### Methods

| Method                         | Endpoint                       | HTTP |
| ------------------------------ | ------------------------------ | ---- |
| `charge(parameters)`           | `/v2/charge`                   | POST |
| `capture(parameters)`          | `/v2/capture`                  | POST |
| `card_register(parameters)`    | `/v2/card/register`            | GET  |
| `card_token(parameters)`       | `/v2/token`                    | GET  |
| `card_point_inquiry(token_id)` | `/v2/point_inquiry/{token_id}` | GET  |

### Credit Card Charge

```python
param = {
    'payment_type': 'credit_card',
    'transaction_details': {
        'order_id': 'test-transaction-' + str(int(time.time())),
        'gross_amount': 12145,
    },
    'credit_card': {
        'token_id': 'CREDIT_CARD_TOKEN',  # obtained from frontend
        'authentication': True,
    },
}

charge_response = core_api.charge(param)
# charge_response may contain 'redirect_url' for 3DS authentication
```

### Supported Payment Types for `charge()`

`credit_card`, `bank_transfer`, `gopay`, `shopeepay`, `qris`, `echannel`, `permata`, `bca_va`, `bni_va`, `bri_va`, `mandiri_va`, `cstore`, `akulaku`, `bri_epay`, `kredivo`.

---

## Subscription API

Recurring payments using saved card tokens or linked gopay accounts.

```python
core_api = midtransclient.CoreApi(
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)

# Create subscription (credit card)
param = {
    'name': 'SUBSCRIPTION-STARTER-1',
    'amount': '100000',
    'currency': 'IDR',
    'payment_type': 'credit_card',
    'token': 'SAVED_CARD_TOKEN_ID',  # from initial charge response
    'schedule': {
        'interval': 1,
        'interval_unit': 'month',
        'max_interval': 3,
        'start_time': '2025-10-01 07:25:01 +0700',
    },
    'metadata': {'description': 'Recurring payment for STARTER 1'},
    'customer_details': {
        'first_name': 'John A',
        'last_name': 'Doe A',
        'email': 'johndoe@email.com',
        'phone': '+62812345678',
    },
}

create_response = core_api.create_subscription(param)
subscription_id = create_response['id']

core_api.get_subscription(subscription_id)
core_api.disable_subscription(subscription_id)
core_api.enable_subscription(subscription_id)

update_param = {
    'name': 'SUBSCRIPTION-STARTER-1-UPDATE',
    'amount': '100000',
    'currency': 'IDR',
    'token': 'SAVED_CARD_TOKEN_ID',
    'schedule': {'interval': 1},
}
core_api.update_subscription(subscription_id, update_param)
```

## Tokenization API (Gopay)

```python
# Link gopay account
param = {
    'payment_type': 'gopay',
    'gopay_partner': {
        'phone_number': '81234567891',
        'country_code': '62',
        'redirect_url': 'https://mywebstore.com/gopay-linking-finish',
    },
}

link_response = core_api.link_payment_account(param)
core_api.get_payment_account(account_id)
core_api.unlink_payment_account(account_id)
```

---

## Transaction Actions (Shared)

Both Snap and CoreApi instances share the `transactions` object:

```python
api_client = midtransclient.CoreApi(  # or Snap
    is_production=False,
    server_key='YOUR_SERVER_KEY',
    client_key='YOUR_CLIENT_KEY',
)

api_client.transactions.status('ORDER_ID_OR_TRANSACTION_ID')
api_client.transactions.statusb2b('ORDER_ID')
api_client.transactions.approve('ORDER_ID')
api_client.transactions.deny('ORDER_ID')
api_client.transactions.cancel('ORDER_ID')
api_client.transactions.expire('ORDER_ID')
api_client.transactions.refund('ORDER_ID', {
    'refund_key': 'order1-ref1',
    'amount': 5000,
    'reason': 'Item out of stock',
})
api_client.transactions.refundDirect('ORDER_ID', {
    'refund_key': 'order1-ref1',
    'amount': 5000,
    'reason': 'Item out of stock',
})
```

---

## HTTP Notification Handler

**CRITICAL**: Never rely solely on frontend callbacks for transaction status. Always use HTTP notification webhook.

```python
# In your web framework endpoint (Flask example):
from flask import request
import midtransclient

@app.route('/midtrans-notification', methods=['POST'])
def midtrans_notification():
    notification_json = request.get_json()

    api_client = midtransclient.CoreApi(
        is_production=False,
        server_key='YOUR_SERVER_KEY',
        client_key='YOUR_CLIENT_KEY',
    )

    status_response = api_client.transactions.notification(notification_json)

    order_id = status_response['order_id']
    transaction_status = status_response['transaction_status']
    fraud_status = status_response.get('fraud_status')

    # --- Status handling template ---
    if transaction_status == 'capture':
        if fraud_status == 'challenge':
            pass  # TODO: set DB status to 'challenge'
        elif fraud_status == 'accept':
            pass  # TODO: set DB status to 'success'
    elif transaction_status == 'settlement':
        pass  # TODO: set DB status to 'success'
    elif transaction_status in ('cancel', 'deny', 'expire'):
        pass  # TODO: set DB status to 'failure'
    elif transaction_status == 'pending':
        pass  # TODO: set DB status to 'pending'

    return 'OK', 200
```

The `notification()` method:

1. Parses the JSON body (accepts `dict` or `str`)
2. Extracts `transaction_id`
3. Calls `status()` and returns the response

---

## Error Handling

API errors raise `MidtransAPIError`. JSON decode errors raise `JSONDecodeError`.

```python
from midtransclient.error_midtrans import MidtransAPIError, JSONDecodeError

try:
    transaction = snap.create_transaction(param)
except MidtransAPIError as e:
    e.message               # error message string
    e.api_response_dict      # decoded JSON response
    e.http_status_code       # HTTP status code (int)
    e.raw_http_client_data   # raw requests Response object
except JSONDecodeError as e:
    # Handle malformed JSON response
    pass
```

---

## Advanced

### Custom HTTP Headers

```python
snap.api_config.custom_headers = {
    'my-custom-header': 'my value',
    'x-override-notification': 'https://example.org',
}
```

### Override/Append Notification URL

```python
snap.api_config.custom_headers = {
    'x-override-notification': 'https://example.org',
}

# or append:
snap.api_config.custom_headers = {
    'x-append-notification': 'https://example.org',
}
```

### Custom HTTP Proxy

```python
snap.api_config.proxies = {
    'http': 'http://10.10.1.10:3128',
    'https': 'http://10.10.1.10:1080',
}
```

Under the hood, the library uses the `requests` module. The proxies dict is passed directly to `requests.request(proxies=...)`.

---

## Gotchas

- **Server-side only**: Never use this library in browser/frontend code. ServerKey would be exposed.
- **Python 3.5+**: Python 2 is not supported since v1.3.0.
- **Only IDR supported** for most payment methods.
- **`dict` returns**: All API methods return Python dicts, not objects with attributes. Access via `response['key']`, not `response.key`.
- **`notification()` method accepts `dict` or JSON `str`**: Both are valid. The method auto-parses strings.
- **Core API `card_register` and `card_token` are GET requests** - parameters go as query params, not JSON body.
- **`refund_key` must be unique** per refund request.
- **Credit card 3DS**: After `charge()`, check for `redirect_url` in the response. Redirect customer for 3DS authentication.
- **`ApiConfig.set()` with `None`**: Only provided non-None values are updated. `set(is_production=None)` leaves `is_production` unchanged.
- **`requests` library HTTP Basic Auth**: Server key is sent as username with empty password via `HTTPBasicAuth(server_key, '')`.
- **Subscription `start_time` format**: `"YYYY-MM-DD HH:mm:ss +0700"` (with timezone).
- **No SnapBi in Python client (as of v1.4.2)**: Use Node.js or PHP client for SnapBi Direct Debit, VA, and Qris. Alternatively, call the SnapBi REST API directly - see [Direct REST Calls for SnapBi & Iris](./references/direct-rest-calls.md).
- **No Iris in Python client**: Use Node.js client for Iris disbursement API. Alternatively, call the Iris REST API directly - see [Direct REST Calls for SnapBi & Iris](./references/direct-rest-calls.md).
- **`proxies` dict follows `requests` library format**: Same structure as `requests.request(proxies=...)`.

---

## SnapBi & Iris via Direct REST (Python)

Python client v1.4.2 does not bundle SnapBi or Iris, but you can call them directly using the `requests` library with the same base URLs and authentication patterns. Full step-by-step guide with signature generation code, headers, and request body examples:

→ **[Direct REST Calls for SnapBi & Iris](./references/direct-rest-calls.md)**

---

## Reference Files

- [API Endpoints Reference](./references/api-endpoints.md) - full endpoint catalog with Python method signatures
- [Direct REST Calls for SnapBi & Iris](./references/direct-rest-calls.md) - call SnapBi and Iris APIs directly from Python
- [Gotchas & Edge Cases](./references/gotchas.md) - detailed pitfalls and solutions

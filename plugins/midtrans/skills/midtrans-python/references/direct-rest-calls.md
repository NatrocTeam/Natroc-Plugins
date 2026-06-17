# Python: Direct REST Calls for SnapBi & Iris

The `midtransclient` Python package (v1.4.2) does not include SnapBi or Iris. Use the `requests` library to call these APIs directly. This reference provides complete, copy-paste ready code.

## Prerequisites

```bash
pip install requests
```

```python
import requests
import json
import hashlib
import hmac
import base64
from datetime import datetime, timezone, timedelta
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key
from cryptography.hazmat.backends import default_backend
```

For RSA signing, install `cryptography`:

```bash
pip install cryptography
```

---

## SnapBi Configuration

```python
# SnapBi Config
SNAPBI_IS_PRODUCTION = False
SNAPBI_CLIENT_ID = 'YOUR_CLIENT_ID'
SNAPBI_PRIVATE_KEY = '''-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT
-----END PRIVATE KEY-----'''
SNAPBI_CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
SNAPBI_PARTNER_ID = 'YOUR_PARTNER_ID'
SNAPBI_CHANNEL_ID = 'YOUR_CHANNEL_ID'
SNAPBI_PUBLIC_KEY = '''-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_CONTENT
-----END PUBLIC KEY-----'''

SNAPBI_BASE_URL = (
    'https://merchants.midtrans.com' if SNAPBI_IS_PRODUCTION
    else 'https://merchants.sbx.midtrans.com'
)
```

---

## Step 1: Get B2B Access Token

```python
def get_asymmetric_signature(client_id, timestamp_str, private_key_pem):
    """Generate RSA-SHA256 signature for access token request."""
    string_to_sign = f"{client_id}|{timestamp_str}"
    private_key = load_pem_private_key(
        private_key_pem.encode(), password=None, backend=default_backend()
    )
    signature = private_key.sign(
        string_to_sign.encode(),
        padding.PKCS1v15(),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode()


def get_access_token():
    """Obtain B2B access token from SnapBi."""
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S+00:00')
    signature = get_asymmetric_signature(
        SNAPBI_CLIENT_ID, timestamp, SNAPBI_PRIVATE_KEY
    )

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CLIENT-KEY': SNAPBI_CLIENT_ID,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
    }

    body = {'grant_type': 'client_credentials'}

    response = requests.post(
        f'{SNAPBI_BASE_URL}/v1.0/access-token/b2b',
        headers=headers,
        json=body,
    )

    data = response.json()
    return data['accessToken']  # returns the access token string
```

---

## Step 2: Generate Symmetric Signature (HMAC-SHA512)

Used for ALL SnapBi transactional API calls:

```python
def get_symmetric_signature(method, path, access_token, request_body, client_secret, timestamp):
    """Generate HMAC-SHA512 signature for SnapBi transactional requests."""
    # Minify and hash the body
    minified_body = json.dumps(request_body, separators=(',', ':'))
    hashed_body = hashlib.sha256(minified_body.encode()).hexdigest().lower()

    # Build payload
    payload = f"{method.upper()}:{path}:{access_token}:{hashed_body}:{timestamp}"

    # HMAC-SHA512
    hmac_digest = hmac.new(
        client_secret.encode(), payload.encode(), hashlib.sha512
    ).digest()

    return base64.b64encode(hmac_digest).decode()


def build_snapbi_headers(access_token, external_id, api_path, request_body):
    """Build complete SnapBi transactional headers."""
    timestamp = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S+00:00')
    signature = get_symmetric_signature(
        'POST', api_path, access_token, request_body,
        SNAPBI_CLIENT_SECRET, timestamp
    )

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}',
        'X-PARTNER-ID': SNAPBI_PARTNER_ID,
        'X-EXTERNAL-ID': external_id,
        'CHANNEL-ID': SNAPBI_CHANNEL_ID,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
    }
    return headers
```

---

## Direct Debit (Gopay/Dana/Shopeepay)

```python
def direct_debit_create_payment(external_id, pay_method='GOPAY'):
    """Create Direct Debit payment."""
    access_token = get_access_token()

    api_path = '/v1.0/debit/payment-host-to-host'
    request_body = {
        'partnerReferenceNo': external_id,
        'chargeToken': '',
        'merchantId': 'YOUR_MERCHANT_ID',
        'urlParam': {
            'url': 'https://your-site.com/callback',
            'type': 'PAY_RETURN',
            'isDeeplink': 'N',
        },
        'validUpTo': '2030-07-20T20:34:15.452305Z',
        'payOptionDetails': [{
            'payMethod': pay_method,       # GOPAY, DANA, SHOPEEPAY
            'payOption': f'{pay_method}_WALLET',
            'transAmount': {'value': '1500', 'currency': 'IDR'},
        }],
        'additionalInfo': {
            'customerDetails': {
                'firstName': 'Budi', 'lastName': 'Susanto',
                'email': 'budi@example.com', 'phone': '+62812345678',
                'billingAddress': {
                    'firstName': 'Budi', 'lastName': 'Susanto',
                    'phone': '+62812345678', 'address': 'Jl. Sudirman',
                    'city': 'Jakarta', 'postalCode': '12160', 'countryCode': 'IDN',
                },
            },
            'items': [{
                'id': '1', 'price': {'value': '1500.00', 'currency': 'IDR'},
                'quantity': 1, 'name': 'Test Item',
                'brand': 'Test Brand', 'category': 'Test',
                'merchantName': 'Merchant Name',
            }],
        },
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def direct_debit_get_status(external_id, original_ref_no=None, original_external_id=None):
    """Get Direct Debit transaction status."""
    access_token = get_access_token()
    api_path = '/v1.0/debit/status'

    if original_ref_no:
        request_body = {'originalReferenceNo': original_ref_no, 'serviceCode': '54'}
    else:
        request_body = {'originalExternalId': original_external_id, 'serviceCode': '54'}

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def direct_debit_cancel(external_id, original_ref_no=None, original_external_id=None):
    """Cancel Direct Debit transaction."""
    access_token = get_access_token()
    api_path = '/v1.0/debit/cancel'

    if original_ref_no:
        request_body = {'originalReferenceNo': original_ref_no}
    else:
        request_body = {'originalExternalId': original_external_id}

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def direct_debit_refund(external_id, original_ref_no=None, original_external_id=None,
                         amount='100.00', reason='refund reason'):
    """Refund Direct Debit transaction."""
    access_token = get_access_token()
    api_path = '/v1.0/debit/refund'

    request_body = {
        'reason': reason,
        'refundAmount': {'value': amount, 'currency': 'IDR'},
    }
    if original_ref_no:
        request_body['originalReferenceNo'] = original_ref_no
    else:
        request_body['originalExternalId'] = original_external_id
        request_body['partnerRefundNo'] = f'refund-{external_id}'

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()
```

---

## VA (Bank Transfer)

```python
def va_create_payment(external_id, bank='bca'):
    """Create Virtual Account payment."""
    access_token = get_access_token()
    api_path = '/v1.0/transfer-va/create-va'

    customer_va_no = '6280123456'
    request_body = {
        'partnerServiceId': '   70012',
        'customerNo': customer_va_no,
        'virtualAccountNo': f'   70012{customer_va_no}',
        'virtualAccountName': 'Budi Susanto',
        'virtualAccountEmail': 'budi@example.com',
        'virtualAccountPhone': '6281828384858',
        'trxId': external_id,
        'totalAmount': {'value': '10000.00', 'currency': 'IDR'},
        'expiredDate': '2030-07-20T20:50:04Z',
        'additionalInfo': {
            'merchantId': 'YOUR_MERCHANT_ID',
            'bank': bank,  # bca, mandiri, bni, bri, permata
            'flags': {'shouldRandomizeVaNumber': False},
            'customerDetails': {
                'firstName': 'Budi', 'lastName': 'Susanto',
                'email': 'budi@example.com', 'phone': '+6281828384858',
                'billingAddress': {
                    'firstName': 'Budi', 'lastName': 'Susanto',
                    'address': 'Jl. Kalibata', 'city': 'Jakarta',
                    'postalCode': '12190', 'phone': '+6281828384858',
                    'countryCode': 'IDN',
                },
            },
            'items': [{
                'id': 'a1', 'price': {'value': '1000.00', 'currency': 'IDR'},
                'quantity': 3, 'name': 'Apel', 'brand': 'Fuji Apple',
                'category': 'Fruit', 'merchantName': 'Fruit-store',
            }],
        },
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def va_get_status(external_id, partner_service_id='   70012',
                   customer_no='6280123456'):
    """Get VA transaction status."""
    access_token = get_access_token()
    api_path = '/v1.0/transfer-va/status'

    request_body = {
        'partnerServiceId': partner_service_id,
        'customerNo': customer_no,
        'virtualAccountNo': f'{partner_service_id}{customer_no}',
        'inquiryRequestId': external_id,
        'additionalInfo': {'merchantId': 'YOUR_MERCHANT_ID'},
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def va_cancel(external_id, partner_service_id='   70012',
               customer_no='6280123456'):
    """Cancel/delete VA."""
    access_token = get_access_token()
    api_path = '/v1.0/transfer-va/delete-va'

    request_body = {
        'partnerServiceId': partner_service_id,
        'customerNo': customer_no,
        'virtualAccountNo': f'{partner_service_id}{customer_no}',
        'trxId': external_id,
        'additionalInfo': {'merchantId': 'YOUR_MERCHANT_ID'},
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()
```

---

## Qris

```python
def qris_create_payment(external_id, acquirer='gopay'):
    """Create Qris payment (QR MPM Generate)."""
    access_token = get_access_token()
    api_path = '/v1.0/qr/qr-mpm-generate'

    request_body = {
        'partnerReferenceNo': external_id,
        'merchantId': 'YOUR_MERCHANT_ID',
        'amount': {'value': '1500.00', 'currency': 'IDR'},
        'validityPeriod': '2030-07-03T12:08:56-07:00',
        'additionalInfo': {
            'acquirer': acquirer,  # gopay, dana, shopeepay
            'customerDetails': {
                'firstName': 'Merchant', 'lastName': 'Operation',
                'email': 'merchant@example.com', 'phone': '+6281932358123',
            },
            'items': [{
                'id': '8143fc4f-ec05-4c55-92fb-620c212f401e',
                'price': {'value': '1500.00', 'currency': 'IDR'},
                'quantity': 1, 'name': 'test item',
                'brand': 'test brand', 'category': 'test category',
                'merchantName': 'Merchant Operation',
            }],
            'countryCode': 'ID',
            'locale': 'id_ID',
        },
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def qris_get_status(external_id, original_ref_no, original_partner_ref_no):
    """Query Qris payment status."""
    access_token = get_access_token()
    api_path = '/v1.0/qr/qr-mpm-query'

    request_body = {
        'originalReferenceNo': original_ref_no,
        'originalPartnerReferenceNo': original_partner_ref_no,
        'merchantId': 'YOUR_MERCHANT_ID',
        'serviceCode': '54',
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def qris_cancel(external_id, original_ref_no, reason='cancel reason'):
    """Cancel Qris payment."""
    access_token = get_access_token()
    api_path = '/v1.0/qr/qr-mpm-cancel'

    request_body = {
        'originalReferenceNo': original_ref_no,
        'merchantId': 'YOUR_MERCHANT_ID',
        'reason': reason,
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()


def qris_refund(external_id, original_ref_no, original_partner_ref_no,
                 amount='100.00', reason='refund reason'):
    """Refund Qris payment."""
    access_token = get_access_token()
    api_path = '/v1.0/qr/qr-mpm-refund'

    request_body = {
        'merchantId': 'YOUR_MERCHANT_ID',
        'originalPartnerReferenceNo': original_partner_ref_no,
        'originalReferenceNo': original_ref_no,
        'partnerRefundNo': f'refund-{external_id}',
        'reason': reason,
        'refundAmount': {'value': amount, 'currency': 'IDR'},
    }

    headers = build_snapbi_headers(access_token, external_id, api_path, request_body)

    response = requests.post(
        f'{SNAPBI_BASE_URL}{api_path}',
        headers=headers,
        json=request_body,
    )
    return response.json()
```

---

## SnapBi Webhook Verification

```python
def verify_snapbi_webhook(payload_dict, signature, timestamp, notification_url_path):
    """Verify SnapBi webhook notification signature.

    Args:
        payload_dict: The JSON body as a Python dict
        signature: X-Signature header value
        timestamp: X-Timestamp header value
        notification_url_path: e.g., '/v1.0/debit/notify'

    Returns:
        bool: True if signature is valid
    """
    from cryptography.hazmat.primitives.serialization import load_pem_public_key

    # Minify and hash
    minified_body = json.dumps(payload_dict, separators=(',', ':'))
    hashed_body = hashlib.sha256(minified_body.encode()).hexdigest().lower()

    # Build raw string
    raw_string = f"POST:{notification_url_path}:{hashed_body}:{timestamp}"

    # Verify
    public_key = load_pem_public_key(SNAPBI_PUBLIC_KEY.encode(), backend=default_backend())

    try:
        public_key.verify(
            base64.b64decode(signature),
            raw_string.encode(),
            padding.PKCS1v15(),
            hashes.SHA256(),
        )
        return True
    except Exception:
        return False
```

---

## Iris Disbursement API

Iris uses simple Basic Auth (API key as username, empty password). No RSA/HMAC signing needed.

```python
IRIS_IS_PRODUCTION = False
IRIS_API_KEY = 'YOUR_IRIS_API_KEY'

IRIS_BASE_URL = (
    'https://app.midtrans.com/iris/api/v1' if IRIS_IS_PRODUCTION
    else 'https://app.sandbox.midtrans.com/iris/api/v1'
)


def iris_request(method, path, body=None):
    """Make an Iris API request."""
    url = f'{IRIS_BASE_URL}{path}'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }

    response = requests.request(
        method=method,
        url=url,
        auth=(IRIS_API_KEY, ''),  # Basic Auth with empty password
        headers=headers,
        json=body if method != 'GET' else None,
        params=body if method == 'GET' else None,
    )
    return response.json()


# --- Iris Examples ---

def iris_ping():
    """Health check."""
    return iris_request('GET', '/ping')


def iris_create_beneficiary(name, account, bank, alias_name, email):
    """Register a beneficiary account."""
    return iris_request('POST', '/beneficiaries', {
        'name': name,
        'account': account,
        'bank': bank,
        'alias_name': alias_name,
        'email': email,
    })


def iris_get_beneficiaries():
    """List all beneficiaries."""
    return iris_request('GET', '/beneficiaries')


def iris_update_beneficiary(alias_name, updates):
    """Update a beneficiary."""
    return iris_request('PATCH', f'/beneficiaries/{alias_name}', updates)


def iris_create_payouts(payouts):
    """Create payouts.

    Args:
        payouts: list of dicts, each with:
            beneficiary_name, amount, notes
    """
    return iris_request('POST', '/payouts', {'payouts': payouts})


def iris_approve_payouts(reference_nos):
    """Approve payouts by reference numbers."""
    return iris_request('POST', '/payouts/approve', {'reference_nos': reference_nos})


def iris_reject_payouts(reference_nos):
    """Reject payouts by reference numbers."""
    return iris_request('POST', '/payouts/reject', {'reference_nos': reference_nos})


def iris_get_payout_details(reference_no):
    """Get payout status."""
    return iris_request('GET', f'/payouts/{reference_no}')


def iris_get_balance():
    """Check Iris balance."""
    return iris_request('GET', '/balance')


def iris_get_beneficiary_banks():
    """List supported banks for beneficiaries."""
    return iris_request('GET', '/beneficiary_banks')


def iris_validate_bank_account(bank, account):
    """Validate a bank account number."""
    return iris_request('GET', '/account_validation', {
        'bank': bank,
        'account': account,
    })


def iris_get_transaction_history(from_date=None, to_date=None):
    """Get transaction statement/history."""
    body = {}
    if from_date:
        body['from_date'] = from_date  # YYYY-MM-DD
    if to_date:
        body['to_date'] = to_date       # YYYY-MM-DD
    # Note: Iris /statements is GET but uses JSON body (non-standard)
    url = f'{IRIS_BASE_URL}/statements'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
    response = requests.get(
        url,
        auth=(IRIS_API_KEY, ''),
        headers=headers,
        json=body,  # JSON body on GET - Iris-specific
    )
    return response.json()
```

---

## Notification Paths (Webhook URLs)

| Payment Method | Notification URL Path      |
| -------------- | -------------------------- |
| Direct Debit   | `/v1.0/debit/notify`       |
| VA             | `/v1.0/transfer-va/notify` |
| Qris           | `/v1.0/qr/qr-mpm-notify`   |

---

## Gotchas for Direct REST Calls

1. **`cryptography` library required** for RSA signing. Install with `pip install cryptography`.
2. **Private key must be PEM format** with actual newline characters (`\n`). Use triple-quoted strings or load from file.
3. **Signature is always POST** for SnapBi transactional calls - regardless of the actual HTTP method used.
4. **HMAC-SHA512 uses base64 output**, not hex. Use `base64.b64encode()` not `.hex()`.
5. **Body minification for hashing**: Use `json.dumps(body, separators=(',', ':'))` - no spaces after colons or commas.
6. **Iris `/statements` is GET with JSON body** - non-standard but this is how the Iris API works. Pass the body via the `json=` parameter on `requests.get()`.
7. **Timestamp must be ISO 8601 with timezone**: Format `'%Y-%m-%dT%H:%M:%S+00:00'`.
8. **VA partnerServiceId has leading spaces** - this is intentional for bank formatting.
9. **Access token expires** - requests may return 401. Get a fresh token and retry.

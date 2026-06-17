# Gotchas & Edge Cases - Midtrans Python

## Security

1. **Never use `midtransclient` on frontend/browser code**. The library does server-to-server API calls. Using it in client-facing code exposes your ServerKey. Use Snap JS (`snap.js`) on frontend instead.

2. **Always verify via HTTP notification**. Do not update transaction status in your DB from frontend callbacks (`onSuccess`, `onPending`, `onError`). Only the HTTP notification webhook guarantees authenticity. Frontend callbacks are not cryptographically verified.

3. **Basic auth uses server_key as username, empty password**. The `HttpClient` sends `HTTPBasicAuth(server_key, '')`. This translates to `Authorization: Basic base64(server_key:)`.

## API Behavior

4. **All methods return `dict`, not objects**. Access response data with bracket notation: `response['order_id']`, not `response.order_id`. This differs from the PHP SDK which returns objects.

5. **Core API `card_register` and `card_token` are GET requests**. Parameters go as query strings, not JSON body. The SDK handles this - pass a `dict` and it will be sent as `params` in GET mode.

6. **`notification()` accepts `dict` or JSON `str`**. The method auto-detects string input and calls `json.loads()`. Both work:

   ```python
   api_client.transactions.notification(request.get_json())   # dict
   api_client.transactions.notification(request.get_data(as_text=True))  # str
   ```

7. **Status code 407 is not an error**. Expired transactions return 407 from get-status API. The `HttpClient` skips the error raise when `status_code == 407` inside the response body.

8. **`ApiConfig.set()` with `None` leaves value unchanged**. This is a soft-set pattern:
   ```python
   snap.api_config.set(server_key='new_key')  # only changes server_key
   snap.api_config.set(is_production=None)    # is_production unchanged
   ```

## Currency & Amount

9. **Only IDR is supported** for most payment methods. The `currency` field must be `"IDR"`.

10. **Gross amount must be integer in IDR**. Midtrans v1 and v2 accept integers only. If your system uses non-IDR currency: convert to IDR first, then round.

## Snap

11. **Snap methods return dict, not object**. Access `transaction['token']` and `transaction['redirect_url']` with bracket notation.

12. **Snap JS URL depends on environment**: Sandbox: `https://app.sandbox.midtrans.com/snap/snap.js`, Production: `https://app.midtrans.com/snap/snap.js`.

13. **Both `dict` and JSON `str` accepted as parameters**. The `HttpClient` auto-parses string parameters with `json.loads()`. Invalid JSON raises `JSONDecodeError`.

## Core API

14. **Credit card 3DS may return `redirect_url`**. After `charge()`, check `response.get('redirect_url')`. Redirect customer there for 3DS authentication.

15. **`card_register` and `card_token` use `client_key` authentication**. All other Core API methods use `server_key`.

16. **`card_point_inquiry` takes `token_id` as a string, not a dict**. Unlike other methods, the parameter is positional:
    ```python
    core_api.card_point_inquiry('token-id-string')  # correct
    core_api.card_point_inquiry({'token_id': '...'})  # wrong
    ```

## Subscription & Tokenization

17. **Subscription requires saved token**. For credit card: `saved_token_id` from initial charge. For gopay: link account via tokenization API first.

18. **`start_time` format**: `"YYYY-MM-DD HH:mm:ss +0700"` with timezone offset.

## Transaction Actions

19. **`notification()` is a convenience method**. It extracts `transaction_id` from the notification JSON and calls `status()`. It is not cryptographic verification.

20. **`refund_key` must be unique**. Cannot reuse the same key for different refunds.

21. **`refundDirect` has capital D**: `api_client.transactions.refundDirect()`. Follow the exact casing - Python method names in this library use camelCase for transaction actions.

## HTTP & Network

22. **Underlying HTTP client is `requests`**. The `HttpClient` wraps `requests.request()`. You can inspect `http_client.http_client` for the raw `requests` module.

23. **Custom headers are merged, not replaced**. `custom_headers` dict is merged with default headers (`content-type`, `accept`, `user-agent`). Custom values with the same key override defaults.

24. **Proxies use `requests` format**:

    ```python
    {'http': 'http://proxy:3128', 'https': 'http://proxy:1080'}
    ```

    Passed directly to `requests.request(proxies=...)`. See [requests proxy docs](https://requests.readthedocs.io/en/master/user/advanced/#proxies).

25. **No built-in retry or timeout configuration**. The `requests` library defaults apply. For custom timeout/retry, configure on the `requests` adapter or use a custom session.

26. **`allow_redirects=True`** by default on all HTTP requests.

## Python-Specific

27. **Python 3.5+ only**. Python 2 support was dropped in v1.3.0. Check your environment.

28. **Version available as `midtransclient.__version__`**: `'1.4.2'`.

29. **Missing features compared to Node.js/PHP**:
    - No SnapBi (Direct Debit, VA, Qris)
    - No Iris disbursement
      → Use the complete Python functions in **[Direct REST Calls for SnapBi & Iris](direct-rest-calls.md)** - includes RSA-SHA256 signing, HMAC-SHA512 generation, and copy-paste ready code for all SnapBi and Iris operations.

30. **`JSONDecodeError` is separate from `MidtransAPIError`**. Catch both if you want full coverage:

    ```python
    from midtransclient.error_midtrans import MidtransAPIError, JSONDecodeError
    try:
        response = snap.create_transaction(param)
    except MidtransAPIError as e:
        # API returned error status
    except JSONDecodeError as e:
        # Response body is not valid JSON
    ```

31. **Property setters use name mangling**. The `ApiConfig` class uses `@property` decorators with `__private` names. Direct attribute access works: `snap.api_config.is_production = True`.

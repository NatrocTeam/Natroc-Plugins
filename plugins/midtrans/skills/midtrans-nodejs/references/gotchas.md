# Gotchas & Edge Cases - Midtrans Node.js

## Security

1. **Never use `midtrans-client` on frontend/browser JS**. The library does server-to-server API calls. Using it on frontend exposes your ServerKey. Use Snap JS (`snap.js`) on frontend instead.

2. **Always verify via HTTP notification**. Do not update transaction status in your DB from frontend callbacks (`onSuccess`, `onPending`, `onError`). Only the HTTP notification webhook guarantees authenticity. Frontend callbacks can be spoofed.

3. **Basic auth uses serverKey as username, empty password**. The HTTP client sends `Authorization: Basic base64(serverKey:)` - serverKey as username with colon, no password.

## API Behavior

4. **Core API `cardRegister` and `cardToken` are GET requests** - not POST. Parameters go in the query string. The SDK handles this correctly, but if you're debugging, check the query string not the body.

5. **Iris `getTransactionHistory` uses GET with JSON body**. This is non-standard HTTP but the Iris API expects it. The SDK passes it as the second param to the HTTP request (GET uses first param as query, second as body).

6. **Status code 407 is not an error**. The `get-status` API returns 407 for expired transactions. The SDK's `HttpClient` treats 407 as a valid response (not rejected). This is intentional.

7. **SnapBi access tokens are cached per instance**. If you reuse the same `SnapBi` chain object, the access token is stored in `this.accessToken` and reused. Create a fresh chain for a new token.

8. **SnapBi signature generation is method-hardcoded to POST**. All SnapBi transactional calls use POST method for HMAC signature generation regardless of the actual HTTP method.

## Currency & Amount

9. **Only IDR is supported** for most payment methods. The `currency` field must be `"IDR"`.

10. **Gross amount must be an integer in IDR** (no decimals). Midtrans `v1` and `v2` accept integer only. If your system uses non-IDR currency, convert and round after conversion, never before.

## Snap

11. **Snap `createTransaction` auto-calculates gross_amount** from `item_details` if present. If you also provide `transaction_details.gross_amount`, the calculated sum overrides it only when `item_details` exists.

12. **Snap JS URL depends on environment**: sandbox uses `https://app.sandbox.midtrans.com/snap/snap.js`, production uses `https://app.midtrans.com/snap/snap.js`.

## Core API

13. **Credit card 3DS may return `redirect_url`**. After `charge()`, check for `redirect_url` in the response - the customer must complete 3DS authentication on that URL.

14. **`cardRegister` uses `clientKey` auth, not `serverKey`**. All other Core API methods use `serverKey` for Basic Auth.

15. **`cardToken` also uses `clientKey` auth**. Same pattern as `cardRegister`.

16. **Subscription and tokenization methods are on `CoreApi`, not a separate class**. Use `coreApi.createSubscription()`, `coreApi.linkPaymentAccount()`, etc. - all live on the CoreApi instance, not on Snap.

## SnapBi

16. **Private key must include `\n` newlines in the string**. The private key is a PEM-formatted string. Use template literals or `\n` for line breaks.

17. **Public key is only needed for webhook verification**. If you're not verifying webhooks, you don't need to set `snapBiPublicKey`.

18. **VA `partnerServiceId` and `virtualAccountNo` have leading spaces** in examples. This is intentional for certain bank formats. Match the Midtrans documentation format exactly.

19. **`validUpTo`/`expiredDate` must be ISO 8601 with timezone**. Format: `"2030-07-20T20:34:15.452305Z"`. Invalid format causes API rejection.

20. **SnapBi `refund` is only available for Direct Debit and Qris**. VA does not support refund via this API.

## Subscription

21. **Subscription requires saved token from initial charge**. For credit card subscriptions, you need the `saved_token_id` from the first successful charge response. For gopay subscriptions, link the account via tokenization API first.

22. **Subscription start_time format**: `"YYYY-MM-DD HH:mm:ss +0700"` (with timezone offset).

## Transaction Actions

23. **`transaction.notification()` is just a wrapper** that calls `transaction.status()` using the `transaction_id` from the notification JSON body.

24. **`refund_key` must be unique per refund**. The same refund_key cannot be reused.

## HTTP Client

25. **Axios instance is accessible** via `client.httpClient.http_client`. You can add interceptors, change timeout, add default headers.

26. **Custom headers for notification override**: Set `X-Override-Notification` or `X-Append-Notification` headers on the Axios defaults to override/add notification URLs per transaction.

# Gotchas & Edge Cases - Midtrans PHP

## Security

1. **Never use ServerKey on frontend**. Config is server-side only. ServerKey exposed = compromised account.

2. **Always verify via HTTP notification**. Do not update transaction status from frontend callbacks. Only the `\Midtrans\Notification` handler provides authentic status. Frontend callbacks are not cryptographically verified.

3. **Basic auth is `serverKey:` (with colon, no password)**. The ApiRequestor sends `Authorization: Basic base64(serverKey:)`.

## Configuration

4. **Config is global static**. `\Midtrans\Config` properties are static. Changing them mid-request affects all subsequent calls in the same PHP process.

5. **`$isSanitized` is false by default**. Enable it to auto-validate and clean request params. Without it, invalid data may cause cryptic API errors.

6. **`$is3ds` is false by default**. Enable for credit card 3DS authentication. When enabled, `Snap::createTransaction()` adds `'secure' => true` to `credit_card` params.

7. **Override takes precedence over Append**. If both `$overrideNotifUrl` and `$appendNotifUrl` are set, only `$overrideNotifUrl` is used.

8. **Max 3 notification URLs** each for append and override.

## API Behavior

9. **`Snap::createTransaction()` auto-calculates gross_amount**: When `item_details` is present, it sums `quantity × price` and overrides `transaction_details.gross_amount`. This is done before sanitization.

10. **Core API `cardRegister` and `cardToken` use `clientKey` auth**, not `serverKey`. The SDK constructs the auth header with `base64_encode(clientKey . ':')`. All other methods use `serverKey`.

11. **Status code 407 is not an error**. Expired transactions return 407 from get-status API. The `ApiRequestor` skips the error check for status_code 407 (`!= 407` condition).

12. **SnapBi access tokens expire**. The SDK auto-refreshes when no token is set. If you reuse a saved token via `->withAccessToken()`, ensure it's still valid.

13. **SnapBi timestamp must be ISO 8601**. The constructor sets `$this->timeStamp = date('c')`. Set the timezone first: `date_default_timezone_set('Asia/Jakarta')`.

## Currency & Amount

14. **Only IDR is supported** for most payment methods. The `currency` field must be `"IDR"`.

15. **Gross amount must be integer in IDR**. Midtrans v1 and v2 accept integer only. If your system uses non-IDR currency: convert to IDR, then round.

## Snap

16. **`$is3ds` must be set before calling Snap methods**. When enabled, the SDK merges `['credit_card' => ['secure' => true]]` into every Snap transaction.

17. **Snap JS URL differs per environment**: Sandbox: `https://app.sandbox.midtrans.com/snap/snap.js`, Production: `https://app.midtrans.com/snap/snap.js`.

## Core API

18. **`cardRegister` and `cardToken` are GET requests** with query parameters. Build the query string from card_number, exp_month, exp_year, cvv, and client_key. The SDK handles this internally.

19. **Credit card 3DS redirect**: After `charge()`, check response for `redirect_url`. Redirect the customer's browser there for 3DS authentication.

## SnapBi

20. **Private key must include actual newline characters**. The PEM private key string in `Config::$snapBiPrivateKey` must contain real `\n` line breaks, not literal backslash-n.

21. **Public key is only needed for webhook verification**. Set `Config::$snapBiPublicKey` only if you verify webhooks.

22. **VA IDs have leading spaces**. `partnerServiceId` and `virtualAccountNo` in examples have leading spaces - this is intentional for bank formats. Match exactly.

23. **`validUpTo`/`expiredDate` must be ISO 8601 with timezone**. Use `date('c')` or format `"2030-07-20T20:50:04Z"`.

24. **Refund is only available for Direct Debit and Qris**. VA does not support SnapBi refund.

25. **`withDebuglId()` uses lowercase L, not capital I**. The actual PHP method name is `withDebuglId` (letter "l"), not `withDebugId` (letter "I"). This is a known typo in the SDK source code.

26. **`urlParam` in Direct Debit is an array of arrays**. Even for a single URL entry, wrap it in an outer array:
    ```php
    'urlParam' => [['url' => '...', 'type' => 'PAY_RETURN', 'isDeeplink' => 'Y']]
    ```

## Subscription

26. **Requires saved token from initial charge**. For credit card: `saved_token_id` from first charge response. For gopay: link via tokenization API first.

27. **`start_time` format**: `"YYYY-MM-DD HH:mm:ss +0700"`.

## Transaction Actions

28. **`approve()` and `cancel()` return `status_code` string, NOT the full response**. From the source:

    ```php
    public static function approve($id) {
        return ApiRequestor::post(...)->status_code;  // e.g., "200"
    }
    public static function cancel($id) {
        return ApiRequestor::post(...)->status_code;  // e.g., "200"
    }
    ```

    Do NOT attempt `$result->order_id` on these - it will fail. All other Transaction methods (`status()`, `expire()`, `refund()`, etc.) return the full response object.

29. **`\Midtrans\Notification` is a convenience class**. It parses the POST JSON, extracts `transaction_id`, and calls `Transaction::status()`. It's not a cryptographic verification.

30. **`refund_key` must be unique**. Cannot reuse the same refund_key.

## PHP-Specific

31. **PHP version check**: The library throws Exception if PHP < 5.4.

32. **Required PHP extensions**: `ext-curl`, `ext-json`, `ext-openssl` (for SnapBi signatures). The entry point `Midtrans.php` checks for curl and json.

33. **No Composer? Require `Midtrans.php`**: Without autoloading, manually require `Midtrans.php` which requires all other files. Must be done before using any class.

34. **Composer PSR-4 mapping**:
    - `Midtrans\` → `Midtrans/` directory
    - `SnapBi\` → `SnapBi/` directory
    - If using Laravel, you may need `composer dumpautoload` after install.

35. **Notification response**: Always return HTTP 200 to Midtrans notification endpoint, or Midtrans will retry.

36. **`json_decode` failure**: If the API returns non-JSON, an Exception is thrown with the raw response body in the message.

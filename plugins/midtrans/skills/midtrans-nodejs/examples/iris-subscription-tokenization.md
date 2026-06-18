# Iris, Subscription, and Tokenization Examples (Node.js)

## Iris Disbursement API

Money disbursement to Indonesian bank accounts.

```js
const iris = new midtransClient.Iris({
  isProduction: false,
  serverKey: "YOUR_API_KEY",
});
```

### Methods

| Method                                  | Description                    |
| --------------------------------------- | ------------------------------ |
| `ping()`                                | Health check                   |
| `createBeneficiaries(param)`            | Register beneficiary account   |
| `updateBeneficiaries(aliasName, param)` | Update beneficiary             |
| `getBeneficiaries()`                    | List all beneficiaries         |
| `createPayouts(param)`                  | Create payout                  |
| `approvePayouts(param)`                 | Approve payout                 |
| `rejectPayouts(param)`                  | Reject payout                  |
| `getPayoutDetails(referenceNo)`         | Get payout status              |
| `getTransactionHistory(param)`          | Statement/transaction history  |
| `getTopupChannels()`                    | List top-up channels           |
| `getBalance()`                          | Check Iris balance             |
| `getFacilitatorBankAccounts()`          | List facilitator bank accounts |
| `getFacilitatorBalance(bankAccountId)`  | Facilitator account balance    |
| `getBeneficiaryBanks()`                 | List supported banks           |
| `validateBankAccount(param)`            | Validate bank account number   |

```js
// Create beneficiary
await iris.createBeneficiaries({
  name: "Budi Susanto",
  account: "0611101146",
  bank: "bca",
  alias_name: "budisusantoo",
  email: "budi@example.com",
});

// Create payout
await iris.createPayouts({
  payouts: [
    { beneficiary_name: "budisusantoo", amount: "100000", notes: "Payment" },
  ],
});

// Validate account
await iris.validateBankAccount({ bank: "bca", account: "0611101146" });
```

## Subscription API

Recurring payments using saved card tokens or linked gopay accounts.

```js
// Create subscription (credit card)
const param = {
  name: "MONTHLY_2021",
  amount: "14000",
  currency: "IDR",
  payment_type: "credit_card",
  token: "SAVED_CARD_TOKEN_ID", // from initial charge response
  schedule: {
    interval: 1,
    interval_unit: "month",
    max_interval: 12,
    start_time: "2025-11-25 07:25:01 +0700",
  },
  metadata: { description: "Recurring payment for A" },
  customer_details: {
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "+62812345678",
  },
};

await coreApi.createSubscription(param);
await coreApi.getSubscription(subscriptionId);
await coreApi.enableSubscription(subscriptionId);
await coreApi.disableSubscription(subscriptionId);
await coreApi.updateSubscription(subscriptionId, updateParam);
```

## Tokenization API

Link/unlink gopay account for subscription/recurring use.

```js
// Link gopay account
const param = {
  payment_type: "gopay",
  gopay_partner: {
    phone_number: "81212345678",
    country_code: "62",
    redirect_url: "https://www.mysite.com/gopay-callback",
  },
};

const linkResponse = await coreApi.linkPaymentAccount(param);
await coreApi.getPaymentAccount(accountId);
await coreApi.unlinkPaymentAccount(accountId);
```

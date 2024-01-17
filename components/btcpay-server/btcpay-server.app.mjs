import { axios } from "@pipedream/platform";

export default {
  type: "app",
  app: "invoice_app", // The app name should be generic as it's not specified in the prompt
  version: "0.0.{{ts}}",
  propDefinitions: {
    storeId: {
      type: "string",
      label: "Store ID",
      description: "The unique identifier for the store",
    },
    invoiceId: {
      type: "string",
      label: "Invoice ID",
      description: "The unique identifier for the invoice",
      optional: true,
    },
    amount: {
      type: "string",
      label: "Amount",
      description: "The amount for the payment request",
    },
    currency: {
      type: "string",
      label: "Currency",
      description: "The currency for the payment request",
    },
    expiryDate: {
      type: "string",
      label: "Expiry Date",
      description: "The expiry date for the payment request",
      optional: true,
    },
    customMetadata: {
      type: "object",
      label: "Custom Metadata",
      description: "Custom metadata for the payment request",
      optional: true,
    },
    custodianAccountId: {
      type: "string",
      label: "Custodian Account ID",
      description: "The unique identifier for the custodian account",
    },
    storeWalletId: {
      type: "string",
      label: "Store Wallet ID",
      description: "The unique identifier for the store wallet",
    },
    paymentMethod: {
      type: "string",
      label: "Payment Method",
      description: "The payment method for the withdrawal",
    },
    withdrawalAmount: {
      type: "string",
      label: "Withdrawal Amount",
      description: "The amount to withdraw to the store wallet",
    },
  },
  methods: {
    _baseUrl() {
      return "https://api.invoiceapp.com"; // Base URL should be generic as it's not specified in the prompt
    },
    async _makeRequest(opts = {}) {
      const {
        $ = this,
        method = "GET",
        path,
        headers,
        ...otherOpts
      } = opts;
      return axios($, {
        ...otherOpts,
        method,
        url: this._baseUrl() + path,
        headers: {
          ...headers,
          "Authorization": `Bearer ${this.$auth.oauth_access_token}`,
        },
      });
    },
    async createInvoice({
      storeId, invoiceId, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: "/invoices",
        data: {
          store_id: storeId,
          invoice_id: invoiceId,
        },
        ...opts,
      });
    },
    async checkInvoiceSettled({
      storeId, invoiceId, ...opts
    }) {
      return this._makeRequest({
        path: `/invoices/${invoiceId}/settled`,
        params: {
          store_id: storeId,
        },
        ...opts,
      });
    },
    async receivePayment({
      storeId, invoiceId, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: "/payments/receive",
        data: {
          store_id: storeId,
          invoice_id: invoiceId,
        },
        ...opts,
      });
    },
    async generatePaymentRequest({
      amount, currency, expiryDate, customMetadata, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: "/payments/request",
        data: {
          amount: amount,
          currency: currency,
          expiry_date: expiryDate,
          metadata: customMetadata,
        },
        ...opts,
      });
    },
    async withdrawFunds({
      custodianAccountId, storeWalletId, paymentMethod, withdrawalAmount, ...opts
    }) {
      return this._makeRequest({
        method: "POST",
        path: "/withdrawals",
        data: {
          custodian_account_id: custodianAccountId,
          store_wallet_id: storeWalletId,
          payment_method: paymentMethod,
          withdrawal_amount: withdrawalAmount,
        },
        ...opts,
      });
    },
    async fetchBalance({
      storeWalletId, ...opts
    }) {
      return this._makeRequest({
        path: `/wallets/${storeWalletId}/balance`,
        ...opts,
      });
    },
  },
};

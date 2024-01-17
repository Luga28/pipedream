import invoiceApp from "../../invoice_app.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "invoice_app-create-payment-request",
  name: "Create Payment Request",
  description: "Generates a new payment request for a user. [See the documentation](https://docs.invoiceapp.com/api/payment-request)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    invoiceApp,
    amount: {
      propDefinition: [
        invoiceApp,
        "amount",
      ],
    },
    currency: {
      propDefinition: [
        invoiceApp,
        "currency",
      ],
    },
    expiryDate: {
      propDefinition: [
        invoiceApp,
        "expiryDate",
        (c) => ({
          storeId: c.storeId,
        }), // Assuming storeId is a required prop for expiryDate options
      ],
      optional: true,
    },
    customMetadata: {
      propDefinition: [
        invoiceApp,
        "customMetadata",
      ],
      optional: true,
    },
  },
  async run({ $ }) {
    const response = await this.invoiceApp.generatePaymentRequest({
      amount: this.amount,
      currency: this.currency,
      expiryDate: this.expiryDate,
      customMetadata: this.customMetadata,
    });

    $.export("$summary", `Successfully created payment request with amount ${this.amount} ${this.currency}`);
    return response;
  },
};

import invoiceApp from "../../invoice_app.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "invoice_app-withdraw-from-custodian-account",
  name: "Withdraw from Custodian Account",
  description: "Withdraws funds from a custodian account to a store wallet using a specified payment method. [See the documentation](https://docs.invoiceapp.com/#withdrawals)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    invoiceApp,
    custodianAccountId: {
      propDefinition: [
        invoiceApp,
        "custodianAccountId",
      ],
    },
    storeWalletId: {
      propDefinition: [
        invoiceApp,
        "storeWalletId",
      ],
    },
    paymentMethod: {
      propDefinition: [
        invoiceApp,
        "paymentMethod",
      ],
    },
    withdrawalAmount: {
      propDefinition: [
        invoiceApp,
        "withdrawalAmount",
      ],
    },
  },
  async run({ $ }) {
    const response = await this.invoiceApp.withdrawFunds({
      custodianAccountId: this.custodianAccountId,
      storeWalletId: this.storeWalletId,
      paymentMethod: this.paymentMethod,
      withdrawalAmount: this.withdrawalAmount,
    });

    $.export("$summary", `Successfully withdrew ${this.withdrawalAmount} using ${this.paymentMethod} payment method`);
    return response;
  },
};

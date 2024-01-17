import invoiceApp from "../../invoice_app.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "invoice_app-get-store-on-chain-wallet-balance",
  name: "Get Store On-Chain Wallet Balance",
  description: "Fetches the balance of your on-chain store wallet. [See the documentation](https://docs.invoiceapp.com/api/#wallets)",
  version: "0.0.{{ts}}",
  type: "action",
  props: {
    invoiceApp,
    storeWalletId: {
      propDefinition: [
        invoiceApp,
        "storeWalletId",
      ],
    },
  },
  async run({ $ }) {
    const response = await this.invoiceApp.fetchBalance({
      storeWalletId: this.storeWalletId,
    });

    $.export("$summary", `Fetched balance for store wallet ID: ${this.storeWalletId}`);
    return response;
  },
};

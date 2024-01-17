import { axios } from "@pipedream/platform";
import invoiceApp from "../../invoice_app.app.mjs";

export default {
  key: "btcpay-server-invoice-settled-instant",
  name: "Invoice Settled Instant",
  description: "Emits a new event when an invoice is fully paid and has enough confirmations on the blockchain, making the invoice settled. [See the documentation](https://docs.invoiceapp.com/webhooks)",
  version: "0.0.{{ts}}",
  type: "source",
  dedupe: "unique",
  props: {
    invoiceApp,
    storeId: {
      propDefinition: [
        invoiceApp,
        "storeId",
      ],
    },
    invoiceId: {
      propDefinition: [
        invoiceApp,
        "invoiceId",
        (c) => ({
          storeId: c.storeId,
        }), // Include storeId as context for the invoiceId prop
      ],
      optional: true,
    },
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    db: "$.service.db",
  },
  hooks: {
    async deploy() {
      // Fetch the most recent invoices up to 50 and emit the settled ones
      const storeId = this.storeId;
      const invoices = await this.invoiceApp.createInvoice({
        storeId,
      });
      const recentInvoices = invoices.slice(0, 50);
      for (const invoice of recentInvoices) {
        if (invoice.settled) {
          this.$emit(invoice, {
            id: invoice.id,
            summary: `Invoice ${invoice.id} is settled`,
            ts: Date.parse(invoice.updatedAt),
          });
        }
      }
    },
    async activate() {
      // Typically, you would create a webhook here, but the prompt doesn't provide details for this
    },
    async deactivate() {
      // Typically, you would delete a webhook here, but the prompt doesn't provide details for this
    },
  },
  async run(event) {
    const { body } = event;
    // Assuming the body contains the invoice information and a settled status
    if (body.settled) {
      this.$emit(body, {
        id: body.id,
        summary: `Invoice ${body.id} is settled`,
        ts: Date.parse(body.updatedAt) || +new Date(),
      });
    } else {
      this.http.respond({
        status: 204,
        body: "Invoice not settled",
      });
    }
  },
};

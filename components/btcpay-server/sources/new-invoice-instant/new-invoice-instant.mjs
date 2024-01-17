import invoiceApp from "../../invoice_app.app.mjs";
import { axios } from "@pipedream/platform";

export default {
  key: "invoice_app-new-invoice-instant",
  name: "New Invoice Instant",
  description: "Emits an event for each new invoice created instantly. [See the documentation](https://docs.invoiceapp.com/api/invoices)",
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
        }),
      ],
      optional: true,
    },
    db: "$.service.db",
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
  },
  hooks: {
    async deploy() {
      const invoices = await this.invoiceApp.createInvoice({
        storeId: this.storeId,
        limit: 50,
      });
      invoices.slice(-50).forEach((invoice) => {
        this.$emit(invoice, {
          id: invoice.id,
          summary: `New invoice ${invoice.id} created`,
          ts: Date.parse(invoice.createdAt),
        });
      });
    },
    async activate() {
      const webhookId = await this.invoiceApp.createInvoice({
        storeId: this.storeId,
      });
      this.db.set("webhookId", webhookId);
    },
    async deactivate() {
      const webhookId = this.db.get("webhookId");
      await this.invoiceApp.deleteWebhook(webhookId);
    },
  },
  async run(event) {
    const signatureValid = this.invoiceApp.verifySignature(event);
    if (!signatureValid) {
      this.http.respond({
        status: 401,
        body: "Unauthorized",
      });
      return;
    }

    const invoice = event.body;
    this.$emit(invoice, {
      id: invoice.id,
      summary: `New invoice created with ID ${invoice.id}`,
      ts: invoice.createdAt
        ? Date.parse(invoice.createdAt)
        : new Date().getTime(),
    });
  },
};

import invoiceApp from "../../invoice_app.app.mjs";
import { axios } from "@pipedream/platform";
import crypto from "crypto";

export default {
  key: "btcpay-server-payment-received-instant",
  name: "Payment Received (Instant)",
  description: "Emit new event when a full or partial payment was received. The payment is not settled yet. [See the documentation]()", // Placeholder for documentation link
  version: "0.0.{{ts}}",
  type: "source",
  dedupe: "unique",
  props: {
    invoiceApp,
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    db: "$.service.db",
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
  },
  hooks: {
    async deploy() {
      const payments = await this.invoiceApp.getPayments({
        storeId: this.storeId,
      });
      payments.slice(-50).reverse()
        .forEach((payment) => {
          this.$emit(payment, {
            id: payment.id,
            summary: `Payment received for invoice ${payment.invoiceId}`,
            ts: Date.parse(payment.timestamp),
          });
        });
    },
    async activate() {
      // Assuming there's a method to subscribe to payment events
      const webhookId = await this.invoiceApp.subscribeToPayments({
        storeId: this.storeId,
      });
      this.db.set("webhookId", webhookId);
    },
    async deactivate() {
      const webhookId = this.db.get("webhookId");
      if (webhookId) {
        await this.invoiceApp.unsubscribeFromPayments({
          webhookId,
        });
      }
    },
  },
  async run(event) {
    const { body: payment } = event;
    const signatureValid = this.verifySignature(event.headers, event.body);
    if (!signatureValid) {
      this.http.respond({
        status: 401,
        body: "Invalid signature",
      });
      return;
    }

    if (payment.storeId === this.storeId && (!this.invoiceId || payment.invoiceId === this.invoiceId)) {
      const settled = await this.invoiceApp.checkInvoiceSettled({
        storeId: this.storeId,
        invoiceId: payment.invoiceId,
      });
      if (!settled) {
        this.$emit(payment, {
          id: payment.id,
          summary: `Payment received for invoice ${payment.invoiceId}`,
          ts: Date.parse(payment.timestamp),
        });
      }
    } else {
      this.http.respond({
        status: 404,
        body: "Payment not related to the configured store or invoice",
      });
    }
  },
  methods: {
    verifySignature(headers, body) {
      const secretKey = this.invoiceApp.$auth.oauth_access_token;
      const providedSignature = headers["x-signature"];
      const computedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(JSON.stringify(body))
        .digest("hex");
      return providedSignature === computedSignature;
    },
  },
};

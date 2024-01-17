import formcan from "../../formcan.app.mjs";
import { axios } from "@pipedream/platform";
import crypto from "crypto";

export default {
  key: "formcan-new-submission-instant",
  name: "New Submission Instant",
  description: "Emit new event when a user submits a form. [See the documentation](https://api.docs.formcan.com/)",
  version: "0.0.{{ts}}",
  type: "source",
  dedupe: "unique",
  props: {
    formcan,
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    db: "$.service.db",
    formId: {
      propDefinition: [
        formcan,
        "formId",
      ],
    },
    formData: {
      propDefinition: [
        formcan,
        "formData",
        (c) => ({
          formId: c.formId,
        }),
      ],
      optional: true,
    },
    submissionTime: {
      propDefinition: [
        formcan,
        "submissionTime",
      ],
      optional: true,
    },
  },
  hooks: {
    async deploy() {
      const formId = this.formId;
      const submissions = await this.formcan.getFormFields({
        formId,
      });
      // If the API doesn't return the submissions in order, sort them by created_at
      submissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const recentSubmissions = submissions.slice(0, 50);
      for (const submission of recentSubmissions) {
        this.$emit(submission, {
          id: submission.id,
          summary: `New submission for form ${formId}`,
          ts: Date.parse(submission.created_at),
        });
      }
    },
    async activate() {
      // Placeholder for creating a webhook subscription
      // Actual API call to create a webhook is not provided in instructions
      const webhookId = "your-webhook-id"; // Replace with actual logic to create a webhook
      this.db.set("webhookId", webhookId);
    },
    async deactivate() {
      const webhookId = this.db.get("webhookId");
      // Replace with actual logic to delete a webhook
      // e.g., await this.formcan.deleteWebhook({ webhookId });
    },
  },
  async run(event) {
    const { body } = event;
    const signatureIsValid = this.validateWebhookSignature(event);

    if (!signatureIsValid) {
      this.http.respond({
        status: 401,
        body: "Unauthorized",
      });
      return;
    }

    this.$emit(body, {
      id: body.id || `${body.formId}-${Date.now()}`,
      summary: `New submission for form ${this.formId}`,
      ts: body.submissionTime
        ? Date.parse(body.submissionTime)
        : Date.now(),
    });

    // Respond to the webhook
    this.http.respond({
      status: 200,
      body: "OK",
    });
  },
  methods: {
    validateWebhookSignature(event) {
      // Assuming the source requires validation or signature checking
      // Implement the actual validation logic as per Formcan's documentation
      const computedSignature = crypto.createHmac("sha256", this.formcan.$auth.oauth_access_token).update(JSON.stringify(event.body))
        .digest("base64");
      return computedSignature === event.headers["x-signature"];
    },
  },
};
